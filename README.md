# Inventory & Order Management System

Production-ready technical assessment project with:

- React frontend
- Python FastAPI backend
- PostgreSQL database
- Dockerfiles for frontend and backend
- Docker Compose orchestration
- Business rules for unique SKU/email, non-negative stock, inventory reduction, automatic totals, and error handling

## Run Locally With Docker

1. Copy `.env.example` to `.env`.
2. Change `POSTGRES_PASSWORD` in `.env`.
3. Run:

```bash
docker compose up --build
```

For local Docker usage, do not add `DATABASE_URL` to `.env`. The backend builds the correct database URL from `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` automatically, including passwords that contain symbols.

## Fix Password Authentication Errors

If you see this error:

```text
FATAL: password authentication failed for user "inventory_user"
```

It means Docker is probably reusing an old PostgreSQL data volume that was created with a different password.

Fast reset:

```powershell
.\reset-local-database.ps1
```

Manual reset:

```powershell
docker compose down -v
docker volume rm stockflow_postgres_data_v2
docker compose up --build
```

This deletes only the local development database volume and recreates it with the password from `.env`.

Open:

- Frontend: http://localhost:8080
- Backend API docs: http://localhost:8000/docs
- Backend health check: http://localhost:8000/health

## API Endpoints

Products:

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `PATCH /products/{id}/stock`
- `DELETE /products/{id}`

## Extra Features Added

- Search products and customers instantly from the UI.
- Sort products by stock, price, and name.
- Dashboard low-stock watchlist.
- Clickable dashboard summary cards that jump to products, customers, orders, or low-stock items.
- Separate in-app pages for dashboard, products, customers, and orders.
- Indian rupee currency formatting across product, dashboard, and order views.
- Order dates shown in the order list and order details modal.
- Search and filter controls in the Orders page.
- Click any customer row to see that customer's orders.
- Quick restock controls without opening the product editor.
- Multi-item order form with live total estimate.
- Order detail modal for reviewing customer, line items, and totals.
- Responsive sidebar/navigation and improved mobile table handling.

## Frontend Structure

The React frontend uses a component-based architecture:

- `src/main.jsx`: React entry point only.
- `src/App.jsx`: app state, API actions, and page composition.
- `src/api/client.js`: reusable backend request helper.
- `src/components/`: feature sections plus shared UI helpers in `common.jsx`.
- `src/styles.css`: CSS import hub.
- `src/styles/`: split CSS files for base, layout, components, and responsive rules.

Customers:

- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`

Orders:

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

Dashboard:

- `GET /dashboard`

## Deployment Notes

You need personal accounts for the final public URLs requested by the assessment.

Recommended free path:

1. Push this folder to GitHub.
2. Create a PostgreSQL database on Render or Railway.
3. Deploy `backend/` to Render, Railway, or Fly.io.
4. Set backend environment variables:
   - `DATABASE_URL`
   - `CORS_ORIGINS` with your frontend URL
5. Build and push backend Docker image to Docker Hub:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-api:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-api:latest
```

6. Deploy `frontend/` to Vercel or Netlify.
7. Set frontend environment variable:
   - `VITE_API_URL` with your live backend URL

## Submission Checklist

- GitHub repository link
- Docker Hub backend image link
- Live frontend deployment URL
- Live backend API URL
