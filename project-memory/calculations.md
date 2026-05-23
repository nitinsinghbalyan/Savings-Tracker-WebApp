# Calculations Library

> Pure TypeScript at [`src/lib/calculations/`](../src/lib/calculations/). No UI or Supabase imports.

## Files

| File | Exports |
|------|---------|
| [`types.ts`](../src/lib/calculations/types.ts) | `TransactionType`, `SavingsTransaction`, `PlanHealthStatus`, `toDate()` |
| [`savings.ts`](../src/lib/calculations/savings.ts) | Balance, progress, remaining, monthly pace, health status |
| [`projections.ts`](../src/lib/calculations/projections.ts) | `projectCompletionDate()` |

## Functions

### `savings.ts`

| Function | Description |
|----------|-------------|
| `calculatePlanCurrentAmount(transactions)` | Net balance from CONTRIBUTION (+), WITHDRAWAL (−), ADJUSTMENT (signed +) |
| `calculateProgress(current, target)` | Percentage 0–100, 2 decimal places |
| `calculateRemainingAmount(current, target)` | `max(0, target − current)` |
| `calculateMonthsRemaining(targetDate, referenceDate?)` | Calendar months; min 1 if same month ahead |
| `calculateMonthlyRequired(remaining, targetDate, referenceDate?)` | `ceil(remaining / months)` paise |
| `calculateAverageMonthlySavings(transactions, monthsWindow?, referenceDate?)` | Net over last N months ÷ N (default window 6) |
| `getPlanHealthStatus({...})` | See health rules below |

### `projections.ts`

| Function | Description |
|----------|-------------|
| `projectCompletionDate({ current, target, monthlyContribution, referenceDate? })` | `Date` if completable; `null` if contribution ≤ 0 |

## Plan health status

Evaluated in order:

1. **PAUSED** — `status` is `"Paused"` (case-insensitive)
2. **COMPLETED** — `current >= target`
3. **ACTIVE** — no `targetDate`
4. **CRITICAL** — target date in the past and not complete
5. **ON_TRACK** — avg monthly savings ≥ 95% of required monthly
6. **SLIGHTLY_BEHIND** — avg ≥ 70% of required
7. **CRITICAL** — below 70%

Threshold constants: `ON_TRACK_THRESHOLD = 0.95`, `SLIGHTLY_BEHIND_THRESHOLD = 0.7` (exported from `savings.ts`).

## Usage example

```typescript
import { calculatePlanCurrentAmount, calculateProgress } from "@/lib/calculations/savings";
import { projectCompletionDate } from "@/lib/calculations/projections";

const current = calculatePlanCurrentAmount(transactions);
const progress = calculateProgress(current, plan.targetAmountPaise);
const completion = projectCompletionDate({
  currentAmountPaise: current,
  targetAmountPaise: plan.targetAmountPaise,
  monthlyContributionPaise: 50_000_00,
});
```

## Not yet wired

_(Historical note from initial library ship — see below.)_

## Wired to UI (added 2026-05-23)

| Consumer | Usage |
|----------|--------|
| `src/lib/plans/enrich-plan.ts` | Current amount, progress, remaining, monthly required, health, avg monthly savings |
| `src/lib/plans/get-plan-detail.ts` | `projectCompletionDate` on detail |
| `src/lib/dashboard/` | Aggregates, month net savings, dashboard insight strings |
| `src/lib/insights/health-score.ts` | Pace, consistency, on-track sub-scores |
| `src/lib/insights/simulate-extra-savings.ts` | Simulator with extra monthly pace |
| `src/lib/transactions/estimate-withdrawal-delay.ts` | Withdrawal warning on transaction form |
| `src/components/plans/*`, `dashboard/*`, `insights/*` | Display only; math stays in `lib/` |

## Tests

Logic is unit-testable; no test runner configured yet. Future: vitest against `savings.ts` / `projections.ts`.
