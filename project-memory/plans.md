# Savings Plans

> Plan CRUD and forms. Schema: [schema.md](./schema.md).

## Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `/plans` | Shipped | List with Active / Completed / Paused tabs |
| `/plans/new` | Shipped | Create plan |
| `/plans/[id]` | Shipped | Detail with live stats and transaction history |
| `/plans/[id]/edit` | Stub | Form shell; not wired to `updatePlan` |

## Create plan (`/plans/new`)

### Files

| File | Role |
|------|------|
| [`src/app/(app)/plans/new/page.tsx`](../src/app/(app)/plans/new/page.tsx) | Page: `AppShell` + `PlanForm` |
| [`src/components/forms/plan-form.tsx`](../src/components/forms/plan-form.tsx) | react-hook-form + zod + shadcn Card |
| [`src/app/(app)/plans/actions.ts`](../src/app/(app)/plans/actions.ts) | `createPlan()` server action |
| [`src/config/plan-options.ts`](../src/config/plan-options.ts) | Categories, priorities, color presets |

### Form fields

| Field | Required | Notes |
|-------|----------|-------|
| name | Yes | Min 1 character |
| description | No | Textarea |
| category | Yes | Select from `PLAN_CATEGORIES` |
| targetAmountRupees | Yes | Must be &gt; 0; converted to paise on save |
| targetDate | No | `type="date"`; validated if provided |
| priority | Yes | Low / Medium / High / Critical |
| icon | No | Lucide icon name (future display) |
| color | No | Hex string; optional preset swatches |

### Categories (`PLAN_CATEGORIES`)

Emergency Fund, Vacation, House, Car/Bike, Child Education, Investment Goal, Gadget, Wedding/Event, Custom

### Priorities (`PLAN_PRIORITIES`)

Low, Medium, High, Critical (default: Medium)

### Save flow

1. Client validates with zod
2. `targetAmountPaise = Math.round(targetAmountRupees * 100)`
3. `createPlan()` gets `auth.getUser()`, inserts into `savings_plans`
4. On success: `redirect("/plans")`
5. On error: inline message in form

### Database columns written

`user_id`, `name`, `description`, `category`, `target_amount_paise`, `target_date`, `priority`, `icon`, `color` (plus defaults for `status`, timestamps)

## Not in scope

- Expense tracking, investment advice, bank linking, UPI, Account Aggregator, credit score

## List plans (`/plans`) — added 2026-05-23

### Files

| File | Role |
|------|------|
| [`src/lib/plans/get-plans-with-stats.ts`](../src/lib/plans/get-plans-with-stats.ts) | Fetch plans + transactions; enrich per plan |
| [`src/lib/plans/filter-plans.ts`](../src/lib/plans/filter-plans.ts) | Active / Completed / Paused tab rules |
| [`src/components/plans/plans-view.tsx`](../src/components/plans/plans-view.tsx) | Client tabs + `PlanCard` list |
| [`src/components/plans/plan-card.tsx`](../src/components/plans/plan-card.tsx) | Summary card linking to detail |

### Tab rules

- **Paused:** `status` is `"paused"` (case-insensitive)
- **Completed:** `current >= target` and not paused
- **Active:** not paused and not completed

## Plan detail (`/plans/[id]`) — added 2026-05-23

### Files

| File | Role |
|------|------|
| [`src/lib/plans/get-plan-detail.ts`](../src/lib/plans/get-plan-detail.ts) | Auth + `notFound()` for wrong/missing plan |
| [`src/lib/plans/enrich-plan.ts`](../src/lib/plans/enrich-plan.ts) | Shared `enrichPlanWithStats` / `enrichPlanDetail` |
| [`src/app/(app)/plans/[id]/not-found.tsx`](../src/app/(app)/plans/[id]/not-found.tsx) | Friendly 404 |

### UI sections

Progress ring, saved/target/remaining stats, target date + monthly required, projection card, actions (contribution / withdraw / edit), contribution history list.

### Actions links

- Add contribution → `/transactions/new?planId={id}&type=CONTRIBUTION`
- Withdraw → `/transactions/new?planId={id}&type=WITHDRAWAL`

## Shared data layer (`src/lib/plans/`) — added 2026-05-23

| File | Role |
|------|------|
| `types.ts` | `SavingsPlanRow`, `PlanWithStats`, `PlanDetail`, `PlanTransaction` |
| `enrich-plan.ts` | Maps DB rows → stats + optional `projectedCompletionDate` |
| `get-plans-with-stats.ts` | List page data |
| `get-plan-detail.ts` | Detail page data |
| `filter-plans.ts` | Tab filtering (generic over `PlanWithStats`) |

`PlanWithStats` includes: `priority`, `healthStatus`, `averageMonthlySavingsPaise`, `monthlyRequiredPaise`, etc.

## Follow-ups

- Wire `updatePlan` for `/plans/[id]/edit`
- Delete plan with confirmation

---

## v2 note — expense tracking (2026-05-23)

v1 listed expense tracking as not in scope. v2 adds manual expense logging in a **separate ledger** — see [expenses.md](./expenses.md). Savings plan flows in this document are unchanged.
