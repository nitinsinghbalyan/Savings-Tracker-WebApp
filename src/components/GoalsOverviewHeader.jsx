import { formatCurrency, formatMoney } from '../lib/format'

// Artboard 1c header: one progress read across every goal in a currency.
export default function GoalsOverviewHeader({ overview, currency = 'INR' }) {
  if (!overview?.hasGoals) return null

  const { saved, target, percent, funded, notStarted } = overview

  return (
    <section className="rounded-xl border border-ink-rule bg-paper-card p-4">
      <div className="flex items-baseline gap-2.5">
        <span className="n text-[26px] font-medium leading-none tracking-[-.02em] text-ink">
          {Math.round(percent)}%
        </span>
        <span className="n text-sm font-medium text-ink">{formatMoney(saved, currency)}</span>
        <span className="text-[11.5px] text-ink-faint">
          of {formatCurrency(target, currency)}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-line">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] text-ink-faint">
        {funded} funded · {notStarted} not started
      </p>
    </section>
  )
}
