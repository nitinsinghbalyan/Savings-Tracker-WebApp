import { memo } from 'react'
import { getColorPalette } from '../lib/constants'
import { formatMoney } from '../lib/format'

// Splits the combined Savings figure into where the money actually went:
// savings categories, and goal contributions. The two subtotals add up to the
// `Savings` cell above, so the headline can be verified by reading down.
//
// Purely presentational on purpose. The no-double-count rule (a savings-category
// expense that is also goal-linked counts once, via goals — F-133) lives in
// `monthlySummary.js` / `countsAsCategorySavings`, so these totals must come
// from the summary and never be re-derived from transactions here.

function Row({ name, total, currency, fill }) {
  return (
    <div className="flex items-center gap-[11px] border-b border-ink-hairline px-3.5 py-3 last:border-b-0">
      <span
        className="h-[18px] w-[3px] shrink-0 rounded-sm"
        style={{ background: fill }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{name}</span>
      <span className="n shrink-0 text-[11.5px] text-ink-faint">
        {formatMoney(total, currency)}
      </span>
    </div>
  )
}

function SectionHeading({ label, total, currency }) {
  return (
    <div className="flex items-baseline justify-between gap-2 px-3.5 pb-2 pt-3">
      <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">{label}</p>
      <span className="n text-[10.5px] text-ink-faint">{formatMoney(total, currency)}</span>
    </div>
  )
}

function SavingsBreakdownList({
  categoryItems = [],
  goalItems = [],
  categoryTotal = 0,
  goalTotal = 0,
  currency,
  goalColors,
}) {
  const hasCategories = categoryItems.length > 0
  const hasGoals = goalItems.length > 0
  if (!hasCategories && !hasGoals) return null

  return (
    <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card">
      {hasCategories && (
        <>
          <SectionHeading label="By category" total={categoryTotal} currency={currency} />
          {categoryItems.map((item) => (
            <Row
              key={item.categoryId}
              name={item.name}
              total={item.total}
              currency={currency}
              fill={getColorPalette(item.color).fill}
            />
          ))}
        </>
      )}

      {hasGoals && (
        <>
          <SectionHeading label="To goals" total={goalTotal} currency={currency} />
          {goalItems.map((item) => (
            <Row
              key={item.goalId}
              name={item.name}
              total={item.total}
              currency={currency}
              fill={getColorPalette(goalColors?.[item.goalId]).fill}
            />
          ))}
        </>
      )}
    </section>
  )
}

export default memo(SavingsBreakdownList)
