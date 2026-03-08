# Plan: Basic Frontend — Dependency-First Implementation Flow

**Summary**: Build a basic but complete frontend on top of the existing Next.js 15 App Router app in `frontend/`, but in strict dependency order: **platform/core first, users/auth first, supply+supplier second, PR third**. This aligns with React (and React Native-style) development philosophy: stable foundations, feature modules with clear ownership, and data dependencies implemented before consumer flows.

---

## Progress Tracker (Single Source)

Use this section as your running tracker. Only mark a phase complete after its exit criteria pass.

| Phase | Scope                         | Status         | Owner | Start      | End        | Notes                                                                                                                             |
| ----- | ----------------------------- | -------------- | ----- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Platform Foundation           | ✅ Done        | Dev   | 2026-03-06 | 2026-03-07 | Providers, API client, types, UI primitives implemented and build-verified                                                        |
| 1     | User + Auth                   | ✅ Done        | Dev   | 2026-03-07 | 2026-03-07 | Auth/user services, context, login, protected layout, profile and users screens implemented; phase gate validated end-to-end      |
| 2     | Suppliers + Supplies          | ✅ Done        | Dev   | 2026-03-07 | 2026-03-08 | Supplier/supply CRUD, linking flows, pricing management, and phase-gate workflows validated end-to-end                           |
| 3     | Purchase Requests             | 🟨 In Progress | Dev   | 2026-03-08 |            | Active phase after Phase 2 completion                                                                                              |
| 4     | Dashboard + Integration       | ⬜ Not Started |       |            |            |                                                                                                                                   |
| 5     | Hardening + Release Readiness | ⬜ Not Started |       |            |            |                                                                                                                                   |

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

- [x] Install minimal dependencies
- [x] Configure environment + root providers
- [x] Set up shared types + API client
- [x] Set up reusable UI primitives

### 0.1 Install minimal dependencies

From `frontend/`, add:

- `@tanstack/react-query`
- `react-hot-toast`
- `js-cookie` + `@types/js-cookie`

### 0.2 Environment and app wiring

- Add `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local`
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

- ✅ App boots successfully (`npm run dev`, `npm run build`)
- ✅ API client can call a health/protected endpoint (`http://localhost:8000/health` reachable)
- ✅ Global loading and error visuals exist (shared primitives scaffolded)

---

## Phase 1 — User + Auth Module (First Functional Module)

> Why first: all domain access is protected by JWT and UI permissions depend on user context.

### Checklist

- [x] Implement auth + user API services
- [x] Build `AuthContext` and auth state handling
- [x] Implement login and protected routing
- [x] Implement profile and admin user management views

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

- ✅ Login/logout works (validated with backend)
- ✅ Protected routes block unauthenticated users (server-side token gate on protected layout)
- ✅ Super-admin gating works for Users screens (validated via live role behavior)

---

## Phase 2 — Master Data: Suppliers + Supplies (Second Functional Module)

> Why second: PR creation depends on valid supply and supplier data.

### Checklist

- [x] Implement supplier APIs + screens
- [x] Implement supply APIs + screens
- [x] Implement linking between suppliers and supplies
- [x] Add master-data validation and error handling

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

Implementation notes:

- Supplier IDs are now auto-generated on create and rendered read-only (not user-editable)
- Supplier list search is currently client-side over fetched supplier data
- Linked supplies in supplier detail show meaningful context (name + supply ID + unit + status)

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

Implementation notes:

- Supply IDs are now auto-generated on create and rendered read-only (not user-editable)
- Supply list search is currently client-side over fetched supply data
- Supplier-pricing entries include explicit field labels (supplier, unit quantity, unit price, total price, validity date)
- Linked supplier context in pricing views prioritizes supplier business identifiers (supplierID/name) over raw MongoDB `_id`

### 2.3 Master-data UX quality

- form validation for ID formats (`SUP-*`, `SPL-*`)
- clear empty states and actionable errors
- optimistic UI only for safe toggles (status), otherwise server-confirmed updates

Additional UX refinements completed:

- create forms now prevent manual ID edits via auto-filled read-only IDs
- list search/filter behavior is immediate client-side over loaded datasets
- linked relationship displays now include richer contextual fields for readability
- supplier-side linking includes a fallback patch path if nested link endpoints are unavailable

### Deliverables

- Supplier CRUD with linkage support
- Supply CRUD with pricing/specification handling
- Confirmed supplier-supply relationship workflows

**Phase Gate (must pass before Phase 3):**

- ✅ At least one supplier and one supply can be created and linked
- ✅ Supplier and supply details can be edited without breaking relations

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

| Date       | Phase | What was completed                                                                                                                                         | Risks/Blockers                                                                | Next step                                                             |
| ---------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 2026-03-07 | 0     | Installed deps, wired providers, added API client/types/UI primitives, and passed build                                                                    | React 19 RC peer resolution required `--legacy-peer-deps`                     | Implement Phase 1 auth services/context/routes                        |
| 2026-03-07 | 1     | Implemented auth/user API services, `AuthContext`, login page, protected layout, sidebar/header shell, profile page, users list/detail pages; build passed | None after validation                                                         | Start Phase 2 supplier and supply implementation                      |
| 2026-03-07 | 2     | Implemented supplier/supply API services and screens for list/create/detail, including status updates, supplier-supply linking fallback, supplier pricing management, auto-filled read-only IDs, client-side search/filter UX, and richer linked-entry labels; build passed | None critical; client-side ID generation and local search retained as intentional interim approach | Validate live workflows and finalize Phase 2 phase-gate evidence      |
| 2026-03-08 | 2     | Completed Phase 2 gate validation: create/edit/link/unlink workflows for supplier/supply passed; backend nested supplier-supply endpoints and supply link endpoint verified and reflected in docs | No blocker for Phase 3 kickoff                                                 | Start Phase 3 PR service and screens (`/pr`, `/pr/new`, `/pr/[prID]`) |

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
| `POST`   | `/api/supply/:supplyID/link-supplier`              | ✅ JWT |
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
