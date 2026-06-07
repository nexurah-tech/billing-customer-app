# NexBill REST API Reference Guide

All REST operations request JSON payloads and return JSON payloads. Secure dashboard endpoints require authentication tokens passed via HTTP cookies or Bearer tokens.

---

## Authentication & Headers

Secure REST requests require authentication:
- **Authorization Header**: `Authorization: Bearer <JWT_Token>`
- **Cookie Header**: `Cookie: token=<JWT_Token>`

### Standard API Response Wrapper
All successful responses return a `success: true` payload:
```json
{
  "success": true,
  "data": { ... }
}
```
Errors return an HTTP status matching the code, along with a `success: false` payload:
```json
{
  "success": false,
  "error": "Error details message."
}
```

---

## 1. Authentication Endpoints

### Register Store Owner (`POST /api/auth/signup`)
Creates a new `Shop` and primary `User` record:
- **Request Body**:
  ```json
  {
    "name": "Arjun Store",
    "email": "arjun@example.com",
    "phone": "9876543210",
    "address": "123 Main St, Mumbai",
    "password": "secretpassword123"
  }
  ```
- **Response `201 Created`**: Returns shop credentials and session token:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "name": "Arjun Store", "email": "arjun@example.com", "role": "owner" }
    }
  }
  ```

### Login Cashier Session (`POST /api/auth/login`)
- **Request Body**:
  ```json
  {
    "email": "arjun@example.com",
    "password": "secretpassword123"
  }
  ```
- **Response `200 OK`**: Returns valid JWT token.

### Get Session & Heartbeat Status (`GET /api/auth/status`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "isAuthenticated": true,
      "user": { "id": "...", "name": "Arjun Store", "role": "owner" },
      "shop": { "id": "...", "name": "Arjun Store", "subscriptionStatus": "active" }
    }
  }
  ```
  *(Calling this route automatically updates the shop's `lastActiveAt` tracker value to show the store is online)*.

---

## 2. Product Catalogue Endpoints

### Fetch Inventory Items (`GET /api/products`)
Retrieves store stock list. Supports search queries, category filters, and pagination.
- **Query Parameters**:
  - `page`: Page index (default: `1`).
  - `limit`: Items count page (default: `10`).
  - `search`: Filter matching title or SKU (optional).
  - `category`: Filter matching Category ID (optional).
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "_id": "6a219b26e085b1c92eec3bc8",
          "name": "Coca Cola 500ml",
          "sku": "COKE500",
          "unit": "pcs",
          "unitPrice": 45,
          "costPrice": 35,
          "stock": 100,
          "reorderLevel": 15,
          "taxApplicable": true,
          "category": { "_id": "...", "name": "Beverages" }
        }
      ],
      "pagination": { "total": 1, "page": 1, "limit": 10, "pages": 1 }
    }
  }
  ```

### Register Single Product (`POST /api/products`)
- **Request Body**:
  ```json
  {
    "name": "Loose Basmati Rice",
    "sku": "BASMATILOOSE",
    "category": "6a219b26e085b1c92eec3bb8",
    "unit": "kg",
    "unitPrice": 85.50,
    "costPrice": 72.00,
    "stock": 150.75,
    "reorderLevel": 20,
    "taxApplicable": false,
    "description": "Premium loose rice"
  }
  ```
- **Response `201 Created`**: Returns created product.

### Bulk Import Inventory (`POST /api/products/bulk`)
Saves an array of spreadsheet products in a single database execution. Non-existent categories are created on-the-fly. Duplicated database SKUs are skipped.
- **Request Body**:
  ```json
  {
    "products": [
      {
        "name": "Pepsi 500ml",
        "sku": "PEPSI500",
        "category": "Beverages",
        "unit": "pcs",
        "unitPrice": 40,
        "costPrice": 32,
        "stock": 80,
        "reorderLevel": 10,
        "taxApplicable": true
      }
    ]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "count": 1,
      "categoriesCreated": 0,
      "skippedCount": 0,
      "message": "Successfully imported 1 products and created 0 new categories."
    }
  }
  ```

---

## 3. Invoices & Checkout Endpoints

### List Invoices (`GET /api/invoices`)
- **Query Parameters**:
  - `page`: Page index (default: `1`).
  - `limit`: Items limit (default: `50`).
  - `status`: Payment state filter (`'paid'`, `'unpaid'`, `'partial'`).
  - `customerId`: Customer ID filter (optional).

### Finalize POS Ticket (`POST /api/invoices`)
Submits a ticket sales order, deducts stock, and saves the invoice.
- **Request Body**:
  ```json
  {
    "customerId": "6a219b26e085b1c92eec3bc7",
    "items": [
      {
        "productId": "6a219b26e085b1c92eec3bc8",
        "quantity": 2.5
      }
    ],
    "paymentMethod": "cash",
    "paymentStatus": "paid",
    "discountAmount": 10.00,
    "notes": "Fast cashier checkout"
  }
  ```
- **Response `201 Created`**: Returns populated invoice details with calculated subtotals, taxes, and totals.

---

## 4. Subscriptions & Config Endpoints

### Get Shop Subscription Status (`GET /api/shop/subscription`)
Provides subscription states, payment audit history logs, and central admin configurator details.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "subscription": {
        "status": "trialing",
        "plan": "free_trial",
        "expiresAt": "2026-06-21T11:24:50.000Z",
        "trialEndsAt": "2026-06-21T11:24:50.000Z",
        "lastPaymentDate": null
      },
      "payments": [],
      "config": {
        "paymentQrCodeUrl": "https://example.com/payment-qr.png",
        "whatsappNumber": "+919600950190"
      }
    }
  }
  ```
