import { useEffect, useMemo, useRef, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { getColorPalette } from '../lib/constants'
import { formatMoney } from '../lib/format'
import { filterTransactionsForHeatmapCategory } from '../lib/monthlySummary'
import { useChartPreferences } from '../hooks/useChartPreferences'
import CategoryTransactionsModal from './CategoryTransactionsModal'

const OVER_BUDGET_FILL = '#f43f5e'

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
    <div className="pointer-events-none min-w-[9.5rem] max-w-[14rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <div className="flex items-center gap-2 font-medium text-slate-900">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: cell.fill }}
          aria-hidden="true"
        />
        <span className="truncate">{cell.name}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{formatMoney(cell.total, currency)}</p>
      <p className="mt-0.5 text-slate-500">{Math.round(cell.pct * 100)}% of spending</p>
      {cell.budget > 0 && (
        <p className={`mt-1 ${cell.overBudget ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
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
      className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Chart options</p>

      <div className="space-y-3">
        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium text-slate-600">Sort tiles by</legend>
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
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onReset} className="text-xs font-medium text-slate-500 hover:text-slate-700">
          Reset
        </button>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
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
}) {
  const { prefs, updatePrefs, resetPrefs } = useChartPreferences()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const settingsRef = useRef(null)

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
      <p className="py-4 text-center text-sm text-slate-500">No spending breakdown for this period</p>
    )
  }

  const overTotalBudget = budgetTotal > 0 && total > budgetTotal

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`font-medium text-slate-700 ${large ? 'text-base lg:text-lg' : 'text-sm'}`}>
            Spending by category
          </h3>
          {budgetTotal > 0 && (
            <p className={`mt-0.5 text-xs font-medium ${overTotalBudget ? 'text-rose-600' : 'text-slate-500'}`}>
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
            className={`btn-icon ${settingsOpen ? 'bg-slate-100 text-brand-600' : ''}`}
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
        role="img"
        aria-label="Spending by category heatmap"
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="flex flex-wrap gap-1.5">
          {cells.map((cell) => {
            const flexBasis = `${Math.max(24, Math.round(cell.pct * 100))}%`
            const isHovered = hoveredId === cell.categoryId
            const isDimmed = hoveredId != null && !isHovered

            return (
              <button
                key={cell.categoryId}
                type="button"
                className={`relative min-h-[4.75rem] min-w-[5.5rem] flex-1 rounded-xl border p-3 text-left transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
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
                onClick={() => setSelectedCategory({ categoryId: cell.categoryId, name: cell.name })}
                aria-label={`${cell.name}: ${formatMoney(cell.total, currency)}, ${Math.round(cell.pct * 100)}% of spending. View transactions.`}
              >
                <p
                  className={`truncate text-sm font-semibold ${cell.textOnDark ? 'text-white' : 'text-slate-800'}`}
                >
                  {cell.name}
                </p>
                <p
                  className={`mt-1 text-base font-bold tabular-nums ${cell.textOnDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {formatMoney(cell.total, currency)}
                </p>
                <p
                  className={`mt-0.5 text-xs tabular-nums ${cell.textOnDark ? 'text-white/80' : 'text-slate-500'}`}
                >
                  {Math.round(cell.pct * 100)}%
                </p>
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
        transactions={selectedTransactions}
        currency={currency}
      />
    </div>
  )
}
