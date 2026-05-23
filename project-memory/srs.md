# Software Requirements Specification (SRS)

**Product:** SavingIt  
**Version:** 0.1.0 (scaffold)  
**Date:** May 2026

---

## 1. Introduction

### 1.1 Purpose

This document specifies functional and non-functional requirements for SavingIt, a manual INR savings tracker delivered as a responsive web application.

### 1.2 Scope

SavingIt allows authenticated users to create savings plans, log contributions, view progress, and analyze savings trends. It does **not** integrate with banks, UPI, or investment platforms.

### 1.3 Definitions

See [glossary.md](./glossary.md).

---

## 2. Overall description

### 2.1 User classes

| User | Description |
|------|-------------|
| End user | Individual tracking personal savings goals |
| Admin | Not in v1 scope |

### 2.2 Operating environment

- Modern mobile and desktop browsers (Chrome, Safari, Firefox, Edge)
- Hosted on Vercel; data on Supabase Postgres
- Requires internet for sync (no offline-first in v1)

### 2.3 Design constraints

- Mobile-first UI with desktop usability via centered max-width layout
- All monetary values stored as integer **paise**
- Currency fixed to INR in v1
- Dark theme as default

### 2.4 Assumptions

- Users manually enter contribution amounts and dates
- One user account owns all plans (no family sharing in v1)
- Supabase Auth handles identity

---

## 3. Functional requirements

### 3.1 Authentication (FR-AUTH)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AUTH-01 | User shall register with email and password | Must | Shipped |
| FR-AUTH-02 | User shall sign in with email and password | Must | Shipped |
| FR-AUTH-03 | User shall sign out | Must | Shipped |
| FR-AUTH-04 | Unauthenticated users shall be redirected from app routes | Must | Shipped |
| FR-AUTH-05 | Session shall persist across browser restarts | Must | Shipped |

### 3.2 Dashboard (FR-DASH)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-DASH-01 | User shall see total saved across all plans | Must | Stub |
| FR-DASH-02 | User shall see count of active plans | Must | Stub |
| FR-DASH-03 | User shall see savings this month | Should | Stub |
| FR-DASH-04 | User shall see recent contributions | Should | Planned |

### 3.3 Savings plans (FR-PLAN)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-PLAN-01 | User shall create a plan with name and target amount | Must | Shipped |
| FR-PLAN-02 | User shall view list of all plans | Must | Stub |
| FR-PLAN-03 | User shall view plan detail with progress | Must | Stub |
| FR-PLAN-04 | User shall edit plan name and target | Must | Stub |
| FR-PLAN-05 | User shall delete a plan | Should | Planned |
| FR-PLAN-06 | Progress shall be computed as saved ÷ target | Must | Planned |

### 3.4 Contributions (FR-TXN)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-TXN-01 | User shall log a contribution to a plan | Must | Stub |
| FR-TXN-02 | Contribution shall include amount, date, optional note | Must | Stub |
| FR-TXN-03 | User shall edit a contribution | Should | Planned |
| FR-TXN-04 | User shall delete a contribution | Should | Planned |
| FR-TXN-05 | Plan saved total shall update when contributions change | Must | Planned |

### 3.5 Insights (FR-INS)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-INS-01 | User shall view savings trend over time | Should | Stub |
| FR-INS-02 | User shall see projection to reach plan target | Could | Planned |
| FR-INS-03 | Charts shall use Recharts | Must | Stub |

### 3.6 Settings (FR-SET)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SET-01 | User shall view profile info | Should | Stub |
| FR-SET-02 | Currency shall display as INR (read-only in v1) | Must | Stub |
| FR-SET-03 | User shall sign out from settings | Must | Shipped |

### 3.7 Navigation (FR-NAV)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-NAV-01 | Mobile bottom nav: Dashboard, Plans, Add, Insights, Settings | Must | Shipped |
| FR-NAV-02 | Add shall navigate to new contribution | Must | Shipped |
| FR-NAV-03 | Nested screens shall show back navigation | Must | Shipped |
| FR-NAV-04 | `/` shall redirect to dashboard | Must | Shipped |

---

## 4. Non-functional requirements

### 4.1 Performance (NFR-PERF)

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | First contentful paint suitable for mobile 4G |
| NFR-PERF-02 | Form submit feedback within 500ms (excluding network) |

### 4.2 Security (NFR-SEC)

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Row Level Security on all Supabase tables |
| NFR-SEC-02 | Users may only access their own data |
| NFR-SEC-03 | Secrets in environment variables only |

