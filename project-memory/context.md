# Project Context

## Product name

**SavingIt** — a mobile-first INR savings tracker web app.

## Vision

Help individuals in India manually track savings across multiple goals, see progress clearly, log contributions, and understand trends over time — without bank linking or investment advice.

## Problem statement

People save toward multiple goals (emergency fund, travel, home down payment) using separate accounts, FDs, or informal tracking. Spreadsheets and notes break down when goals multiply. SavingIt provides a focused, manual tracker with Indian currency formatting and a mobile-native experience.

## Target users

- Salaried professionals and freelancers saving in INR
- Users who prefer **manual entry** over automated bank sync
- Mobile-first users who occasionally use desktop

## Core value proposition

1. **Multiple savings plans** — one place for all goals
2. **Progress at a glance** — dashboard and per-plan views
3. **Contribution logging** — record deposits with date and notes
4. **Insights** — trends and projections (planned)
5. **Privacy-first manual tracking** — no account aggregator or UPI automation

## Product principles

| Principle | Implication |
|-----------|-------------|
| Mobile-first | Bottom nav, touch targets, max-width container on desktop |
| INR-native | Store amounts in paise; display with Indian grouping (L/Cr compact) |
| Manual by design | User enters contributions; no bank feeds |
| Simple over clever | Few screens, clear actions, minimal configuration |
| Dark fintech aesthetic | Trustworthy, modern, easy on the eyes |

## Geography and currency

- **Primary market:** India
- **Currency:** INR only (locked in settings for v1)
- **Locale formatting:** `en-IN`

## Deployment

- **Hosting:** Vercel
- **Backend:** Supabase (Auth + Postgres)
- **No native apps** in scope for v1

## Success metrics (future)

- User creates at least one savings plan within first session
- Weekly contribution logging retention
- Time to log a contribution under 30 seconds on mobile
