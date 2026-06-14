# Architecture

**Last updated:** 2026-06-14 (evening)

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + Vite 8 |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 |
| Routing | react-router-dom |
| Icons | lucide-react |
| Dates | date-fns |
| Backend | Supabase (Postgres + REST via supabase-js) |
| Auth | None — anon key + `device_id` |

## Environment variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Folder structure

```
src/
├── components/   # GoalCard, GoalForm, AddMoneyModal, Toast, Celebration, …
├── pages/        # Dashboard.jsx (`/` route)
├── hooks/        # useGoals, useToast (re-export)
├── context/      # ToastContext / ToastProvider
├── lib/          # supabase, device, goals, contributions, format, constants, errors
├── assets/
├── App.jsx       # Router + ToastProvider
├── main.jsx
└── index.css     # Tailwind + shared component classes
public/
├── manifest.webmanifest
├── favicon.svg
supabase/
└── add_currency_color.sql   # migration for currency + color columns
```

## Data access pattern

Every Supabase query must include `.eq('device_id', deviceId)` (or equivalent) so rows are scoped to the current browser.

```js
// Implemented in src/lib/goals.js and src/lib/contributions.js
const { data } = await supabase
  .from('goals')
  .select('*, contributions(*)')
  .eq('device_id', deviceId)
```

## Currency & formatting

- `formatCurrency(amount, currency)` — `INR` (default, `en-IN`) or `USD` (`en-US`)
- `formatCurrencyCompact(amount, currency)` — compact notation for summary on small screens
- Constants: `src/lib/constants.js` — `CURRENCIES`, `CATEGORIES`, `COLOR_PALETTES`, `PRIORITIES`

## Goal form UX (current)

- Chip selectors: currency, priority, category (toggle off), color palette
- No starting-balance field (removed; use Add money after create)
- Modal / bottom-sheet pattern shared with `AddMoneyModal`

## PWA

- `public/manifest.webmanifest` + meta tags in `index.html`
- Requires HTTPS (or localhost) for install prompt

## Windows dev note

- PowerShell may block `npm.ps1` — use `npm.cmd run dev`, `.\dev.cmd`, or set terminal to Command Prompt (`.vscode/settings.json`)

## Database indexes

- `goals(device_id)`
- `contributions(device_id)`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server (default `http://localhost:5173`) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm.cmd run dev` | Dev server on Windows when PS execution policy blocks `npm.ps1` |
| `.\dev.cmd` / `.\build.cmd` | Wrapper scripts in project root |
