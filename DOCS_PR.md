# Purchase Request (PR) Module Documentation

## 1) Purpose

This document is a standalone technical reference for the **Purchase Request (PR)** module of the JBC Purchasing System backend.

It covers:

- Module scope and boundaries
- Data models and validation rules
- API endpoints (current behavior)
- Progress snapshot against `DOCS.md` PR functional requirements
- Known limitations in the current implementation

---

## 2) Module Scope

### 2.1 Purchase Request Module

The PR Module manages purchase request headers and lifecycle status.

Core capabilities:

- Create purchase requests
- Retrieve purchase request list/details
- Filter purchase requests by selected fields
- Update purchase request profile fields
- Update purchase request status
- Delete purchase requests

### 2.2 PR Item Submodule

The PR Item submodule manages line items nested under a purchase request.

Core capabilities:

- List items of a purchase request
- Add item to purchase request
- Update a specific PR item
- Remove a PR item
- Bulk replace all PR items for a purchase request

---

## 3) API Base Paths and Security

- PR base path: `/api/pr`
- Most endpoints require JWT authorization via `Authorization: Bearer <token>`
- Public health/probe endpoint in PR router:
  - `GET /api/pr/hello`

---

## 4) Data Model Summary

## 4.1 Purchase Request (`purchase_requests` collection)

Key fields:

- `prID` (string, unique)
- `projCode` (string, required)
- `projName` (string, required)
- `projClient` (string, required)
- `dateRequested` (date, default `Date.now`)
- `dateRequired` (date, required)
- `requestedBy` (string, required)
- `recommendedBy` (string, optional)
- `approvedBy` (string, optional in model)
- `prStatus` (enum: `Draft | Recommended | Submitted | Approved | Rejected | Cancelled`)
- `itemsRequested` (ObjectId[] refs to `PRItem`, required)
- `totalCost` (number, required)
- `justification` (string, optional)
- `rejectionReason` (string, optional)
- `cancellationReason` (string, optional)
- `changelog[]` (audit log entries for status/edit/item changes)
- `createdAt`, `updatedAt` (timestamps)

## 4.2 PR Item (`pr_items` collection)

Key fields:

- `prItemID` (string, unique)
- `prID` (string, required)
- `supplyID` (string, required)
- `supplierID` (string, required)
- `itemDescription` (string, required)
- `quantity` (number, required)
- `unitOfMeasurement` (string, required)
- `unitPrice` (number, required)
- `totalPrice` (number, derived from `quantity * unitPrice` on save)
- `deliveryAddress` (string, required)
- `createdAt`, `updatedAt` (timestamps)

---

## 5) Validation Rules

### 5.1 PR validation (`prValidator.ts`)

- Required on create: `prID`, `projCode`, `projName`, `projClient`, `dateRequired`, `requestedBy`, `prStatus`, `totalCost`
- `prStatus` must be one of: `Draft | Recommended | Submitted | Approved | Rejected | Cancelled`
- `totalCost` must be non-negative
- `itemsRequested` validates ObjectId format when provided
- `prUpdateSchema` blocks restricted fields in generic update:
  - `prID`, `createdAt`, `updatedAt`, `itemsRequested`
- Empty update payload is rejected (`At least one field must be updated`)

### 5.2 PR status workflow validation (`prStatusValidator.ts`)

- Explicit status transition guardrails are enforced:
  - `Draft -> Submitted | Cancelled`
  - `Submitted -> Recommended | Rejected | Cancelled`
  - `Recommended -> Approved | Rejected | Cancelled`
  - `Rejected -> Draft`
  - `Approved` and `Cancelled` are terminal in current implementation
- `Approved` requires `approvedBy` and an existing `recommendedBy`
- `Cancelled` requires `cancellationReason`
- Dedicated cancellation payload validation exists (`prCancellationSchema`)

### 5.3 PR item validation (`prItemValidator.ts`)

- Required on create: `prItemID`, `prID`, `supplyID`, `supplierID`, `itemDescription`, `quantity`, `unitOfMeasurement`, `unitPrice`, `deliveryAddress`
- `quantity` must be at least 1
- `unitPrice` and optional `totalPrice` must be non-negative
- `prItemUpdateSchema` blocks restricted fields:
  - `prItemID`, `prID`, `createdAt`, `updatedAt`
- Empty update payload is rejected
- Bulk replace endpoint validates `items[]` with `prItemBulkReplaceSchema`

### 5.4 Model-level rules (`prModel.ts`, `prItemModel.ts`)

- PR rule: `Approved` PR must have `recommendedBy` (pre-save hook)
- PR rule: non-draft stages require non-empty `itemsRequested`
- PR item rule: `totalPrice` auto-computed as `quantity * unitPrice` on document save

---

## 6) Purchase Request API Endpoints

| Method | Route           | Auth | Description                                                                              | Status      |
| ------ | --------------- | ---- | ---------------------------------------------------------------------------------------- | ----------- |
| GET    | `/`             | Yes  | Get all PRs with optional filters (`status`, `requestedBy`, `projCode`, `page`, `limit`) | Implemented |
| GET    | `/:prID`        | Yes  | Get PR by `prID`                                                                         | Implemented |
| POST   | `/`             | Yes  | Create PR                                                                                | Implemented |
| PUT    | `/:prID`        | Yes  | Update PR fields (except restricted fields)                                              | Implemented |
| PATCH  | `/:prID/status` | Yes  | Update PR status with transition guardrails                                              | Implemented |
| PATCH  | `/:prID/cancel` | Yes  | Cancel PR with required cancellation reason                                              | Implemented |
| DELETE | `/:prID`        | Yes  | Delete PR and associated PR items                                                        | Implemented |
| GET    | `/hello`        | No   | Public route check                                                                       | Implemented |

