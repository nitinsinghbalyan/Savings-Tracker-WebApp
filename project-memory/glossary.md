# Glossary

| Term | Definition |
|------|------------|
| **SavingIt** | The product; mobile-first INR savings tracker web app |
| **Savings plan** | A user-defined goal with a name and target amount (e.g., "Emergency fund", ₹5,00,000) |
| **Contribution** | A manual deposit logged against a savings plan (amount + date + optional note) |
| **Paise** | Smallest INR unit; 100 paise = 1 rupee. All amounts stored as integer paise in the database |
| **Rupees** | Display/input unit for users; converted to paise before persistence |
| **Progress** | Ratio of saved amount to target amount for a plan, usually shown as percentage or bar |
| **Dashboard** | Home screen showing aggregate savings metrics |
| **Insights** | Analytics views: trends, projections, milestones |
| **AppShell** | Layout wrapper: header + scrollable main + bottom navigation |
| **Bottom nav** | Fixed mobile navigation: Dashboard, Plans, Add, Insights, Settings |
| **RLS** | Row Level Security — Supabase Postgres policy ensuring users access only their rows |
| **Stub** | UI or code placeholder without real backend integration |
| **MVP** | Minimum viable product: auth + plans + contributions + basic dashboard |
| **L / Cr** | Indian compact number suffixes: Lakh (1,00,000), Crore (1,00,00,000) |
| **Middleware** | Next.js edge middleware that refreshes Supabase session and enforces route access |
| **Plan health status** | COMPLETED, ACTIVE, ON_TRACK, SLIGHTLY_BEHIND, CRITICAL, PAUSED — from `getPlanHealthStatus()` |
| **Transaction type** | CONTRIBUTION, WITHDRAWAL, or ADJUSTMENT on `savings_transactions` |
| **Monthly snapshot** | Per-user row in `monthly_snapshots` for a calendar month (`YYYY-MM`) |
| **SRS** | Software Requirements Specification |

## Abbreviations

| Abbr | Meaning |
|------|---------|
| INR | Indian Rupee (₹) |
| FR | Functional requirement (in SRS) |
| NFR | Non-functional requirement (in SRS) |
| CRUD | Create, Read, Update, Delete |
| SSR | Server-Side Rendering |
| RSC | React Server Components |
