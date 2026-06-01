# Inventory & Order Management System

A full-stack Inventory & Order Management System built with React, FastAPI, PostgreSQL, and Docker.

This project was developed as a technical assessment to demonstrate full-stack development skills, REST API design, database management, Docker containerization, and implementation of real-world business rules.

## Live Demo

### Frontend

https://inventory-and-order-management-system-2w0io78s6.vercel.app

### Backend API

https://inventory-backend-9j10.onrender.com

### API Documentation (Swagger)

https://inventory-backend-9j10.onrender.com/docs

### Health Check

https://inventory-backend-9j10.onrender.com/health

---

## Tech Stack

### Frontend

* React (Vite)
* JavaScript
* CSS

### Backend

* FastAPI
* SQLAlchemy
* Pydantic

### Database

* PostgreSQL

### DevOps

* Docker
* Docker Compose

---

## Features

### Product Management

* Create, update, delete, and view products
* Unique SKU validation
* Prevent negative stock values
* Quick stock restock controls
* Product search and sorting

### Customer Management

* Create and manage customers
* Unique email validation
* View customer order history

### Order Management

* Create multi-item orders
* Automatic order total calculation
* Inventory reduction after order placement
* Order details modal with line items
* Order search and filtering

### Dashboard

* Product, customer, and order summaries
* Low-stock watchlist
* Clickable dashboard cards for quick navigation

### UI Improvements

* Responsive design
* Mobile-friendly tables
* Search functionality across products and customers
* Indian Rupee (₹) currency formatting
* Order dates displayed throughout the application

---

## Environment Variables

Create a `.env` file in the project root.

```env
POSTGRES_DB=inventory_db
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password

CORS_ORIGINS=http://localhost:5173,http://localhost:8080

VITE_API_URL=http://localhost:8000
```

### Important

When running with Docker Compose locally, do **not** add `DATABASE_URL` to the `.env` file.

The backend automatically builds the PostgreSQL connection string using:

* POSTGRES_DB
* POSTGRES_USER
* POSTGRES_PASSWORD

This works correctly even when the password contains special characters.

---

## Running Locally with Docker

```bash
docker compose up --build
```

### Local URLs

Frontend:

```text
http://localhost:8080
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

Health Check:

```text
http://localhost:8000/health
```

---

## API Endpoints

### Products

```http
POST   /products
GET    /products
GET    /products/{id}
PUT    /products/{id}
PATCH  /products/{id}/stock
DELETE /products/{id}
```

### Customers

```http
POST   /customers
GET    /customers
GET    /customers/{id}
DELETE /customers/{id}
```

### Orders

```http
POST   /orders
GET    /orders
GET    /orders/{id}
DELETE /orders/{id}
```

### Dashboard

```http
GET /dashboard
```

---

## Deployment

### Backend (Render)

Environment Variables:

```env
DATABASE_URL=<your_render_postgres_url>
CORS_ORIGINS=https://inventory-and-order-management-system-2w0io78s6.vercel.app
```

### Frontend (Vercel)

Environment Variable:

```env
VITE_API_URL=https://inventory-backend-9j10.onrender.com
```

---

## What I Focused On

* Clean API design
* Reusable React components
* Business rule enforcement
* Error handling and validation
* Responsive UI/UX
* Docker-based local development
* Maintainable project structure

---

## Future Improvements

* Authentication and authorization
* Role-based access control
* Product categories
* Inventory transaction history
* Pagination
* Automated tests
* Export orders to CSV/PDF

---

## Author

Developed by **Lavlesh Ojha** as a full-stack technical assessment project using React, FastAPI, PostgreSQL, and Docker.

   - `VITE_API_URL` with your live backend URL

