import { useEffect, useMemo, useRef, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { getColorPalette, OVER_BUDGET_COLOR } from '../lib/constants'
import { formatMoney } from '../lib/format'
import { filterTransactionsForHeatmapCategory } from '../lib/monthlySummary'
import { useChartPreferences } from '../hooks/useChartPreferences'
import CategoryTransactionsModal from './CategoryTransactionsModal'
import CategoryIcon from './CategoryIcon'
import CategoryHeatmap from './CategoryHeatmap'
import CategorySparklines from './CategorySparklines'
import DeltaBadge from './DeltaBadge'
import {
  buildCategoryDayMatrix,
  buildCategorySeries,
  joinCategoryComparison,
} from '../lib/monthlySummary'

const OVER_BUDGET_FILL = OVER_BUDGET_COLOR

const chipBase =
  'min-h-9 flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ring-1 transition disabled:opacity-50'

function sortItems(items, sortBy) {
  const copy = [...items]
  if (sortBy === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    copy.sort((a, b) => b.total - a.total)
  }
  return copy
}

function hexWithAlpha(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildHeatmapCells(items, total) {
  const maxTotal = Math.max(...items.map((item) => item.total), 1)

  return items.map((item) => {
    const pct = total > 0 ? item.total / total : 0
    const intensity = item.total / maxTotal
    const hasBudget = item.budget > 0
    const overBudget = hasBudget && item.total > item.budget
    const palette = getColorPalette(item.color)
    const fill = overBudget ? OVER_BUDGET_FILL : palette.fill
    const alpha = 0.3 + intensity * 0.7

    return {
      ...item,
      pct,
      intensity,
      fill,
      overBudget,
      bg: hexWithAlpha(fill, alpha),
      border: hexWithAlpha(fill, Math.min(1, alpha + 0.15)),
      textOnDark: intensity >= 0.45 || overBudget,
    }
  })
}

function HeatmapTooltip({ cell, currency }) {
  return (
    <div className="pointer-events-none min-w-[9.5rem] max-w-[14rem] rounded-xl border border-ink-rule bg-paper-card px-3 py-2.5 text-xs shadow-lg">
      <div className="flex items-center gap-2 font-medium text-ink">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: cell.fill }}
          aria-hidden="true"
        />
        <CategoryIcon category={cell} className="h-3.5 w-3.5 text-ink-soft" />
        <span className="truncate">{cell.name}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-ink">{formatMoney(cell.total, currency)}</p>
      <p className="mt-0.5 text-ink-soft">{Math.round(cell.pct * 100)}% of spending</p>
      {cell.budget > 0 && (
        <p className={`mt-1 ${cell.overBudget ? 'font-medium text-negative' : 'text-ink-soft'}`}>
          Budget {formatMoney(cell.budget, currency)}
          {cell.overBudget && (
            <span className="block text-[11px]">
              Over by {formatMoney(cell.total - cell.budget, currency)}
            </span>
          )}
        </p>
      )}
    </div>
  )
}

