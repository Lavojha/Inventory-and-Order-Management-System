from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, condecimal


Money = condecimal(max_digits=10, decimal_places=2, ge=0)


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    sku: str = Field(..., min_length=1, max_length=64)
    price: Money
    quantity_in_stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class StockAdjustment(BaseModel):
    quantity_in_stock: int = Field(..., ge=0)


class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=160)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=40)


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemOut]

    class Config:
        from_attributes = True


class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductOut]
