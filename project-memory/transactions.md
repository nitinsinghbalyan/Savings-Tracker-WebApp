# Transactions (Contributions)

> Logging savings activity against plans. Schema: [schema.md](./schema.md).

## Route

| Route | Status | Purpose |
|-------|--------|---------|
| `/transactions/new` | Shipped | Log CONTRIBUTION, WITHDRAWAL, or ADJUSTMENT |

Bottom nav **Add** links here.

## Files

| File | Role |
|------|------|
| [`src/app/(app)/transactions/new/page.tsx`](../src/app/(app)/transactions/new/page.tsx) | Server page; reads `searchParams` |
| [`src/components/forms/transaction-form.tsx`](../src/components/forms/transaction-form.tsx) | Client form (react-hook-form + zod) |
| [`src/app/(app)/transactions/actions.ts`](../src/app/(app)/transactions/actions.ts) | `createTransaction()` server action |
| [`src/config/transaction-options.ts`](../src/config/transaction-options.ts) | Types and source labels |
| [`src/lib/transactions/estimate-withdrawal-delay.ts`](../src/lib/transactions/estimate-withdrawal-delay.ts) | Withdrawal impact projection |
| [`src/lib/transactions/parse-transaction-type.ts`](../src/lib/transactions/parse-transaction-type.ts) | Parse `?type=` query param (server-safe) |

## Form fields

| Field | Required | Notes |
|-------|----------|-------|
| planId | Yes | Select from user's plans |
| transactionType | Yes | CONTRIBUTION, WITHDRAWAL, ADJUSTMENT |
| amountRupees | Yes | &gt; 0; converted to paise |
| transactionDate | Yes | `type="date"` |
| source | No | Salary, Bonus, Gift, FD Maturity, UPI, Cash, Investment Redemption, Other |
| note | No | Free text |

**UPI** and other sources are display labels only — no payment processing.

## Query parameters

| Param | Effect |
|-------|--------|
| `planId` | Preselect plan; back link to plan detail; redirect to `/plans/[id]` after save |
| `type` | Default transaction type (e.g. from plan detail Withdraw button) |

## Save flow

1. Client validates with zod
2. `amountPaise = Math.round(amountRupees * 100)`
3. `createTransaction()` verifies plan ownership, inserts `savings_transactions`
4. Returns `{ success: true, redirectTo }` — client shows toast, then `router.push(redirectTo)`
5. Redirect target: `/plans/[id]` if opened with `planId`, else `/dashboard`

## Server page query parsing

`new/page.tsx` (Server Component) uses `parseTransactionType(type)` from **`lib/transactions/parse-transaction-type.ts`** — not from `transaction-form.tsx` (client module).

## Withdrawal warning

When type is WITHDRAWAL and amount &gt; 0, shows estimated delay to goal using `projectCompletionDate` and 6-month average savings pace.

## Balance model

Plan **saved amount** is never stored on `savings_plans`. Always derived via `calculatePlanCurrentAmount(transactions)` in [`enrich-plan.ts`](../src/lib/plans/enrich-plan.ts).

## Not in scope

- UPI / bank payment automation
- Edit or delete transactions from UI (planned)

## Follow-ups

- `updateTransaction` / `deleteTransaction`
- Recent activity feed on dashboard (optional enhancement)
