# API Documentation

## Overview

The Idurar ERP CRM API is built with Node.js, Express, and MongoDB. It provides RESTful endpoints for managing business operations including clients, invoices, quotes, payments, and more.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Clients

#### Get All Clients
```
GET /client/list
```

#### Get Client by ID
```
GET /client/read/:id
```

#### Create Client
```
POST /client/create
```

**Body:**
```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+1234567890",
  "country": "United States",
  "address": "123 Main St"
}
```

#### Update Client
```
PATCH /client/update/:id
```

#### Delete Client
```
DELETE /client/delete/:id
```

#### Search Clients
```
GET /client/search?search=search_term
```

### Invoices

#### Get All Invoices
```
GET /invoice/list
```

#### Get Invoice by ID
```
GET /invoice/read/:id
```

#### Create Invoice
```
POST /invoice/create
```

**Body:**
```json
{
  "client": "client_id",
  "date": "2024-01-01",
  "expiredDate": "2024-02-01",
  "items": [
    {
      "itemName": "Product Name",
      "description": "Product description",
      "quantity": 1,
      "price": 100,
      "total": 100
    }
  ],
  "taxRate": 10,
  "subTotal": 100,
  "taxTotal": 10,
  "total": 110
}
```

#### Update Invoice
```
PATCH /invoice/update/:id
```

#### Delete Invoice
```
DELETE /invoice/delete/:id
```

#### Send Invoice Email
```
POST /invoice/mail
```

### Quotes

#### Get All Quotes
```
GET /quote/list
```

#### Get Quote by ID
```
GET /quote/read/:id
```

#### Create Quote
```
POST /quote/create
```

#### Update Quote
```
PATCH /quote/update/:id
```

#### Delete Quote
```
DELETE /quote/delete/:id
```

#### Convert Quote to Invoice
```
GET /quote/convert/:id
```

#### Send Quote Email
```
POST /quote/mail
```

### Payments

#### Get All Payments
```
GET /payment/list
```

#### Get Payment by ID
```
GET /payment/read/:id
```

#### Create Payment
```
POST /payment/create
```

**Body:**
```json
{
  "client": "client_id",
  "invoice": "invoice_id",
  "amount": 100,
  "paymentMode": "payment_mode_id",
  "ref": "REF123",
  "description": "Payment description",
  "date": "2024-01-01"
}
```

#### Update Payment
```
PATCH /payment/update/:id
```

#### Delete Payment
```
DELETE /payment/delete/:id
```

#### Send Payment Email
```
POST /payment/mail
```

### Payment Modes

#### Get All Payment Modes
```
GET /paymentmode/list
```

### Taxes

#### Get All Taxes
```
GET /taxes/list
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## CORS

The API supports CORS for cross-origin requests. Allowed origins can be configured in the environment variables. 