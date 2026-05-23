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
| Total saved summary | Shipped | `getDashboardData()` aggregates plan balances |
| Overall progress + month stats | Shipped | Progress card, month card, hero metrics |
| Plan counts (active/completed/at-risk) | Shipped | Matches list tab + health rules |
| Savings insights | Shipped | `generateDashboardInsights()` — monthly gap, on-track, behind |
| Monthly savings chart | Shipped | Recharts `DashboardMonthlyChart` (6 months) |
| Active plan cards | Shipped | Top 4 active plans via `PlanCard` |
| Quick actions | Shipped | Log contribution, new plan, view plans |
| Greeting header | Shipped | Time-based + profile name or email fallback |
| Empty state (no plans) | Shipped | CTA to `/plans/new` |
| Quick add contribution | Shipped | Bottom nav Add → `/transactions/new` |

---

## Savings plans

| Feature | Status | Notes |
|---------|--------|-------|
| List plans | Shipped | Tabs (Active/Completed/Paused), `getPlansWithStats`, `PlanCard` grid |
| Create plan | Shipped | Full form at `/plans/new`; `createPlan` → Supabase |
| Plan detail | Shipped | `getPlanDetail`, progress ring, stats, history, actions |
| Edit plan | Stub | Pre-filled form shell; no `updatePlan` yet |
| Delete plan | Planned | — |
| Plan categories | Shipped | Nine categories in `plan-options.ts` |

---

## Contributions (transactions)

| Feature | Status | Notes |
|---------|--------|-------|
| Log transaction | Shipped | `/transactions/new`: CONTRIBUTION, WITHDRAWAL, ADJUSTMENT; `createTransaction` → Supabase |
| `?planId` prefill + redirect | Shipped | Preselect plan; return to `/plans/[id]` when opened from detail |
| Withdrawal delay warning | Shipped | `estimateWithdrawalDelayImpact` using recent savings pace |
| Source labels (incl. UPI) | Shipped | Manual labels only; no payment automation |
| Edit/delete contribution | Planned | — |
| Contribution history per plan | Shipped | `PlanTransactionList` on plan detail |
| Convert rupees → paise on save | Shipped | Plans + transactions |

---

## Calculations (pure logic)

| Feature | Status | Notes |
|---------|--------|-------|
| Plan current amount from transactions | Shipped | `calculatePlanCurrentAmount()` |
| Progress / remaining / monthly required | Shipped | `savings.ts` |
| Plan health status | Shipped | ON_TRACK, CRITICAL, etc. |
| Completion date projection | Shipped | `projections.ts` |
| Wired into UI pages | Shipped | Plans list, detail, and transaction form |

---

## Insights

| Feature | Status | Notes |
|---------|--------|-------|
| Savings Health Score (0–100) | Shipped | Pace, emergency fund, consistency, on-track, withdrawals |
| Strengths / weaknesses / actions | Shipped | `generate-narrative.ts` from score breakdown |
| At-risk plans + milestones | Shipped | Health-based list + completed goals |
| Monthly savings chart | Shipped | 6-month Recharts bar chart |
| Extra savings simulator | Shipped | Client-side `simulateExtraMonthlySavings` |
| Monthly allocation recommender | Shipped | Priority, Emergency Fund, target date, progress |
| Savings-only disclaimers | Shipped | No investment advice copy on tools |

---

## Settings

| Feature | Status | Notes |
|---------|--------|-------|
| Show user email | Shipped | Read-only in profile card |
| Profile update | Shipped | Full name, monthly income, preferred saving day; `updateProfile` upsert |
| Currency (INR locked) | Shipped | Disabled field; always saved as `INR` |
| Sign out | Shipped | `logout()` server action |
| Export transactions CSV | Shipped | `exportTransactionsCsv` + client download |
| Export plans CSV | Shipped | `exportPlansCsv` + client download |
| Delete all transactions | Shipped | AlertDialog confirmation; RLS-scoped delete |
| Delete all plans | Shipped | AlertDialog confirmation; cascades transactions |

---

## Layout and UX

| Feature | Status | Notes |
|---------|--------|-------|
| AppShell (header + main + bottom nav) | Shipped | `max-w-lg`, `app-main-padding`, `px-3` at 360px |
| Mobile bottom navigation | Shipped | Sticky, safe-area, 44px targets, `aria-current` |
| MobileHeader with back button | Shipped | `size-11` back control, safe-area top |
| EmptyState | Shipped | `size="touch"` CTA buttons |
| FloatingActionButton | Shipped | Plans list; `app-fab-bottom` safe-area offset |
| Dark fintech theme | Shipped | `#0B1120`, `#111827`, `#10B981` |
| Root redirect `/` → `/dashboard` | Shipped | — |
| Page skeleton loaders | Shipped | `PageSkeleton` + per-route `loading.tsx` |
| Root / app error boundaries | Shipped | `src/app/error.tsx`, `src/app/(app)/error.tsx` |
| Global 404 | Shipped | `src/app/not-found.tsx` |
| Toast notifications (Sonner) | Shipped | Create/update/delete/export actions |
| PWA manifest | Shipped | `public/manifest.json` — RupeeRise, standalone |
| PWA placeholder icons | Shipped | `public/icons/*.svg` (₹ via `&#8377;`) |
| Touch-friendly forms | Shipped | `h-11` inputs, `size="touch"` submits, `lib/form-styles` |

---

## Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js App Router | Shipped | — |
| Supabase client (browser) | Shipped | `src/lib/supabase/client.ts` + `getPublicEnv()` |
| Supabase client (server) | Shipped | `src/lib/supabase/server.ts` + `getPublicEnv()` |
| Env validation | Shipped | `src/lib/env.ts`, `src/instrumentation.ts` |
| Auth middleware | Shipped | `src/middleware.ts`, `src/lib/supabase/middleware.ts` |
| Route protection helpers | Shipped | `src/lib/auth/routes.ts` |
| INR formatting utilities | Shipped | `formatINR`, `formatCompactINR` |
| DB schema migration 001 | Shipped | `supabase/migrations/001_initial_schema.sql` |
| Savings calculations library | Shipped | `src/lib/calculations/` |
| Plan create server action | Shipped | `createPlan` — returns `{ success, redirectTo }` |
| Transaction create action | Shipped | `createTransaction` — returns `{ success, redirectTo }` |
| Settings server actions | Shipped | Profile, export CSV, bulk delete in `settings/actions.ts` |
| `robots.txt` | Shipped | `src/app/robots.ts` |
| Vercel deployment docs | Shipped | Root `README.md`, [deploy.md](./deploy.md) |
| User-facing brand | Shipped | **RupeeRise** (metadata, manifest, auth layout) |

---

## Expenses (planned v2)

| Feature | Status | Notes |
|---------|--------|-------|
| Log expense | Planned | `/expenses/new`; amount, category, date, note |
| Expense list (month) | Planned | `/expenses` |
| Preset categories | Planned | `expense-options.ts` — Food, Rent, Transport, … |
| Payment method labels | Planned | Cash, UPI, Card — manual only |
| Dashboard cash-flow card | Planned | Income, spent, saved, leftover — [cashflow.md](./cashflow.md) |
| Category spend chart | Planned | Phase 6.2 |
| Edit/delete expense | Planned | Phase 6.2 |
| Export expenses CSV | Planned | Phase 6.2 |
| Category budgets | Planned | Post–v2 MVP |
| Bank / UPI sync | Planned | Out of scope — see [out-of-scope.md](./out-of-scope.md) |
