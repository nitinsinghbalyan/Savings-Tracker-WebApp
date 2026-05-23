# Dashboard

> Home overview at `/dashboard`. Aggregates from plans + transactions.

## Route

| Route | Status | Purpose |
|-------|--------|---------|
| `/dashboard` | Shipped | Greeting, totals, chart, quick actions, active plan cards |

Dynamic server route (`getDashboardData`).

## Files

| File | Role |
|------|------|
| [`src/app/(app)/dashboard/page.tsx`](../src/app/(app)/dashboard/page.tsx) | Async server page |
| [`src/lib/dashboard/get-dashboard-data.ts`](../src/lib/dashboard/get-dashboard-data.ts) | Fetch + aggregate |
| [`src/lib/dashboard/aggregate-metrics.ts`](../src/lib/dashboard/aggregate-metrics.ts) | Totals, counts, month stats |
| [`src/lib/dashboard/generate-insights.ts`](../src/lib/dashboard/generate-insights.ts) | Short insight strings |
| [`src/lib/dashboard/period-savings.ts`](../src/lib/dashboard/period-savings.ts) | Month net + 6-month series |
| [`src/components/dashboard/*`](../src/components/dashboard/) | UI cards and chart |

## Metrics

| Metric | Source |
|--------|--------|
| Total saved | Sum of `currentAmountPaise` across all plans |
| Total target | Sum of `targetAmountPaise` |
| Overall progress | `calculateProgress(totalSaved, totalTarget)` |
| Saved this month | Net transaction activity in current calendar month |
| Required this month | Sum of `monthlyRequiredPaise` for **active** plans with target date |
| Active / completed / at-risk | Same tab and health rules as `/plans` |

## UI sections

1. Greeting (time of day + profile name or email fallback)
2. Hero card — total saved + plan counts
3. Overall progress card
4. This month card (saved vs required)
5. Quick actions — log contribution, new plan, view plans
6. 6-month savings bar chart (Recharts)
7. Active plan cards (top 4, reuses `PlanCard`)
8. Insights card (2–4 generated strings)

Empty state when user has no plans → CTA to `/plans/new`.

## Greeting data

Optional read from `profiles.full_name`; fallback to email local-part or `"there"`.

## Out of scope

- Expense tracking, bank balances, investment recommendations
- Edit transactions from dashboard

## Related

- Deeper analytics: [insights.md](./insights.md)
- Plan list: [plans.md](./plans.md)

---

## Planned v2: CashFlowCard (2026-05-23)

Not implemented. See [cashflow.md](./cashflow.md).

| Metric | Source | Display |
|--------|--------|---------|
| Income | `profiles.monthly_income_paise` | Full month (MVP) |
| Spent | `SUM(expenses)` current month | Tap → `/expenses` |
| Saved to goals | Net savings transactions (contributions − withdrawals) | Existing dashboard logic |
| Leftover | income − spent − saved | Green if positive; destructive if negative |

**Component:** `CashFlowCard` at top of dashboard `page-content`, above `DashboardHeroCard`.

**Data:** extend `getDashboardData()` or call `get-monthly-cashflow.ts` in parallel.

---

## v2 note (expense tracking)

v1 listed expense tracking as out of scope. v2 adds manual expenses — see [expenses.md](./expenses.md). Original v1 boundary preserved in section “Out of scope” above.
