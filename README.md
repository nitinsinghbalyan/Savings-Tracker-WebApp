# SavingIt

A mobile-first INR savings tracker for multiple savings plans, progress tracking, contribution logging, projections, and insights.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth and Postgres
- Recharts
- date-fns
- react-hook-form
- zod

## Project memory

Product context, SRS, architecture, and conventions live in [`project-memory/`](./project-memory/README.md).

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.local.example .env.local
```

3. Add your Supabase project URL and anon key to `.env.local`.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/dashboard` | Savings overview |
| `/plans` | Savings plans list |
| `/plans/new` | Create a plan |
| `/plans/[id]` | Plan details |
| `/plans/[id]/edit` | Edit a plan |
| `/transactions/new` | Log a contribution |
| `/insights` | Savings insights |
| `/settings` | App settings |

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables.
4. Deploy.

## Amounts

All monetary values are stored internally in **paise** (1 rupee = 100 paise). Use the helpers in `src/lib/format-inr.ts`:

- `formatINR(amountPaise)` — full INR formatting
- `formatCompactINR(amountPaise)` — compact lakh/crore formatting
