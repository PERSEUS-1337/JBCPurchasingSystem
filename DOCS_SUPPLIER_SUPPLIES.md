# Supplier & Supplies Module Documentation

## 1) Purpose

This document is a standalone technical reference for the **Supplier** and **Supplies** modules of the JBC Purchasing System backend.

It covers:

- Module scope and boundaries
- Data models and validation rules
- API endpoints (current behavior)
- Known limitations in the current implementation

---

## 2) Module Scope

### 2.1 Supplier Module

The Supplier Module manages supplier profiles and status.

Core capabilities:

- Create supplier records
- Retrieve supplier list/details
- Search suppliers by multiple fields
- Update supplier profile
- Update supplier status
- Delete supplier records

### 2.2 Supplies Module

The Supplies Module manages supply catalog items and supplier pricing per item.

Core capabilities:

- Create supply items
- Retrieve supply list/details
- Search supplies by name
- Update supply profile fields
- Update supply status
- Delete supply items
- Manage supplier pricing per supply item

---

## 3) API Base Paths and Security

- Supplier base path: `/api/supplier`
- Supply base path: `/api/supply`
- Most endpoints require JWT authorization via `Authorization: Bearer <token>`
- Public health/probe endpoints in module routers:
  - `GET /api/supplier/hello`
  - `GET /api/supply/hello`

---

## 4) Data Model Summary

## 4.1 Supplier (`suppliers` collection)

Key fields:

- `supplierID` (string, unique, format: `SUP-<digits>`)
- `name` (string, required, unique)
- `contactNumbers` (string[], at least 1, regex-validated)
- `emails` (string[] email format)
- `contactPersons` (array of `{ name, contactNumber, email?, position? }`)
- `address` (string, required)
- `primaryTag` (string, required)
- `tags` (string[], at least 1)
- `documentation` (string[])
- `status` (enum: `Active | Inactive`, default `Active`)
- `supplies` (string[])
- `createdAt`, `updatedAt` (timestamps)

## 4.2 Supply (`supplies` collection)

Key fields:

- `supplyID` (string, unique, format: `SPL-<digits>`)
- `name` (string, required, unique)
- `description` (string, required)
- `categories` (string[], at least 1)
- `unitMeasure` (string, required)
- `supplierPricing` (array, at least 1):
  - `supplier` (ObjectId ref `Supplier`)
  - `price` (number)
  - `priceValidity` (date)
  - `unitQuantity` (number, min 1)
  - `unitPrice` (number)
- `specifications` (array, at least 1):
  - `specProperty` (string)
  - `specValue` (string | number)
- `status` (enum: `Active | Inactive`, default `Active`)
- `attachments` (string[])
- `createdAt`, `updatedAt` (timestamps)

---

## 5) Validation Rules

### 5.1 Supplier validation

- `supplierID` must match `^SUP-\d+$`
- `contactNumber` must match `^\+?\d{10,14}$`
- `supplierUpdateSchema` prevents updates to restricted fields (`supplierID`)
- `status` only allows `Active` or `Inactive`

### 5.2 Supply validation

- `supplyID` must match `^SPL-\d+$`
- `supplySchema` requires at least one `supplierPricing` and one `specification`
- Supplier pricing rule: `price === unitPrice * unitQuantity`
- `supplyUpdateSchema` blocks restricted fields in generic update:
  - `supplyID`, `createdAt`, `updatedAt`, `supplierPricing`, `suppliers`, `specifications`

---

## 6) Supplier API Endpoints

| Method | Route                             | Auth | Description                                     | Status                       |
| ------ | --------------------------------- | ---- | ----------------------------------------------- | ---------------------------- |
| GET    | `/`                               | Yes  | Get all suppliers                               | Implemented                  |
| GET    | `/search?query=...`               | Yes  | Search suppliers (name, tags, emails, contacts) | Implemented                  |
| GET    | `/:supplierID`                    | Yes  | Get supplier by supplierID                      | Implemented                  |
| POST   | `/`                               | Yes  | Create supplier                                 | Implemented                  |
| PATCH  | `/:supplierID`                    | Yes  | Update supplier profile                         | Implemented                  |
| PATCH  | `/:supplierID/status`             | Yes  | Update supplier status                          | Implemented                  |
| DELETE | `/:supplierID`                    | Yes  | Delete supplier                                 | Implemented                  |
| GET    | `/:supplierID/supplies`           | Yes  | Get supplies of a supplier                      | Declared but not implemented |
| POST   | `/:supplierID/supplies`           | Yes  | Add supply to supplier                          | Declared but not implemented |
| DELETE | `/:supplierID/supplies/:supplyID` | Yes  | Remove supply from supplier                     | Declared but not implemented |

