# Features

**Last updated:** 2026-06-14 (evening)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-01 | Project scaffold (React + Vite + JS) | done | `savings-tracker` template |
| F-02 | Tailwind CSS v3 configured | done | `tailwind.config.js`, `@tailwind` in `index.css` |
| F-03 | Supabase client (`src/lib/supabase.js`) | done | Reads `VITE_SUPABASE_*` env vars |
| F-04 | Folder structure (`components`, `pages`, `lib`, `hooks`) | done | Placeholder `.gitkeep` files |
| F-05 | Database schema (goals + contributions) | done | SQL provided; run in Supabase editor |
| F-06 | `device_id` generation & persistence | done | `src/lib/device.js` |
| F-07 | Goals CRUD UI | done | `GoalForm` modal + `GoalCard` + Dashboard |
| F-08 | Contributions UI | done | `AddMoneyModal`, expandable list on card |
| F-09 | Progress display | done | Bar, %, saved/remaining, on-track badge |
| F-10 | Routing (`react-router-dom`) | done | `/` → `Dashboard` |
| F-11 | Priority / category filters | deferred | Post-MVP |
| F-12 | Data export | deferred | Post-MVP |
| F-13 | Supabase data layer | done | `goals.js`, `contributions.js`, `useGoals` |
| F-14 | Dashboard page | done | Summary, FAB, grid, skeleton, empty state |
| F-15 | Add money flow | done | Modal, celebration on 100%+, contribution delete |
| F-16 | App polish | done | Theme, toasts, PWA manifest, 44px targets |
| F-17 | Per-goal currency (INR / USD) | done | Chips in form; `formatCurrency(amount, code)` |
| F-18 | Per-goal color palette | done | 6 palettes; card border + progress bar |
| F-19 | Chip-based GoalForm fields | done | Priority, category, currency, color chips |

## Backlog ideas

- Dark mode toggle
- Goal completion celebration / badge — **partial:** `Celebration` component on 100%+ contribution
- Recurring contribution reminders (requires notifications — likely out of scope)
- Charts (monthly savings trend)
- Dashboard sort/filter (deadline, priority, %) — was in early dashboard spec; not in current UI
- More currencies beyond INR/USD
- Custom category (free text) in addition to chips
