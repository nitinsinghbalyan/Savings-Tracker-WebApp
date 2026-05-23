# Expenses (v2 — planned)

> **Status:** Planned — not implemented in code. Savings MVP (migration 001) remains the shipped baseline.  
> Cross-cutting metrics: [cashflow.md](./cashflow.md).

## Product intent

Extend **RupeeRise** from savings-only to a **manual expense + savings cash-flow tracker**:

| User question | Answer in app |
|---------------|----------------|
| Where did my money go? | Expense log + categories |
| How much can I save? | Income − spent − saved to goals = **surplus** |
| Am I hitting my goals? | Existing plans + savings transactions (unchanged) |

**Positioning:** Manual cash-flow tracker for India—log spending, see what's left, move surplus into savings goals. Not accounting software, not investment advice, not bank sync (v2 MVP slice).

## Design rules

1. **Separate ledger** — `expenses` table; do **not** reuse `savings_transactions` for daily spending.
2. **Amounts in paise** — `amount_paise` always positive (outflow).
3. **Manual labels only** — payment method (Cash, UPI, Card) are display labels; no UPI automation.
4. **RLS** — `user_id = auth.uid()` on all expense rows.
5. **No link to plans in MVP** — logging an expense does not auto-adjust plan balance.

## Proposed schema (`002_expenses.sql`)

### `expense_categories` (optional table; or preset text + user custom later)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | nullable for system defaults |
| `name` | text | Food, Rent, Transport, … |
| `icon` | text | optional |
| `color` | text | optional |
| `sort_order` | int | |

**MVP alternative:** `category` text on `expenses` with presets in `src/config/expense-options.ts` (no categories table).

### `expenses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `amount_paise` | bigint NOT NULL | positive outflow |
| `category` | text NOT NULL | or `category_id` FK |
| `expense_date` | date NOT NULL | default today |
| `payment_method` | text | Cash, UPI, Card, … |
| `merchant` | text | optional |
| `note` | text | optional |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | trigger |

**Indexes:** `(user_id, expense_date)`, `(user_id, category)`.

## Routes (planned)

| Route | Purpose |
|-------|---------|
| `/expenses` | Month-scoped list, category filter |
| `/expenses/new` | Log expense (primary Add action) |
| `/expenses/[id]` | Detail, edit, delete (Phase 6.2) |

**Unchanged for savings:** `/transactions/new` — CONTRIBUTION / WITHDRAWAL / ADJUSTMENT to plans. Consider clearer label: “Add to savings plan.”

## Code layout (planned)

```
src/config/expense-options.ts       # categories, payment methods
src/lib/expenses/
  types.ts
  get-expenses.ts
  get-expense-summary.ts            # month totals, by category
src/app/(app)/expenses/
  page.tsx
  new/page.tsx
  [id]/page.tsx                     # Phase 6.2
  actions.ts
src/components/expenses/
  expense-form.tsx
  expense-list.tsx
  expense-category-picker.tsx
```

Mirror patterns from [plans.md](./plans.md) and [transactions.md](./transactions.md): server actions return `{ success, redirectTo }`, Sonner toasts, `PageSkeleton` loading routes.

## Navigation (planned)

| Tab | Route | Change |
|-----|--------|--------|
| Home | `/dashboard` | Add cash-flow card |
| Expenses | `/expenses` | **New** (may replace Insights tab or use “More”) |
| Add | `/expenses/new` | **Primary** (was savings-only) |
| Plans | `/plans` | Unchanged |
| Insights / Settings | existing | TBD wireframe |

Protect `/expenses/*` in [auth.md](./auth.md) / `src/lib/auth/routes.ts`.

## MVP vs later

| Feature | v2 MVP (Phase 6.1) | Later |
|---------|-------------------|--------|
| Log expense | Yes | Recurring expenses |
| Category picker | Presets | Custom categories UI |
| Month list | Yes | Search, week view |
| Edit/delete | Phase 6.2 | Bulk delete in settings |
| Category chart | Phase 6.2 / dashboard | 6-month trends |
| Export CSV | Phase 6.2 | Combined export |
| Category budgets | No | Phase 6+ |
| Bank / UPI sync | No | See [out-of-scope.md](./out-of-scope.md) |
| Link expense → plan | No | Optional future |

## Phases (see [roadmap.md](./roadmap.md))

- **6.0** — Docs + migration SQL draft
- **6.1** — Table, log, list, dashboard cash-flow card, nav
- **6.2** — Edit/delete, category chart, CSV export
- **6.3** — Insights v2 (spend-aware narrative, surplus nudges)

## Related docs

- [cashflow.md](./cashflow.md) — income, spent, saved, surplus formulas
- [dashboard.md](./dashboard.md) — planned `CashFlowCard`
- [schema.md](./schema.md) — migration 001 (shipped); 002 planned here
