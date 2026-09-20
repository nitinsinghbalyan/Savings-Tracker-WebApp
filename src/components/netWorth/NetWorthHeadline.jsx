import { format, parseISO } from 'date-fns'
import { formatMoney, getAmountScaleLabel } from '../../lib/format'

// Mirrors the Summary balance card so the two screens read as one system.
export default function NetWorthHeadline({ summary, delta }) {
  if (!summary) return null

  const { netWorth, assets, liabilities, currency } = summary
  const scale = getAmountScaleLabel(Math.abs(netWorth), currency)

  return (
    <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card p-4">
      <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
        Net worth
      </p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2.5">
        <p
          className={`n text-[29px] font-medium leading-none tracking-[-.02em] ${
            netWorth >= 0 ? 'text-ink' : 'text-negative'
          }`}
        >
          {formatMoney(netWorth, currency)}
        </p>
        {delta && Number.isFinite(delta.percent) && (
          <span
            className={`n shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10.5px] ${
              delta.percent >= 0
                ? 'bg-positive-tint text-positive'
                : 'bg-negative-tint text-negative'
            }`}
          >
            {delta.percent >= 0 ? '▲' : '▼'} {Math.abs(delta.percent).toFixed(1)}%
            {(() => {
              try {
                return ` vs ${format(parseISO(delta.previousPeriod), 'MMM')}`
              } catch {
                return ''
              }
            })()}
          </span>
        )}
      </div>
      {scale && <p className="mt-1 text-[11px] text-ink-faint">{scale}</p>}

      <div className="mt-3 flex justify-between border-t border-ink-hairline pt-[11px]">
        <div>
          <p className="text-[10.5px] text-ink-faint">Assets</p>
          <p className="n mt-0.5 text-sm font-medium text-positive">
            {formatMoney(assets.total, currency)}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] text-ink-faint">Liabilities</p>
          <p className="n mt-0.5 text-sm font-medium text-negative">
            {formatMoney(liabilities.total, currency)}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] text-ink-faint">Net</p>
          <p className="n mt-0.5 text-sm font-medium text-ink">
            {formatMoney(netWorth, currency)}
          </p>
        </div>
      </div>
    </section>
  )
}
