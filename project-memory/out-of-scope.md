# Out of Scope

These items are **explicitly excluded** from SavingIt v1 and should not be implemented unless product scope changes.

## Financial integrations

| Exclusion | Reason |
|-----------|--------|
| Bank account linking | Manual tracker by design; reduces compliance scope |
| UPI automation | No payment rail integration |
| Account Aggregator (AA) | Out of scope for MVP |
| Credit/debit card sync | Same as bank linking |

## Investment and advice

| Exclusion | Reason |
|-----------|--------|
| Investment recommendations | Not a robo-advisor or brokerage |
| Mutual fund / stock tracking | Savings goals only, not portfolio management |
| Tax optimization advice | Regulatory and scope complexity |

## Other product areas

| Exclusion | Reason |
|-----------|--------|
| Expense tracking | Different product category |
| Credit score features | Unrelated to savings goals |
| Complex family sharing | Single-user ownership in v1 |
| Native iOS or Android apps | Web-first; PWA optional later |

## Technical exclusions (v1)

- Offline-first / local-only mode
- Multi-currency support
- Admin dashboard
- Third-party OAuth providers (unless added deliberately later)
- Real-time collaboration on plans

## When to revisit

Re-evaluate exclusions only after MVP validation with users. Integrations (AA, UPI) would require separate compliance, security, and product design work.

---

## Scope change (v2 — 2026-05-23)

The following **changes scope for v2** (expense + savings tracker). Original v1 exclusions above remain historical record.

### Now in scope (v2 — manual expense + cash flow)

| Item | v2 MVP slice |
|------|----------------|
| Manual expense logging | Yes — separate `expenses` table |
| Monthly spend totals & category breakdown | Yes |
| Dashboard cash-flow card (income / spent / saved / leftover) | Yes |
| Payment method labels (Cash, UPI, Card) | Yes — labels only, no automation |

### Still out of scope (v2 MVP slice)

| Item | Reason |
|------|--------|
| Bank account linking | Unchanged |
| UPI automation | Unchanged |
| Account Aggregator (AA) | Unchanged |
| Category budgets & overspend alerts | Deferred past v2 MVP |
| Investment recommendations | Unchanged |
| Expense ↔ plan linking | Deferred |
| Credit score | Unchanged |
| Complex family sharing | Unchanged |
| Native iOS / Android apps | Unchanged — responsive web + PWA |

**Spec:** [expenses.md](./expenses.md), [cashflow.md](./cashflow.md), [roadmap.md](./roadmap.md) Phase 6.
