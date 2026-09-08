import { useMemo } from 'react'
import { formatMoney } from '../../lib/format'

// Actual-vs-plan is resolved from transactions ALREADY in the context cache.
// This section never triggers a fetch of its own: an unbounded ledger read is
// exactly what got the previous net worth tracker removed (session 46).
export default function ContributionPlanSection({ plans = [], transactions = [], currency = 'INR' }) {
  const actualByCategory = useMemo(() => {
    const map = new Map()
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue
      if (!tx.category_id) continue
      if ((tx.account?.currency ?? 'INR') !== currency) continue
      map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + (Number(tx.amount) || 0))
    }
    return map
  }, [transactions, currency])

  const rows = useMemo(
    () =>
      plans
        .filter((p) => !p.is_archived && (p.currency ?? 'INR') === currency)
        .map((p) => {
          const planned = Number(p.monthly_amount) || 0
          const actual = p.category_id ? (actualByCategory.get(p.category_id) ?? null) : null
          return { ...p, planned, actual }
        }),
    [plans, currency, actualByCategory],
  )

  const monthlyTotal = rows.reduce((sum, r) => sum + r.planned, 0)

  if (rows.length === 0) return null

  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Contribution plan
        </h2>
        <span className="n text-[12px] font-medium text-ink-muted">
          {formatMoney(monthlyTotal * 12, currency)}/yr
        </span>
      </div>

      <div className="border-t border-ink-rule">
        {rows.map((row) => {
          const onTrack = row.actual !== null && row.actual >= row.planned
          return (
            <div
              key={row.id}
              className="flex items-center gap-3 border-b border-ink-hairline px-0.5 py-[15px]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-ink">{row.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-faint">
                  {row.actual === null ? (
                    'Planned only'
                  ) : (
                    <>
                      This month{' '}
                      <span className={`n ${onTrack ? 'text-positive' : 'text-ink-muted'}`}>
                        {formatMoney(row.actual, currency)}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <p className="n shrink-0 text-[13.5px] font-medium text-ink">
                {formatMoney(row.planned, currency)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
