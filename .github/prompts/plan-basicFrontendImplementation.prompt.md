# Plan: Basic Frontend — Dependency-First Implementation Flow

**Summary**: Build a basic but complete frontend on top of the existing Next.js 15 App Router app in `frontend/`, but in strict dependency order: **platform/core first, users/auth first, supply+supplier second, PR third**. This aligns with React (and React Native-style) development philosophy: stable foundations, feature modules with clear ownership, and data dependencies implemented before consumer flows.

---

## Progress Tracker (Single Source)

Use this section as your running tracker. Only mark a phase complete after its exit criteria pass.

| Phase | Scope                         | Status         | Owner | Start | End | Notes |
| ----- | ----------------------------- | -------------- | ----- | ----- | --- | ----- |
| 0     | Platform Foundation           | ⬜ Not Started |       |       |     |       |
| 1     | User + Auth                   | ⬜ Not Started |       |       |     |       |
| 2     | Suppliers + Supplies          | ⬜ Not Started |       |       |     |       |
| 3     | Purchase Requests             | ⬜ Not Started |       |       |     |       |
| 4     | Dashboard + Integration       | ⬜ Not Started |       |       |     |       |
| 5     | Hardening + Release Readiness | ⬜ Not Started |       |       |     |       |

### Status Legend

- ⬜ Not Started
- 🟨 In Progress
- ✅ Done
- ⛔ Blocked

---

## Guiding Development Philosophy

1. **Dependency-first sequencing**: never build a downstream module before upstream entities exist.
2. **Feature-sliced structure**: each domain (`users`, `suppliers`, `supplies`, `pr`) owns its types, API service, hooks, and screens.
3. **Single source of truth**: server state in React Query, auth state in one provider, shared UI primitives reused everywhere.
4. **Vertical slices over horizontal overbuild**: ship complete mini-features end-to-end before moving to the next module.
5. **Definition-of-done gates per phase**: only proceed when phase acceptance checks pass.

---

## Phase 0 — Platform Foundation (Prerequisite)

### Checklist

- [ ] Install minimal dependencies
- [ ] Configure environment + root providers
- [ ] Set up shared types + API client
- [ ] Set up reusable UI primitives

### 0.1 Install minimal dependencies

From `frontend/`, add:

- `@tanstack/react-query`
- `react-hot-toast`
- `js-cookie` + `@types/js-cookie`

### 0.2 Environment and app wiring

- Add `NEXT_PUBLIC_API_URL=http://localhost/api` in `frontend/.env.local`
- Configure React Query provider in root layout
- Configure toast provider in root layout

### 0.3 Core type and API setup

Create:

- `frontend/src/lib/types/api.ts` (`ApiResponse<T>`)
- `frontend/src/lib/types/user.ts`
- `frontend/src/lib/types/supplier.ts`
- `frontend/src/lib/types/supply.ts`
- `frontend/src/lib/types/pr.ts`
- `frontend/src/lib/api/client.ts` (base URL, bearer injection, global error parsing)

### 0.4 Core layout primitives

Create shared UI used by all modules first:

- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Spinner.tsx`
- `frontend/src/components/ui/EmptyState.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/Table.tsx`

### Deliverables

- Shared API client and request/error handling baseline
- Reusable UI primitives ready for all feature modules
- Environment variables documented locally

**Phase Gate (must pass before Phase 1):**

- App boots successfully
- API client can call a health/protected endpoint
- Global loading and error visuals exist

---

## Phase 1 — User + Auth Module (First Functional Module)

> Why first: all domain access is protected by JWT and UI permissions depend on user context.

### Checklist

- [ ] Implement auth + user API services
- [ ] Build `AuthContext` and auth state handling
- [ ] Implement login and protected routing
- [ ] Implement profile and admin user management views

### 1.1 Auth services and provider

Implement `frontend/src/lib/api/auth.ts` and `frontend/src/lib/api/users.ts`:

- `login()`, `logout()`, `changePassword()`
- `getMe()`, `getAllUsers()`, `getUserById()`, `updateUser()`, `deleteUser()`

Create `frontend/src/context/AuthContext.tsx`:

- stores auth token + current user
- exposes `login`, `logout`, `isAuthenticated`, `user`, `isSuperAdmin`
- role workaround: probe `GET /api/user/`; `200` = super admin, `403` = non-admin

### 1.2 Route protection and app shells

- Create `frontend/src/app/(auth)/login/page.tsx`
- Create `frontend/src/app/(protected)/layout.tsx`
- Update `frontend/src/app/page.tsx` to redirect to `/dashboard`
- Build `frontend/src/components/layout/Sidebar.tsx`, `Header.tsx`, `PageLayout.tsx`

### 1.3 User screens

- `frontend/src/app/(protected)/profile/page.tsx` (self profile + change password)
- `frontend/src/app/(protected)/users/page.tsx` (super admin only)
- `frontend/src/app/(protected)/users/[userID]/page.tsx` (view/edit/delete)

### Deliverables

- Working login/logout/session lifecycle
- Role-aware navigation and route access
- User profile + super admin user management screens

**Phase Gate (must pass before Phase 2):**

- Login/logout works
- Protected routes block unauthenticated users
- Super-admin gating works for Users screens

---

## Phase 2 — Master Data: Suppliers + Supplies (Second Functional Module)

> Why second: PR creation depends on valid supply and supplier data.

### Checklist

- [ ] Implement supplier APIs + screens
- [ ] Implement supply APIs + screens
- [ ] Implement linking between suppliers and supplies
- [ ] Add master-data validation and error handling

### 2.1 Supplier module

Service: `frontend/src/lib/api/suppliers.ts`

- CRUD
- search
- status update
- link/unlink supplies

Screens under `frontend/src/app/(protected)/suppliers/`:

- `page.tsx` — list + search + status
- `new/page.tsx` — create (contacts, emails, tags, contact persons)
- `[supplierID]/page.tsx` — detail/edit + linked supplies

### 2.2 Supply module

Service: `frontend/src/lib/api/supplies.ts`

- CRUD
- search
- status update
- supplier pricing CRUD

Screens under `frontend/src/app/(protected)/supplies/`:

- `page.tsx` — list + search + status
- `new/page.tsx` — create with specifications + supplier pricing
- `[supplyID]/page.tsx` — detail/edit + supplier pricing management

### 2.3 Master-data UX quality

- form validation for ID formats (`SUP-*`, `SPL-*`)
- clear empty states and actionable errors
- optimistic UI only for safe toggles (status), otherwise server-confirmed updates

### Deliverables

- Supplier CRUD with linkage support
- Supply CRUD with pricing/specification handling
- Confirmed supplier-supply relationship workflows

**Phase Gate (must pass before Phase 3):**

- At least one supplier and one supply can be created and linked
- Supplier and supply details can be edited without breaking relations

---

## Phase 3 — Purchase Request Module (Third Functional Module)

> Why third: PR module consumes user, supplier, and supply data.

### Checklist

- [ ] Implement PR APIs
- [ ] Implement PR list/create/detail screens
- [ ] Implement PR item lifecycle (add/edit/remove)
- [ ] Enforce PR dependency and transition rules

### 3.1 PR services

Service: `frontend/src/lib/api/pr.ts`

- PR CRUD
- status patch
- PR item CRUD and bulk replace

### 3.2 PR screens

Screens under `frontend/src/app/(protected)/pr/`:

- `page.tsx` — PR list
- `new/page.tsx` — PR create form
- `[prID]/page.tsx` — PR detail, status transitions, item management

### 3.3 PR dependency UX

- PR item form uses existing supply/supplier entities (selection, not free-text where possible)
- prevent invalid transitions where required fields are missing (e.g., recommendation/approval context)
- derive/validate totals consistently

### Deliverables

- End-to-end PR flow using real upstream entities
- Functional status workflow and item management
- Stable PR totals and item calculations

**Phase Gate (must pass before Phase 4):**

- Can create PR, add/edit/remove items, and update status
- PR flow works using real supplier/supply data from Phase 2

---

## Phase 4 — Dashboard and Cross-Module Integration

### Checklist

- [ ] Implement dashboard summary queries
- [ ] Add recent PR list and quick links
- [ ] Finalize sidebar order to match business flow

### 4.1 Dashboard after core modules exist

Create `frontend/src/app/(protected)/dashboard/page.tsx`:

- show summary counts (`PR`, `supplies`, `suppliers`)
- show recent PRs
- include quick links into each module

### 4.2 Navigation coherence

Sidebar order should follow business flow:

1. Dashboard
2. Users
3. Suppliers
4. Supplies
5. Purchase Requests
6. Profile

### Deliverables

- Dashboard reflecting real module data
- Coherent cross-module navigation

---

## Phase 5 — Hardening and Release Readiness

### Checklist

- [ ] Implement consistent 401/session-expiry handling
- [ ] Ensure loading/empty/error state consistency
- [ ] Run full QA checklist and fix regressions
- [ ] Finalize frontend setup/run docs

### 5.1 Session/error handling

- on `401`, clear token and redirect to `/login`
- global toast + inline field errors
- loading/empty/error states on every list and detail page

### 5.2 Basic QA checklist

1. Login as super admin and non-admin users
2. Verify user permissions and route guards
3. Create supplier and supply, then link them
4. Create PR and manage PR items using created master data
5. Verify status transitions and edit flows
6. Verify logout/session expiry behavior

### 5.3 Documentation touch-up

- add frontend setup env docs in `frontend/README.md`
- include quick run/verify steps

### Deliverables

- Predictable failure/session behavior
- Baseline production-readiness confidence
- Clear runbook for local setup and verification

---

## Weekly Progress Log (Optional but Recommended)

| Date | Phase | What was completed | Risks/Blockers | Next step |
| ---- | ----- | ------------------ | -------------- | --------- |
|      |       |                    |                |           |

---

## Completion Definition (Project-Level)

Mark overall plan complete only when all are true:

- [ ] All phases are marked ✅ in the Progress Tracker
- [ ] Every phase gate has passed with evidence
- [ ] QA checklist is fully executed
- [ ] App is runnable by another developer using docs only

---

## Suggested Execution Sequence (Concrete Task Order)

1. `platform`: providers, API client, shared UI primitives
2. `auth`: login, auth context, protected layout
3. `users`: profile + admin users pages
4. `suppliers`: list/create/detail + linking
5. `supplies`: list/create/detail + pricing
6. `pr`: list/create/detail + items/status
7. `dashboard`: summary + recent PRs
8. `hardening`: errors/session/QA/docs

---

## Key Design Decisions (Updated)

| Decision                       | Rationale                                                             |
| ------------------------------ | --------------------------------------------------------------------- |
| User/Auth first                | Every protected module depends on user identity and access            |
| Suppliers + Supplies before PR | PR data entry depends on master data entities                         |
| Dashboard later, not early     | Dashboard should summarize real implemented modules, not placeholders |
| Feature-module organization    | Easier maintenance, testing, and onboarding                           |
| React Query for server state   | Consistent async handling and caching across all modules              |
| Cookie token handling          | Better security posture than localStorage for this setup              |

---

## Backend API Quick Reference

### Base URL

`http://localhost/api` (via nginx proxy, port 80) or `http://localhost:8000/api` (direct)

