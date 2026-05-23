# Savings Plans

> Plan CRUD and forms. Schema: [schema.md](./schema.md).

## Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `/plans` | Stub | List (EmptyState only; no DB fetch yet) |
| `/plans/new` | Shipped | Create plan |
| `/plans/[id]` | Stub | Detail with sample data |
| `/plans/[id]/edit` | Stub | Form shell; not wired to update |

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

## Follow-ups

- Fetch and render plans on `/plans`
- Wire `updatePlan` for `/plans/[id]/edit`
- Use `src/lib/calculations/` for progress on detail page
