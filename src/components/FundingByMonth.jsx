import { formatCurrency } from '../lib/format'
import { getCurrencySymbol } from '../lib/constants'

// Bar labels must fit ~50px. Intl's en-IN compact renders thousands as "T"
// ("₹60T"), which reads as trillions — so use k / L / Cr (INR) or k / M (USD).
function shortAmount(value, currency) {
  const symbol = getCurrencySymbol(currency)
  const n = Math.abs(Number(value) || 0)
  const trim = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10)
  if (currency === 'INR') {
    if (n >= 1e7) return `${symbol}${trim(n / 1e7)}Cr`
    if (n >= 1e5) return `${symbol}${trim(n / 1e5)}L`
  } else if (n >= 1e6) {
    return `${symbol}${trim(n / 1e6)}M`
  }
  if (n >= 1e3) return `${symbol}${trim(n / 1e3)}k`
  return `${symbol}${Math.round(n)}`
}

// Artboard 1d "Funding by month": six months of contributions to one goal,
// read from the contributions already loaded with it.
//
// The header shows the forecast's pace (last 3 months ÷ 3) when one is passed,
// so the chart and the "Forecast" cell above it quote the same number. The old
// "avg" averaged funded months only and could contradict the forecast.
export default function FundingByMonth({ funding, currency = 'INR', pace = null }) {
  if (!funding?.hasAny) return null

  const { buckets, average, max } = funding
  const headline = pace != null && pace > 0 ? pace : average
  const headlineLabel = pace != null && pace > 0 ? 'pace' : 'avg'

  return (
    <section className="rounded-xl border border-ink-rule bg-paper-card p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Funding by month
        </h4>
        <span className="n text-[11px] text-ink-faint">
          {headlineLabel} {formatCurrency(headline, currency)}/mo
        </span>
      </div>

      {/* Values sit on the bars (not only in a hover title) so they read on touch. */}
      <div className="mt-3 flex h-20 items-end gap-1.5">
        {buckets.map((b) => (
          <div key={b.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            {b.total > 0 && (
              <span className="n max-w-full truncate text-[9.5px] text-ink-soft">
                {shortAmount(b.total, currency)}
              </span>
            )}
            <div
              className={`w-full rounded-t-sm ${b.total > 0 ? 'bg-accent' : 'bg-paper-line'}`}
              style={{
                height: max > 0 ? `${Math.max(3, (b.total / max) * 70)}%` : '3px',
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
