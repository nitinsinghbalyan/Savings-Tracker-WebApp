# Changelog

## 2026-06-14

### Added

- React + Vite project (`savings-tracker`) with JavaScript template
- Tailwind CSS v3 (`tailwind.config.js`, `postcss.config.js`, `@tailwind` in `index.css`)
- Dependencies: `@supabase/supabase-js`, `react-router-dom`, `lucide-react`, `date-fns`
- `src/lib/supabase.js` — Supabase client from env vars
- Folder scaffold: `src/components`, `src/pages`, `src/hooks`, `src/lib`
- `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
- SQL schema for `goals` and `contributions` tables (RLS + indexes)
- `project-memory/` documentation folder

### Verified

- `npm run dev` — Vite ready at `http://localhost:5173/`

---

## 2026-06-14 (session 2)

### Added

- Supabase data layer: `goals.js`, `contributions.js`, `useGoals` hook
- `GoalForm` — create/edit modal with validation
- `GoalCard` — progress, on-track badge, required monthly, contribution list
- `Dashboard` page at `/` — summary, FAB, grid, skeleton, empty state
- `AddMoneyModal` + `Celebration` on goal completion
- Toast system (`ToastContext`, `Toast.jsx`)
- PWA: `manifest.webmanifest`, meta tags
- Theme polish: shared Tailwind classes, brand palette, 44px targets
- `dev.cmd` / `build.cmd` for Windows PowerShell execution policy workaround

### Changed

- `GoalForm`: chip selectors for currency, priority, category, color; removed starting balance
- `formatCurrency(amount, currency)` — INR default, USD support
- `goals` schema extension: `currency`, `color` (`supabase/add_currency_color.sql`)
- `src/lib/constants.js` — currencies, categories, color palettes

### Verified

- `npm run lint` and `npm run build` pass (use `npm.cmd` on Windows if PS blocks scripts)