Notes:

- Duplicate `prID` on create returns `409`.
- `GET /` returns `200` with `data: []` when no PR exists.
- List response includes pagination metadata.
- Delete guardrail: submitted/recommended/approved/cancelled PRs cannot be deleted.
- Status updates append changelog entries (`changeType: status`).

---

## 7) PR Item API Endpoints (Nested under PR)

| Method | Route                  | Auth | Description                      | Status      |
| ------ | ---------------------- | ---- | -------------------------------- | ----------- |
| GET    | `/:prID/items`         | Yes  | Get all items for a PR           | Implemented |
| POST   | `/:prID/items`         | Yes  | Add item to PR                   | Implemented |
| PUT    | `/:prID/items/:itemID` | Yes  | Update one PR item by `prItemID` | Implemented |
| DELETE | `/:prID/items/:itemID` | Yes  | Remove one PR item by `prItemID` | Implemented |
| PUT    | `/:prID/items`         | Yes  | Bulk replace all items in a PR   | Implemented |

Notes:

- `checkPRExists` middleware validates `:prID` and attaches `req.purchaseRequest`.
- Item add/remove/update endpoints update parent PR `totalCost`.
- Item update/bulk replace explicitly recompute `totalPrice` from `quantity * unitPrice`.
- Item mutations on non-draft PRs append changelog entries (`changeType: item`).

---

## 8) Response Shape (Current)

Most PR endpoints return:

```json
{
  "message": "...",
  "data": {}
}
```

Error shape:

```json
{
  "message": "...",
  "error": "..."
}
```

List endpoint (`GET /api/pr`) currently returns:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 0,
    "itemsPerPage": 10
  }
}
```

---

## 9) Progress Snapshot vs `DOCS.md` (Section 4.2 PR Module)

| Feature Code | Requirement (from `DOCS.md`)                    | Current Backend Status                                                                                |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `PR-101`     | Create Purchase Request                         | **Implemented** (`POST /api/pr`)                                                                      |
| `PR-102`     | Submit PR for Approval                          | **Implemented** (validated transition + item presence enforcement for submission)                     |
| `PR-103`     | Approval Workflow (recommended + approved path) | **Implemented (backend workflow guards)** (`recommendedBy`/`approvedBy` constraints + transition map) |
| `PR-104`     | Edit Pending PRs                                | **Implemented** (`PUT /api/pr/:prID` restricted to editable states)                                   |
| `PR-105`     | Estimated Cost Control                          | **Implemented (backend derivation)** (`totalCost` kept in sync by item operations)                    |
| `PR-106`     | Item Proposal Flow (draft item review)          | **Not Implemented**                                                                                   |
| `PR-107`     | PR Status Tracking + full audit trail           | **Implemented (core backend audit trail)** (`changelog` for status/edit/item updates)                 |
| `PR-108`     | PO Linkback Notification                        | **Not Implemented**                                                                                   |

---

## 10) Known Gaps / Current Limitations

1. Item Proposal Flow (`PR-106`) is still not implemented as a dedicated draft-item approval pipeline.
2. PO linkback notifications (`PR-108`) and event integrations (email/Discord/dashboard) are still not implemented.
3. No dedicated PR search endpoint (`/api/pr/search`) currently exists.
4. No regex/format enforcement for `prID` and `prItemID` at validator/model level (only non-empty string checks).
5. Requestor identity ownership checks are not strictly enforced at route level (status/edit rules are enforced by state).

---

## 11) Sample Payloads

### 11.1 Create PR (`POST /api/pr`)

```json
{
  "prID": "PR-1001",
  "projCode": "PC-001",
  "projName": "Office Fit-Out",
  "projClient": "JBC Internal",
  "dateRequested": "2026-03-05",
  "dateRequired": "2026-03-20",
  "requestedBy": "USR-0001",
  "approvedBy": "APR-0001",
  "prStatus": "Draft",
  "itemsRequested": [],
  "totalCost": 0,
  "justification": "Initial procurement request"
}
```

### 11.2 Add PR Item (`POST /api/pr/:prID/items`)

```json
{
  "prItemID": "PRI-2001",
  "prID": "PR-1001",
  "supplyID": "SPL-2001",
  "supplierID": "SUP-1001",
  "itemDescription": "THHN Copper Wire 14 AWG",
  "quantity": 10,
  "unitOfMeasurement": "roll",
  "unitPrice": 500,
  "deliveryAddress": "Makati Project Site"
}
```

### 11.3 Update PR Status (`PATCH /api/pr/:prID/status`)

```json
{
  "prStatus": "Submitted",
  "recommendedBy": "MGR-0001"
}
```

---

## 12) Source Reference

Main implementation files:

- `backend/src/routes/prRouter.ts`
- `backend/src/controllers/prController.ts`
- `backend/src/middlewares/prMiddleware.ts`
- `backend/src/models/prModel.ts`
- `backend/src/models/prItemModel.ts`
- `backend/src/validators/prValidator.ts`
- `backend/src/validators/prItemValidator.ts`

Main verification files:

- `backend/tests/routes/prRouter.test.ts`
- `backend/tests/models/prModel.test.ts`
- `backend/tests/validators/prValidator.test.ts`
- `backend/tests/validators/prItemValidator.test.ts`
