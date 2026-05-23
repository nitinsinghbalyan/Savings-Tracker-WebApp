# Settings

> Account, profile, exports, and data management at `/settings`.

## Route

| Route | Status | Purpose |
|-------|--------|---------|
| `/settings` | Shipped | Profile, exports, logout, danger zone |

Dynamic server route (`getSettingsData`).

## Files

| File | Role |
|------|------|
| [`src/app/(app)/settings/page.tsx`](../src/app/(app)/settings/page.tsx) | Async server page |
| [`src/app/(app)/settings/actions.ts`](../src/app/(app)/settings/actions.ts) | Server actions |
| [`src/lib/settings/get-settings-data.ts`](../src/lib/settings/get-settings-data.ts) | Load auth user + profile |
| [`src/lib/settings/csv.ts`](../src/lib/settings/csv.ts) | CSV builders |
| [`src/lib/settings/types.ts`](../src/lib/settings/types.ts) | `UserProfile`, `SettingsData` |
| [`src/components/settings/*`](../src/components/settings/) | Profile form, exports, danger zone, logout |
| [`src/components/ui/alert-dialog.tsx`](../src/components/ui/alert-dialog.tsx) | Confirm destructive actions |

## Profile

Displayed and editable fields:

| Field | Editable | Storage |
|-------|----------|---------|
| Email | No (from `auth.users`) | — |
| Full name | Yes | `profiles.full_name` |
| Monthly income | Yes (₹) | `profiles.monthly_income_paise` |
| Preferred saving day | Yes (1–31) | `profiles.preferred_saving_day` |
| Currency | No (INR locked) | `profiles.currency` always `INR` |

Save flow: `updateProfile()` → `profiles.upsert` with `id = auth.uid()`. Creates profile row on first save if signup trigger not yet added.

Dashboard greeting uses `profiles.full_name` when set ([dashboard.md](./dashboard.md)).

## Data management

| Action | Server action | Output |
|--------|---------------|--------|
| Export transactions | `exportTransactionsCsv()` | CSV with plan name, amounts, type, source, note, dates |
| Export plans | `exportPlansCsv()` | CSV with plan metadata and target amounts |

Client triggers browser download via Blob (dated filename).

## Danger zone

Both require **AlertDialog** confirmation:

| Action | Effect |
|--------|--------|
| Delete all transactions | Removes all `savings_transactions` for user; plans remain |
| Delete all plans | Removes all `savings_plans`; transactions cascade (FK) |

Calls `revalidatePath` on dashboard, plans, insights after delete.

## Sign out

`logout()` — `signOut()` + redirect `/auth/login`.

## Not in scope

- Family sharing
- Bank linking, UPI mandates, Account Aggregator consent
- Credit score
- Native app / device settings

## Follow-ups

- Auto-create `profiles` row on signup (DB trigger or auth hook)
- Edit/delete individual plans or transactions from settings (use plan/transaction pages instead)
