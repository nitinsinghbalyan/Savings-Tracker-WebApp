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

Dashboard, plan detail, and insights pages still use placeholder data — import these helpers when connecting to Supabase.

## Tests

Logic is unit-testable; no test runner configured yet. Future: vitest against `savings.ts` / `projections.ts`.
