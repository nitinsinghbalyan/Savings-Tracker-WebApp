import { formatCurrency } from '../lib/format'

// Artboard 1d "Funding by month": six months of contributions to one goal,
// read from the contributions already loaded with it.
export default function FundingByMonth({ funding, currency = 'INR' }) {
  if (!funding?.hasAny) return null

  const { buckets, average, max } = funding

  return (
    <section className="rounded-xl border border-ink-rule bg-paper-card p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Funding by month
        </h4>
        <span className="n text-[11px] text-ink-faint">
          avg {formatCurrency(average, currency)}
        </span>
      </div>

      <div className="mt-3 flex h-16 items-end gap-1.5">
        {buckets.map((b) => (
          <div key={b.key} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-sm ${b.total > 0 ? 'bg-accent' : 'bg-paper-line'}`}
              style={{
                height: max > 0 ? `${Math.max(3, (b.total / max) * 100)}%` : '3px',
              }}
              title={`${b.label}: ${formatCurrency(b.total, currency)}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {buckets.map((b) => (
          <span key={b.key} className="n flex-1 text-center text-[9.5px] text-ink-faint">
            {b.label}
          </span>
        ))}
      </div>
    </section>
  )
}
