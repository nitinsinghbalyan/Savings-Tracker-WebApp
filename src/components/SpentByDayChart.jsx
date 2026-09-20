import { formatMoney } from '../lib/format'

// Artboard 1e: the month's expense shape above the ledger. Purely a read of
// the month already in the cache.
export default function SpentByDayChart({ spend, currency = 'INR', todayDay }) {
  if (!spend || spend.total <= 0) return null

  return (
    <section className="rounded-xl border border-ink-rule bg-paper-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
            Spent by day
          </p>
          <p className="n mt-1 text-[22px] font-medium leading-none tracking-[-.02em] text-ink">
            {formatMoney(spend.total, currency)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex h-12 items-end gap-[2px]" aria-hidden="true">
        {spend.bars.map((bar) => (
          <div
            key={bar.day}
            className={`min-h-[2px] flex-1 rounded-t-sm ${
              bar.day === todayDay ? 'bg-accent' : 'bg-accent/25'
            }`}
            style={{ height: `${Math.max(4, bar.ratio * 100)}%` }}
            title={`${bar.day}: ${formatMoney(bar.amount, currency)}`}
          />
        ))}
      </div>
    </section>
  )
}