### Auth — `/api/auth`

| Method  | Path                   | Auth   | Notes                                                       |
| ------- | ---------------------- | ------ | ----------------------------------------------------------- |
| `POST`  | `/api/auth/login`      | ❌     | Body: `{ email, password }` → `{ data: { bearer: token } }` |
| `POST`  | `/api/auth/logout`     | ❌     |                                                             |
| `GET`   | `/api/auth/protected`  | ✅ JWT | Token check                                                 |
| `PATCH` | `/api/auth/change-pwd` | ✅ JWT | Body: `{ currentPassword, newPassword }`                    |

### Users — `/api/user`

| Method   | Path                | Auth                |
| -------- | ------------------- | ------------------- |
| `GET`    | `/api/user/me`      | ✅ JWT              |
| `GET`    | `/api/user/`        | ✅ JWT + SuperAdmin |
| `GET`    | `/api/user/:userID` | ✅ JWT + SuperAdmin |
| `PUT`    | `/api/user/:userID` | ✅ JWT + SuperAdmin |
| `DELETE` | `/api/user/:userID` | ✅ JWT + SuperAdmin |

### Suppliers — `/api/supplier`

| Method   | Path                                           | Auth   |
| -------- | ---------------------------------------------- | ------ |
| `GET`    | `/api/supplier/`                               | ✅ JWT |
| `GET`    | `/api/supplier/search`                         | ✅ JWT |
| `GET`    | `/api/supplier/:supplierID`                    | ✅ JWT |
| `POST`   | `/api/supplier/`                               | ✅ JWT |
| `PATCH`  | `/api/supplier/:supplierID`                    | ✅ JWT |
| `DELETE` | `/api/supplier/:supplierID`                    | ✅ JWT |
| `PATCH`  | `/api/supplier/:supplierID/status`             | ✅ JWT |
| `GET`    | `/api/supplier/:supplierID/supplies`           | ✅ JWT |
| `POST`   | `/api/supplier/:supplierID/supplies`           | ✅ JWT |
| `DELETE` | `/api/supplier/:supplierID/supplies/:supplyID` | ✅ JWT |

