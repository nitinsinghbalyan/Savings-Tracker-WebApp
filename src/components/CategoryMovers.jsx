import { formatMoney } from '../lib/format'
import CategoryIcon from './CategoryIcon'

// "Biggest changes": up to three categories whose spending moved most against
// the comparison period. Rows are buttons that open the category's
// transactions. Direction is carried by the sign and the word, not colour alone.
export default function CategoryMovers({ movers = [], currency, compareLabel, onSelect }) {
  if (!movers.length) return null

  return (
    <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card">
      <div className="flex items-baseline justify-between gap-2 px-3.5 pb-2 pt-3">
        <h3 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Biggest changes
        </h3>
        <span className="text-[10.5px] text-ink-faint">vs {compareLabel}</span>
      </div>
      {movers.map((item) => {
        const up = item.change > 0
        const detail = item.isNew
          ? 'new this period'
          : item.isGone
            ? 'none this period'
            : `was ${formatMoney(item.prevTotal, currency)}`
        return (
          <button
            key={item.categoryId}
            type="button"
            onClick={() => onSelect?.(item)}
            className="flex min-h-11 w-full items-center gap-3 border-t border-ink-hairline px-3.5 py-2.5 text-left transition hover:bg-paper-sunk"
          >
            <CategoryIcon category={item} className="h-4 w-4 text-ink-soft" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-ink">{item.name}</span>
              <span className="block truncate text-[11px] text-ink-faint">{detail}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="n block text-[13px] font-medium text-ink">
                {formatMoney(item.total, currency)}
              </span>
              <span className={`n block text-[11px] ${up ? 'text-negative' : 'text-positive'}`}>
                {up ? '+' : '−'}
                {formatMoney(Math.abs(item.change), currency)} {up ? 'more' : 'less'}
              </span>
            </span>
          </button>
        )
      })}
    </section>
  )
}
