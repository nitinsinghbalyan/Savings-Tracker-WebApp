# Features

Status legend: **Shipped** | **Stub** | **Planned**

---

## Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Email/password signup | Shipped | `signUp`; redirects if session, else email confirm message |
| Email/password login | Shipped | `signInWithPassword`; redirects to `/dashboard` |
| Session persistence | Shipped | Cookie-based via `@supabase/ssr` + middleware refresh |
| Protected routes | Shipped | Middleware redirects to `/auth/login` |
| Sign out | Shipped | Server action in Settings → `/auth/login` |

---

## Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Total saved summary | Stub | Sample paise values via `formatINR` |
| Stat cards (plans, month, milestone) | Stub | `StatCard` component with placeholder data |
| Recent contributions list | Planned | — |
| Quick add contribution | Planned | Bottom nav Add → `/transactions/new` |

---

## Savings plans

| Feature | Status | Notes |
|---------|--------|-------|
| List plans | Stub | `EmptyState` with link to create; no DB fetch yet |
| Create plan | Shipped | Full form at `/plans/new`; `createPlan` → Supabase |
| Plan detail | Stub | Progress bar with sample data |
| Edit plan | Stub | Pre-filled form shell; no `updatePlan` yet |
| Delete plan | Planned | — |
| Plan categories | Shipped | Nine categories in `plan-options.ts` |

---

## Contributions (transactions)

| Feature | Status | Notes |
|---------|--------|-------|
| Log contribution | Stub | Plan, amount, date, note form |
| Edit/delete contribution | Planned | — |
| Contribution history per plan | Planned | — |
| Convert rupees → paise on save | Shipped | Plans: form + `createPlan`; transactions still stub |

---

## Calculations (pure logic)

| Feature | Status | Notes |
|---------|--------|-------|
| Plan current amount from transactions | Shipped | `calculatePlanCurrentAmount()` |
| Progress / remaining / monthly required | Shipped | `savings.ts` |
| Plan health status | Shipped | ON_TRACK, CRITICAL, etc. |
| Completion date projection | Shipped | `projections.ts` |
| Wired into UI pages | Planned | Dashboard/plans still use placeholders |

---

## Insights

| Feature | Status | Notes |
|---------|--------|-------|
| Savings trend chart | Stub | Recharts bar chart with sample data |
| Monthly/yearly breakdown | Planned | — |
| Projections to target date | Planned | `projectCompletionDate()` shipped in lib; UI stub |
| Milestone alerts | Planned | — |

---

## Settings

| Feature | Status | Notes |
|---------|--------|-------|
| Profile | Stub | Placeholder row |
| Currency (INR locked) | Stub | Display only |
| Sign out | Shipped | `logout()` server action |

---

## Layout and UX

| Feature | Status | Notes |
|---------|--------|-------|
| AppShell (header + main + bottom nav) | Shipped | `max-w-lg` container |
| Mobile bottom navigation | Shipped | Dashboard, Plans, Add, Insights, Settings |
| MobileHeader with back button | Shipped | Used on nested screens |
| EmptyState | Shipped | Reusable component |
| StatCard | Shipped | Reusable component |
| FloatingActionButton | Shipped | Used on plans list |
| Dark fintech theme | Shipped | `#0B1120`, `#111827`, `#10B981` |
| Root redirect `/` → `/dashboard` | Shipped | — |

---

## Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js App Router | Shipped | — |
| Supabase client (browser) | Shipped | `src/lib/supabase/client.ts` |
| Supabase client (server) | Shipped | `src/lib/supabase/server.ts` |
| Auth middleware | Shipped | `src/middleware.ts`, `src/lib/supabase/middleware.ts` |
| Route protection helpers | Shipped | `src/lib/auth/routes.ts` |
| INR formatting utilities | Shipped | `formatINR`, `formatCompactINR` |
| DB schema migration 001 | Shipped | `supabase/migrations/001_initial_schema.sql` |
| Savings calculations library | Shipped | `src/lib/calculations/` |
| Plan create server action | Shipped | `createPlan` in `plans/actions.ts` |
| Vercel deployment docs | Shipped | See root `README.md` |
