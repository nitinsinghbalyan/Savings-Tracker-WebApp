import { formatMoney } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import CategoryIcon from './CategoryIcon'

// Artboard 1a "Today": the day's entries with a category icon, read straight
// from the month already in the context cache. No fetch of its own.
export default function TodayList({ rows, net, currency }) {
  if (!rows?.length) return null

  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-ink">Today</h3>
        <span
          className={`n text-[11px] ${net > 0 ? 'text-positive' : 'text-ink-faint'}`}
        >
          net {net >= 0 ? '+' : '−'}
          {formatMoney(Math.abs(net), currency)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`flex items-center gap-3 px-3.5 py-[13px] ${
              i < rows.length - 1 ? 'border-b border-ink-hairline' : ''
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getColorPalette(row.color).chip}`}
              aria-hidden="true"
            >
              <CategoryIcon category={{ icon: row.icon, name: row.categoryName ?? row.name }} className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{row.name}</span>
            <span
              className={`n shrink-0 text-[13px] font-medium ${
                row.isIncome ? 'text-positive' : 'text-ink'
              }`}
            >
              {row.signed >= 0 ? '+' : '−'}
              {formatMoney(Math.abs(row.signed), currency)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