### 4.3 Usability (NFR-UX)

| ID | Requirement |
|----|-------------|
| NFR-UX-01 | Touch targets ≥ 44px on primary actions |
| NFR-UX-02 | Readable contrast on dark background |
| NFR-UX-03 | Desktop layout centered with max-width ~512px (`max-w-lg`) |

### 4.4 Maintainability (NFR-MAINT)

| ID | Requirement |
|----|-------------|
| NFR-MAINT-01 | TypeScript strict mode |
| NFR-MAINT-02 | Forms validated with zod + react-hook-form |
| NFR-MAINT-03 | Shared layout components reused across routes |

### 4.5 Compatibility (NFR-COMPAT)

| ID | Requirement |
|----|-------------|
| NFR-COMPAT-01 | Latest two versions of major browsers |
| NFR-COMPAT-02 | Safe-area insets for notched phones on bottom nav |

---

## 5. External interfaces

### 5.1 User interface routes

| Route | Purpose |
|-------|---------|
| `/` | Redirect to dashboard |
| `/auth/login` | Login |
| `/auth/signup` | Signup |
| `/dashboard` | Overview |
| `/plans` | Plan list |
| `/plans/new` | Create plan |
| `/plans/[id]` | Plan detail |
| `/plans/[id]/edit` | Edit plan |
| `/transactions/new` | Log contribution |
| `/insights` | Analytics |
| `/settings` | Settings |

### 5.2 Software interfaces

- **Supabase Auth** — user registration and sessions
- **Supabase Postgres** — plans, contributions, profiles
- **Vercel** — hosting and CI deploy

### 5.3 Environment variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |

---

## 6. Data requirements

See [data-model.md](./data-model.md).

Key rule: **all amounts in paise** (integer).

---

## 7. Acceptance criteria (scaffold phase — complete)

- [x] All routes render without build errors
- [x] Dark theme with specified palette
- [x] Bottom navigation with five items
- [x] Shared components: AppShell, MobileHeader, BottomNav, EmptyState, StatCard, FAB
- [x] INR format helpers implemented
- [x] Supabase client stubs present
- [x] `npm run build` passes

---

## 8. Future acceptance criteria (MVP)

- [x] User can sign up, log in, and stay signed in _(auth only; no app data yet)_
- [ ] User can CRUD savings plans
- [ ] User can log contributions; plan progress updates
- [ ] Dashboard shows real aggregated data
- [ ] RLS enforced; users isolated _(policies in migration; apply + wire app)_
- [ ] Deployed on Vercel with production Supabase

---

## 9. Acceptance criteria (auth phase — complete)

Added 2026-05-23. See [auth.md](./auth.md).

- [x] Login with email/password redirects to `/dashboard`
- [x] Signup with email/password (session or confirm-email flow)
- [x] Logout from Settings redirects to `/auth/login`
- [x] Middleware protects app routes; refreshes session cookies
- [x] Authenticated users redirected away from auth pages
- [x] `npm run build` passes with middleware

---

## 10. Acceptance criteria (schema migration — file ready)

Added 2026-05-23. See [schema.md](./schema.md).

- [x] Migration SQL defines four tables with paise bigint columns
- [x] RLS policies on all tables; transaction plan-ownership check
- [x] Indexes on `user_id`, `plan_id`, `transaction_date`
- [x] `updated_at` triggers on profiles and savings_plans
- [ ] Migration applied to hosted Supabase project
- [x] App writes to `savings_plans` on plan create
- [ ] Full read/update for plans and transactions

---

## 11. Acceptance criteria (calculations library — complete)

Added 2026-05-23. See [calculations.md](./calculations.md).

- [x] Pure TS functions for balance, progress, remaining, monthly pace
- [x] `getPlanHealthStatus()` with six status values
- [x] `projectCompletionDate()` in projections module
- [x] `npm run build` passes
- [ ] Functions used by dashboard/plan/insights UI

---

## 12. Acceptance criteria (plan creation — complete)

Added 2026-05-23. See [plans.md](./plans.md).

- [x] `/plans/new` form with name, description, category, target amount, target date, priority, icon, color
- [x] zod validation: name required, amount &gt; 0, optional valid date
- [x] Rupees converted to paise before insert
- [x] Insert into `savings_plans` with authenticated `user_id`
- [x] Redirect to `/plans` on success
- [x] `npm run build` passes
