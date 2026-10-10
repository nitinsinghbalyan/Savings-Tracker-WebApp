import { formatCurrency, formatMoney } from '../lib/format'

// Artboard 1c header: one progress read across every goal in a currency.
// One block per currency — INR and USD are never blended into one percentage
// (decisions.md 2026-06-14). It used to show only `goals[0].currency`, so a
// second currency silently dropped out of the header.
export default function GoalsOverviewHeader({ overviews = [] }) {
  const visible = overviews.filter((o) => o?.hasGoals)
  if (!visible.length) return null

  return (
    <section className="divide-y divide-ink-hairline rounded-xl border border-ink-rule bg-paper-card">
      {visible.map(({ currency, saved, target, percent, funded, notStarted, completed }) => (
        <div key={currency} className="p-4">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="n text-[26px] font-medium leading-none tracking-[-.02em] text-ink">
              {Math.round(percent)}%
            </span>
            <span className="n text-sm font-medium text-ink">{formatMoney(saved, currency)}</span>
            <span className="text-[11.5px] text-ink-faint">
              of {formatCurrency(target, currency)}
            </span>
            {visible.length > 1 && (
              <span className="n ml-auto rounded bg-paper-line px-1.5 py-0.5 text-[10px] text-ink-soft">
                {currency}
              </span>
            )}
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-paper-line"
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`All ${currency} goals progress`}
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] text-ink-faint">
            {funded} funded · {notStarted} not started
            {completed > 0 && ` · ${completed} completed`}
          </p>
        </div>
      ))}
    </section>
  )
}
