# Insights

> Savings health and planning tools at `/insights`. No investment advice.

## Route

| Route | Status | Purpose |
|-------|--------|---------|
| `/insights` | Shipped | Health score, narrative, chart, simulator, allocation |

Dynamic server route (`getInsightsData`).

## Files

| File | Role |
|------|------|
| [`src/app/(app)/insights/page.tsx`](../src/app/(app)/insights/page.tsx) | Async server page |
| [`src/lib/insights/get-insights-data.ts`](../src/lib/insights/get-insights-data.ts) | Server fetch + compose |
| [`src/lib/insights/health-score.ts`](../src/lib/insights/health-score.ts) | Score 0–100 |
| [`src/lib/insights/generate-narrative.ts`](../src/lib/insights/generate-narrative.ts) | Strengths, weaknesses, actions |
| [`src/lib/insights/simulate-extra-savings.ts`](../src/lib/insights/simulate-extra-savings.ts) | Simulator math |
| [`src/lib/insights/recommend-allocation.ts`](../src/lib/insights/recommend-allocation.ts) | Monthly allocation |
| [`src/lib/insights/streak.ts`](../src/lib/insights/streak.ts) | Positive months / streak |
| [`src/components/insights/*`](../src/components/insights/) | UI |

## Savings Health Score (0–100)

Deterministic breakdown:

| Component | Max points | Logic |
|-----------|------------|--------|
| Savings pace | 30 | `sum(avgMonthly) / sum(monthlyRequired)` on active plans with target date |
| Emergency fund | 25 | Progress % on plan with category `Emergency Fund` (0 if none) |
| Consistency | 20 | Share of last 6 months with net positive savings |
| On-track plans | 15 | Share of active plans with `ON_TRACK` health |
| Low withdrawals | 10 | Inverse of withdrawal share vs contributions (last 6 months) |

Sub-scores are shown on the score card for transparency.

## UI sections

1. Score card with breakdown bars
2. Strengths and weaknesses
3. Recommended actions
4. 6-month savings chart
5. At-risk plans (CRITICAL / SLIGHTLY_BEHIND)
6. Completed milestones
7. **Simulator** (client) — extra monthly ₹ → projected completion per active plan
8. **Allocation** (client) — available ₹ this month → suggested split with reasons

## Allocation sort order

Greedy allocation across active plans, sorted by:

1. Priority: Critical → High → Medium → Low
2. Category: Emergency Fund first
3. Earliest target date (nulls last)
4. Lowest progress %

Each line includes human-readable `reasons[]` (e.g. "Critical priority", "Emergency Fund").

## Simulator

`simulateExtraMonthlySavings(plan, extraPaise)` adds extra amount to `averageMonthlySavingsPaise` and recomputes `projectCompletionDate`.

## Disclaimers

Copy on simulator and allocation: suggestions allocate savings across **your plans only** — not investment advice.

## Out of scope

- Stock/MF recommendations
- Expense budgets, bank linking, credit score
- Persisting simulator inputs to database

## Related

- Calculations: [calculations.md](./calculations.md)
- Dashboard overview: [dashboard.md](./dashboard.md)

---

## Planned v2: spend-aware insights (2026-05-23)

Phase 6.3 — not implemented. See [cashflow.md](./cashflow.md).

| Enhancement | Description |
|-------------|-------------|
| Combined narrative | Mention monthly spend vs income alongside savings health score |
| Spend rate | `spentThisMonth / incomeThisMonth` when income set |
| Surplus nudges | When leftover &gt; 0, suggest allocation to plans (reuse allocation UI) |
| Category simulator | “Reduce Food by ₹X” → projected surplus increase |

**Unchanged:** No investment advice; savings-plan framing only.

---

## v2 note (expense budgets)

v1 “Expense budgets” remains out of scope for v2 MVP. Manual expense **logging** is in scope — [expenses.md](./expenses.md), [out-of-scope.md](./out-of-scope.md) scope-change section.