Notes:

- Duplicate `supplierID` on create returns `400`.
- `GET /` returns `404` when no suppliers exist.
- Search requires `query` string; missing query returns `400`.

---

## 7) Supplies API Endpoints

| Method | Route                                   | Auth | Description                     | Status      |
| ------ | --------------------------------------- | ---- | ------------------------------- | ----------- |
| GET    | `/`                                     | Yes  | Get all supplies                | Implemented |
| GET    | `/search?query=...`                     | Yes  | Search supplies by name         | Implemented |
| GET    | `/:supplyID`                            | Yes  | Get supply by supplyID          | Implemented |
| POST   | `/`                                     | Yes  | Create supply item              | Implemented |
| PATCH  | `/:supplyID`                            | Yes  | Update supply fields            | Implemented |
| PATCH  | `/:supplyID/status`                     | Yes  | Update supply status            | Implemented |
| DELETE | `/:supplyID`                            | Yes  | Delete supply item              | Implemented |
| GET    | `/:supplyID/suppliers`                  | Yes  | List suppliers linked to supply | Implemented |
| POST   | `/:supplyID/supplier-pricing`           | Yes  | Add supplier pricing record     | Implemented |
| PATCH  | `/:supplyID/supplier-pricing/:supplier` | Yes  | Update supplier pricing record  | Implemented |
| DELETE | `/:supplyID/supplier-pricing/:supplier` | Yes  | Remove supplier pricing record  | Implemented |

Notes:

- `checkSupplyExists` middleware validates `:supplyID` and attaches `req.supply`.
- Generic supply update rejects `supplyID` updates.

---

## 8) Response Shape (Current)

Most supply endpoints use:

```json
{
  "message": "...",
  "data": {}
}
```

Error shape (supply utilities):

```json
{
  "message": "...",
  "error": "..."
}
```

Supplier controller responses are also JSON with `message`, usually with `data`.

---

## 9) Known Gaps / Current Limitations

1. Supplier-supply nested endpoints under `/api/supplier/:supplierID/supplies` are currently placeholders and do not send responses.
2. `PATCH /api/supply/:supplyID/status` does not use explicit request validation middleware in route layer.
3. Search behavior differs between modules:
   - Supplier search returns `400` when query is missing.
   - Supply search returns `200` with empty list when query is missing.

---

## 10) Sample Payloads

### 10.1 Create Supplier (`POST /api/supplier`)

```json
{
  "supplierID": "SUP-1001",
  "name": "ABC Industrial Supply",
  "contactNumbers": ["+639171234567"],
  "emails": ["purchasing@abc-industrial.com"],
  "contactPersons": [
    {
      "name": "Juan Dela Cruz",
      "contactNumber": "+639171111111",
      "email": "juan@abc-industrial.com",
      "position": "Sales Manager"
    }
  ],
  "address": "Makati City, Philippines",
  "primaryTag": "Electrical",
  "tags": ["Electrical", "Wiring", "Industrial"],
  "documentation": [],
  "status": "Active"
}
```

### 10.2 Create Supply (`POST /api/supply`)

```json
{
  "supplyID": "SPL-2001",
  "name": "THHN Copper Wire",
  "description": "600V THHN copper wire",
  "categories": ["Electrical", "Wiring"],
  "unitMeasure": "roll",
  "supplierPricing": [
    {
      "supplier": "65f2f58b7f4e3f7a4bb0e001",
      "price": 5000,
      "priceValidity": "2026-12-31",
      "unitQuantity": 10,
      "unitPrice": 500
    }
  ],
  "specifications": [
    {
      "specProperty": "Gauge",
      "specValue": "14 AWG"
    }
  ],
  "status": "Active",
  "attachments": []
}
```

---

## 11) Source Reference

Main implementation files:

- `backend/src/routes/supplierRouter.ts`
- `backend/src/routes/supplyRouter.ts`
- `backend/src/controllers/supplierController.ts`
- `backend/src/controllers/supplyController.ts`
- `backend/src/models/supplierModel.ts`
- `backend/src/models/supplyModel.ts`
- `backend/src/validators/supplierValidator.ts`
- `backend/src/validators/supplyValidator.ts`