function ChartSettingsMenu({ prefs, onChange, onReset, onClose }) {
  return (
    <div
      role="dialog"
      aria-label="Chart settings"
      className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-ink-rule bg-paper-card p-3 shadow-lg"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Chart options</p>

      <div className="space-y-3">
        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium text-ink-muted">Sort tiles by</legend>
          <div className="flex gap-1.5" role="group" aria-label="Tile sort order">
            {[
              { value: 'amount', label: 'Amount' },
              { value: 'name', label: 'Name' },
            ].map(({ value, label }) => {
              const selected = prefs.sortBy === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ sortBy: value })}
                  className={`${chipBase} ${
                    selected
                      ? 'bg-accent text-white ring-accent'
                      : 'bg-paper-sunk text-ink-muted ring-ink-rule hover:bg-paper-line'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium text-ink-muted">Chart type</legend>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chart type">
            {[
              { value: 'mosaic', label: 'Tiles' },
              { value: 'heatmap', label: 'Heatmap' },
              { value: 'sparklines', label: 'Trends' },
            ].map(({ value, label }) => {
              const selected = prefs.chartType === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ chartType: value })}
                  className={`${chipBase} ${
                    selected
                      ? 'bg-accent text-white ring-accent'
                      : 'bg-paper-sunk text-ink-muted ring-ink-rule hover:bg-paper-line'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-ink-hairline pt-3">
        <button type="button" onClick={onReset} className="text-xs font-medium text-ink-soft hover:text-ink">
          Reset
        </button>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-accent hover:text-accent-hover">
          Done
        </button>
      </div>
    </div>
  )
}

export default function CategoryBreakdownChart({
  items,
  total,
  currency,
  budgetTotal = 0,
  large = false,
  transactions = [],
  prevItems = [],
  categories = [],
  daysInMonth = 31,
  periodDays = null,
  dark = false,
}) {
  const { prefs, updatePrefs, resetPrefs } = useChartPreferences()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const settingsRef = useRef(null)

  // Derived below the hooks above — a memo placed over its source throws at
  // render and blanks the tab (error-history.md, three recorded instances).
  const comparison = useMemo(
    () => joinCategoryComparison(items, prevItems ?? []),
    [items, prevItems],
  )

  const comparisonById = useMemo(
    () => new Map(comparison.map((c) => [c.categoryId, c])),
    [comparison],
  )

  const matrix = useMemo(
    () =>
      prefs.chartType === 'heatmap'
        ? buildCategoryDayMatrix(transactions, categories, { currency, daysInMonth, periodDays })
        : null,
    [prefs.chartType, transactions, categories, currency, daysInMonth, periodDays],
  )

  const series = useMemo(
    () =>
      prefs.chartType === 'sparklines'
        ? buildCategorySeries(transactions, categories, { currency, daysInMonth, periodDays })
        : null,
    [prefs.chartType, transactions, categories, currency, daysInMonth, periodDays],
  )

  const sortedItems = useMemo(
    () => sortItems(items, prefs.sortBy),
    [items, prefs.sortBy],
  )

  const cells = useMemo(() => buildHeatmapCells(sortedItems, total), [sortedItems, total])

  const hoveredCell = useMemo(
    () => cells.find((cell) => cell.categoryId === hoveredId) ?? null,
    [cells, hoveredId],
  )

  const selectedTransactions = useMemo(() => {
    if (!selectedCategory) return []
    return filterTransactionsForHeatmapCategory(
      transactions,
      selectedCategory.categoryId,
      currency,
    )
  }, [selectedCategory, transactions, currency])

  useEffect(() => {
    if (!settingsOpen) return undefined

    function handlePointerDown(event) {
      if (settingsRef.current?.contains(event.target)) return
      setSettingsOpen(false)
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setSettingsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [settingsOpen])

  if (!items.length || total <= 0) {
    return (
      <p className="py-4 text-center text-sm text-ink-soft">No spending breakdown for this period</p>
    )
  }

  const overTotalBudget = budgetTotal > 0 && total > budgetTotal

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`font-medium text-ink ${large ? 'text-base lg:text-lg' : 'text-sm'}`}>
            Spending by category
          </h3>
          {budgetTotal > 0 && (
            <p className={`mt-0.5 text-xs font-medium ${overTotalBudget ? 'text-negative' : 'text-ink-soft'}`}>
              {formatMoney(total, currency)} / {formatMoney(budgetTotal, currency)}
            </p>
          )}
        </div>

        <div className="relative shrink-0" ref={settingsRef}>
          <button
            type="button"
            aria-label="Chart settings"
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            onClick={() => setSettingsOpen((open) => !open)}
            className={`btn-icon ${settingsOpen ? 'bg-paper-line text-accent' : ''}`}
          >
            <Settings2 className="h-5 w-5" aria-hidden="true" />
          </button>

          {settingsOpen && (
            <ChartSettingsMenu
              prefs={prefs}
              onChange={updatePrefs}
              onReset={resetPrefs}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>

      <div
        className="relative"
        aria-label="Spending by category"
        onMouseLeave={() => setHoveredId(null)}
      >
        {prefs.chartType === 'heatmap' && (
          <CategoryHeatmap
            matrix={matrix}
            currency={currency}
            dark={dark}
            onSelect={setSelectedCategory}
          />
        )}

        {prefs.chartType === 'sparklines' && (
          <CategorySparklines
            series={series ?? []}
            comparison={comparison}
            currency={currency}
            dark={dark}
            onSelect={setSelectedCategory}
          />
        )}

        <div className={`flex-wrap gap-1.5 ${prefs.chartType === 'mosaic' ? 'flex' : 'hidden'}`}>
          {cells.map((cell) => {
            const flexBasis = `${Math.max(24, Math.round(cell.pct * 100))}%`
            const isHovered = hoveredId === cell.categoryId
            const isDimmed = hoveredId != null && !isHovered

            return (
              <button
                key={cell.categoryId}
                type="button"
                className={`relative min-h-[4.75rem] min-w-[5.5rem] flex-1 rounded-xl border p-3 text-left transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                  isHovered ? 'scale-[1.02] shadow-md' : 'shadow-sm'
                }`}
                style={{
                  flexBasis,
                  flexGrow: cell.total,
                  backgroundColor: cell.bg,
                  borderColor: cell.border,
                  opacity: isDimmed ? 0.55 : 1,
                }}
                onMouseEnter={() => setHoveredId(cell.categoryId)}
                onFocus={() => setHoveredId(cell.categoryId)}
                onBlur={() => setHoveredId(null)}
                onClick={() =>
                  setSelectedCategory({ categoryId: cell.categoryId, name: cell.name, icon: cell.icon })
                }
                aria-label={`${cell.name}: ${formatMoney(cell.total, currency)}, ${Math.round(cell.pct * 100)}% of spending. View transactions.`}
              >
                <p
                  className={`truncate text-sm font-semibold ${cell.textOnDark ? 'text-white' : 'text-ink'}`}
                >
                  {cell.name}
                </p>
                <p
                  className={`mt-1 text-base font-bold tabular-nums ${cell.textOnDark ? 'text-white' : 'text-ink'}`}
                >
                  {formatMoney(cell.total, currency)}
                </p>
                {/* Icon rides the short % line so narrow tiles keep the name's width. */}
                <div className={`mt-0.5 flex items-center gap-1.5 ${cell.textOnDark ? 'text-white/80' : 'text-ink-soft'}`}>
                  <CategoryIcon category={cell} className="h-3.5 w-3.5" />
                  <p
                    className={`text-xs tabular-nums ${cell.textOnDark ? 'text-white/80' : 'text-ink-soft'}`}
                  >
                    {Math.round(cell.pct * 100)}%
                  </p>
                  {/* Budget on the face, not hidden behind a hover. */}
                  {cell.budget > 0 && (
                    <p
                      className={`text-xs tabular-nums ${cell.textOnDark ? 'text-white/80' : 'text-ink-soft'}`}
                    >
                      · of {formatMoney(cell.budget, currency)}
                    </p>
                  )}
                </div>
                {(() => {
                  const cmp = comparisonById.get(cell.categoryId)
                  if (!cmp) return null
                  return <DeltaBadge delta={cmp.delta} higherIsBetter={false} />
                })()}
              </button>
            )
          })}
        </div>

        {hoveredCell && (
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)]">
            <HeatmapTooltip cell={hoveredCell} currency={currency} />
          </div>
        )}
      </div>

      <CategoryTransactionsModal
        open={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        categoryName={selectedCategory?.name ?? ''}
        categoryIcon={selectedCategory?.icon ?? null}
        transactions={selectedTransactions}
        currency={currency}
      />
    </div>
  )
}
