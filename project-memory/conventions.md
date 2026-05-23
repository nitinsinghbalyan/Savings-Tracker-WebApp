# Conventions

## Money (critical)

| Rule | Detail |
|------|--------|
| Storage unit | **Paise** (integer). 1 INR = 100 paise |
| Never store floats | Avoid `DECIMAL` in app logic; use integers |
| Form input | Users enter **rupees** in UI |
| On save | `amountPaise = Math.round(rupees * 100)` |
| On display | Use `formatINR(amountPaise)` or `formatCompactINR(amountPaise)` |

```typescript
// Display
formatINR(125_000_000)        // "₹12,50,000.00" (en-IN)
formatCompactINR(4_500_000)   // "₹45K"
```

## Naming

| Context | Convention | Example |
|---------|------------|---------|
| Files (components) | kebab-case | `mobile-header.tsx` |
| React components | PascalCase | `MobileHeader` |
| Functions | camelCase | `formatINR` |
| DB columns | snake_case | `target_amount_paise` |
| TS domain types | camelCase fields | `targetAmountPaise` |
| Routes | kebab-case paths | `/transactions/new` |

## Forms

- **react-hook-form** + **zod** for all user input
- Resolver: `zodResolver(schema)`
- Number inputs: `register("field", { valueAsNumber: true })`
- Submit handlers stub with `console.log` until Supabase wired

## UI

- Mobile-first Tailwind classes
- App pages: wrap in `AppShell` with appropriate `title`, `showBack`, `backHref`
- Content width: `max-w-lg mx-auto`
- Bottom nav clearance: `pb-24` on main when nav visible
- Use shadcn components from `@/components/ui`
- Use `cn()` from `@/lib/utils` for conditional classes
- Icons from `lucide-react`

## shadcn / Button note

Current Button (base-ui) does **not** support Radix `asChild`. Use `buttonVariants()` with `Link` instead:

```tsx
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Link href="/plans/new" className={cn(buttonVariants(), "w-full")}>
  Create plan
</Link>
```

## Navigation

- Bottom nav items defined once in `src/config/navigation.ts`
- Active state via `usePathname()` in `BottomNav`
- Plans tab active for `/plans/*` routes

## Supabase

- Browser: `createClient()` from `@/lib/supabase/client`
- Server/RSC: `await createClient()` from `@/lib/supabase/server`
- Never expose service role key in client code

## Imports

Use path alias `@/` for all internal imports:

```typescript
import { AppShell } from "@/components/layout/AppShell";
import { formatINR } from "@/lib/format-inr";
```

## Git and commits

- Do not commit `.env.local`
- Commit `.env.local.example` with placeholder values only

## Comments

- Prefer self-documenting code
- Comment only non-obvious business logic (e.g., paise conversion, RLS assumptions)

---

## Authentication (added 2026-05-23)

See [auth.md](./auth.md).

| Rule | Detail |
|------|--------|
| Browser auth calls | Use `createClient()` from `@/lib/supabase/client` in client components |
| Server auth calls | Use `await createClient()` from `@/lib/supabase/server` in server actions / RSC |
| Session validation | Prefer `getUser()` over `getSession()` in middleware and server code |
| Route protection | Centralized in `src/middleware.ts`; path lists in `src/lib/auth/routes.ts` |
| Logout | Server action with `signOut()` + `redirect("/auth/login")` |
| Post-login navigation | `router.refresh()` then `router.push("/dashboard")` |
| Auth errors | Display inline in form; toast optional for auth |
| Success / CRUD feedback | Sonner toasts via `toast.success` / `toast.error` in client forms |

---

## Calculations (added 2026-05-23)

See [calculations.md](./calculations.md).

| Rule | Detail |
|------|--------|
| Location | `src/lib/calculations/` only — no React or Supabase |
| Amounts | Integer paise throughout |
| Dates | date-fns (`differenceInCalendarMonths`, `addMonths`, etc.) |
| Plan balance | Always derive from transactions via `calculatePlanCurrentAmount()` |
| DB vs app | Do not store denormalized saved totals on plans in v1 |
| Health thresholds | Tune via `ON_TRACK_THRESHOLD` / `SLIGHTLY_BEHIND_THRESHOLD` in `savings.ts` |

---

## Savings plans (added 2026-05-23)

See [plans.md](./plans.md).

| Rule | Detail |
|------|--------|
| Form amounts | Users enter rupees (`targetAmountRupees`); server stores paise |
| Conversion | `Math.round(rupees * 100)` in form before `createPlan` |
| Categories / priority | Use constants from `src/config/plan-options.ts` |
| Create flow | Client form → server action → toast → `router.push(redirectTo)` |
| List/detail/edit | List/detail shipped; edit still stub |

---

## Environment (added 2026-05-23)

| Rule | Detail |
|------|--------|
| Validation | `getPublicEnv()` from `@/lib/env` before Supabase client creation |
| Local setup | Copy `.env.example` → `.env.local` |
| Never commit | `.env.local` or real anon keys |
| Optional | `NEXT_PUBLIC_APP_URL` for production metadata URLs |

---

## Server vs client imports (added 2026-05-23)

| Rule | Detail |
|------|--------|
| RSC pages | Must not import functions from `"use client"` modules |
| Shared parsers | Put in `src/lib/` without `"use client"` (e.g. `parse-transaction-type.ts`) |
| Forms | Client components only; export components, not helpers used on server |

---

## Toasts (added 2026-05-23)

- Provider: `AppProviders` wraps app with Sonner `Toaster` (`theme="dark"`, top-center)
- Use after successful server actions: plan create, transaction create, profile update, bulk delete, CSV export
- Server actions should not `redirect()` if a toast should appear — return `success` + `redirectTo` instead

---

## Expenses (planned v2 — 2026-05-23)

See [expenses.md](./expenses.md).

| Rule | Detail |
|------|--------|
| Ledger | `expenses` table only — never insert daily spending into `savings_transactions` |
| Amount sign | `amount_paise` always **positive** (outflow) |
| Form input | Users enter rupees; `Math.round(rupees * 100)` on save |
| Categories | Presets from `expense-options.ts`; custom categories later |
| Payment method | Label only (Cash, UPI, Card) — no payment API |
| Plan balance | Unaffected by expense rows unless user also logs savings transaction |
| Server actions | Same toast + `{ success, redirectTo }` pattern as plans |
