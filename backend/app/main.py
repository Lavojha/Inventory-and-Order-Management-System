from decimal import Decimal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from . import models, schemas
from .database import Base, engine, get_db


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in __import__("os").getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def product_to_out(product: models.Product) -> schemas.ProductOut:
    return schemas.ProductOut.model_validate(product)


def order_to_out(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=[
            schemas.OrderItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                sku=item.product.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/products", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    product = models.Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Product SKU already exists") from exc
    db.refresh(product)
    return product


@app.get("/products", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()


@app.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.model_dump().items():
        setattr(product, key, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Product SKU already exists") from exc
    db.refresh(product)
    return product


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Product is used by an order") from exc


@app.patch("/products/{product_id}/stock", response_model=schemas.ProductOut)
def update_product_stock(product_id: int, payload: schemas.StockAdjustment, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.quantity_in_stock = payload.quantity_in_stock
    db.commit()
    db.refresh(product)
    return product


@app.post("/customers", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    customer = models.Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Customer email already exists") from exc
    db.refresh(customer)
    return customer


@app.get("/customers", response_model=list[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).order_by(models.Customer.id.asc()).all()


@app.get("/customers/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@app.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()


@app.post("/orders", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    quantities_by_product: dict[int, int] = {}
    for item in payload.items:
        quantities_by_product[item.product_id] = quantities_by_product.get(item.product_id, 0) + item.quantity

    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(quantities_by_product.keys()))
        .with_for_update()
        .all()
    )
    products_by_id = {product.id: product for product in products}
    missing = set(quantities_by_product) - set(products_by_id)
    if missing:
        raise HTTPException(status_code=404, detail=f"Product not found: {sorted(missing)[0]}")

    for product_id, requested_quantity in quantities_by_product.items():
        product = products_by_id[product_id]
        if product.quantity_in_stock < requested_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for {product.name}. Available: {product.quantity_in_stock}",
            )

    order = models.Order(customer_id=customer.id, total_amount=Decimal("0.00"))
    db.add(order)
    db.flush()

    total = Decimal("0.00")
    for product_id, quantity in quantities_by_product.items():
        product = products_by_id[product_id]
        unit_price = Decimal(product.price)
        line_total = unit_price * quantity
        total += line_total
        product.quantity_in_stock -= quantity
        db.add(
            models.OrderItem(
                order_id=order.id,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order.total_amount = total
    db.commit()
    return get_order(order.id, db)


@app.get("/orders", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.customer), joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .order_by(models.Order.id.desc())
        .all()
    )
    return [order_to_out(order) for order in orders]


@app.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.customer), joinedload(models.Order.items).joinedload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_out(order)


@app.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for item in order.items:
        product = db.get(models.Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity
    db.delete(order)
    db.commit()


@app.get("/dashboard", response_model=schemas.DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.quantity_in_stock <= 5)
        .order_by(models.Product.quantity_in_stock.asc(), models.Product.name.asc())
        .all()
    )
    return schemas.DashboardOut(
        total_products=db.query(models.Product).count(),
        total_customers=db.query(models.Customer).count(),
        total_orders=db.query(models.Order).count(),
        low_stock_products=[product_to_out(product) for product in low_stock],
    )
