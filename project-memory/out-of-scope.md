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