### Supplies — `/api/supply`

| Method   | Path                                               | Auth   |
| -------- | -------------------------------------------------- | ------ |
| `GET`    | `/api/supply/`                                     | ✅ JWT |
| `GET`    | `/api/supply/search`                               | ✅ JWT |
| `GET`    | `/api/supply/:supplyID`                            | ✅ JWT |
| `POST`   | `/api/supply/`                                     | ✅ JWT |
| `PATCH`  | `/api/supply/:supplyID`                            | ✅ JWT |
| `DELETE` | `/api/supply/:supplyID`                            | ✅ JWT |
| `PATCH`  | `/api/supply/:supplyID/status`                     | ✅ JWT |
| `POST`   | `/api/supply/:supplyID/supplier-pricing`           | ✅ JWT |
| `PATCH`  | `/api/supply/:supplyID/supplier-pricing/:supplier` | ✅ JWT |
| `DELETE` | `/api/supply/:supplyID/supplier-pricing/:supplier` | ✅ JWT |

### Purchase Requests — `/api/pr`

| Method   | Path                          | Auth   |
| -------- | ----------------------------- | ------ |
| `GET`    | `/api/pr/`                    | ✅ JWT |
| `POST`   | `/api/pr/`                    | ✅ JWT |
| `GET`    | `/api/pr/:prID`               | ✅ JWT |
| `PUT`    | `/api/pr/:prID`               | ✅ JWT |
| `PATCH`  | `/api/pr/:prID/status`        | ✅ JWT |
| `DELETE` | `/api/pr/:prID`               | ✅ JWT |
| `GET`    | `/api/pr/:prID/items`         | ✅ JWT |
| `POST`   | `/api/pr/:prID/items`         | ✅ JWT |
| `PUT`    | `/api/pr/:prID/items/:itemID` | ✅ JWT |
| `DELETE` | `/api/pr/:prID/items/:itemID` | ✅ JWT |
| `PUT`    | `/api/pr/:prID/items`         | ✅ JWT |
