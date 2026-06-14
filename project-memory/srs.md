# Software Requirements Specification — Savings Tracker

**Version:** 0.2  
**Last updated:** 2026-06-14 (evening)

## 1. Purpose

A personal savings tracker web app that lets users define savings goals, log contributions, and monitor progress over time — without account sign-up or login.

## 2. Scope

### In scope

- Create, edit, and delete savings goals
- Log contributions against goals
- View progress toward target amounts
- Persist data in Supabase, scoped per browser/device via `device_id`
- Responsive UI built with React, Vite, and Tailwind CSS

### Out of scope (v0)

- User authentication / multi-device sync via accounts
- Shared goals between users
- Payment integrations
- Native mobile apps

## 3. Users

| User type | Description |
|-----------|-------------|
| Anonymous visitor | Uses the app in a browser; identified only by a locally stored `device_id` |

## 4. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Generate and persist a unique `device_id` in local storage on first visit | Must |
| FR-02 | Create a goal with name, target amount, optional end date, priority, and category | Must |
| FR-03 | List all goals for the current `device_id` | Must |
| FR-04 | Edit and delete goals owned by the current `device_id` | Must |
| FR-05 | Add a contribution (amount, optional note) to a goal | Must |
| FR-06 | Display total contributed vs target per goal | Must |
| FR-07 | Filter or sort goals (e.g. by priority, date) | Should |
| FR-08 | Show contribution history per goal | Should |
| FR-09 | Select goal currency (INR default, USD optional) | Must |
| FR-10 | Select goal color palette for visual identity | Should |
| FR-11 | Chip UI for priority, category, currency, color on goal form | Should |

## 5. Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | No login — app uses Supabase anon key only |
| NFR-02 | All API queries filter by `device_id` in application code |
| NFR-03 | Page load and interactions should feel snappy on modern browsers |
| NFR-04 | Works on mobile viewport widths |

## 6. Data model

### `goals`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| device_id | text | Required; scopes row to browser |
| name | text | Required |
| target_amount | numeric | Required |
| start_date | date | Default `now()` |
| end_date | date | Optional |
| priority | text | `high` \| `medium` \| `low`, default `medium` |
| category | text | Optional |
| currency | text | `INR` \| `USD`, default `INR` — migration: `supabase/add_currency_color.sql` |
| color | text | `indigo` \| `rose` \| `emerald` \| `amber` \| `violet` \| `cyan`, default `indigo` |
| created_at | timestamptz | Default `now()` |

### `contributions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| goal_id | uuid | FK → `goals(id)` ON DELETE CASCADE |
| device_id | text | Required |
| amount | numeric | Required |
| note | text | Optional |
| created_at | timestamptz | Default `now()` |

## 7. Security model

- Row Level Security enabled on both tables
- Permissive anon policies (app enforces `device_id` filtering)
- **Known limitation:** anyone with the anon key can access all rows if they bypass the app

## 8. Assumptions & dependencies

- Supabase project provisioned with schema from project SQL
- `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- User accepts single-device, no-auth data isolation

## 9. Open questions

- [ ] Should `device_id` be regenerated on demand (reset data)?
- [ ] Export / import goals as JSON?
- [x] Currency formatting locale? — **Resolved:** INR default, USD per goal; `formatCurrency(amount, currency)` in `src/lib/format.js`
- [ ] Mixed-currency dashboard totals — currently separate progress rows per currency (no conversion)
