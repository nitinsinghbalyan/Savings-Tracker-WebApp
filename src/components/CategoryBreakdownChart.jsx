import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { getColorPalette } from '../lib/constants'
import { formatMoney } from '../lib/format'
import { CHART_SIZE_MAX, CHART_SIZE_MIN } from '../lib/chartPreferences'
import { useChartPreferences } from '../hooks/useChartPreferences'

const CX = 100
const CY = 100
const OUTER_R = 88
const INNER_R = 52
const OVER_BUDGET_FILL = '#f43f5e'

const chipBase =
  'min-h-9 flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ring-1 transition disabled:opacity-50'

function polarToCartesian(cx, cy, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  }
}

function describePieSlice(cx, cy, radius, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.999) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`
  }

  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

function describeDonutSlice(cx, cy, innerR, outerR, startAngle, endAngle) {
  if (endAngle - startAngle >= 359.999) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - 0.001} ${cy - outerR}`,
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx + 0.001} ${cy - innerR}`,
    ].join(' ')
  }

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

function sortItems(items, sortBy) {
  const copy = [...items]
  if (sortBy === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    copy.sort((a, b) => b.total - a.total)
  }
  return copy
}

function buildSlices(items, total) {
  let cursor = 0
  return items.map((item) => {
    const pct = total > 0 ? item.total / total : 0
    const sweep = pct * 360
    const startAngle = cursor
    const endAngle = cursor + sweep
    cursor = endAngle

    const hasBudget = item.budget > 0
    const overBudget = hasBudget && item.total > item.budget
    const palette = getColorPalette(item.color)
    const midAngle = startAngle + sweep / 2

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle,
      pct,
      fill: overBudget ? OVER_BUDGET_FILL : palette.fill,
    }
  })
}

function getTooltipPosition(slice, chartStyle) {
  const radius = chartStyle === 'donut' ? (INNER_R + OUTER_R) / 2 : OUTER_R * 0.62
  const point = polarToCartesian(CX, CY, radius, slice.midAngle)

  return {
    left: `${(point.x / 200) * 100}%`,
    top: `${(point.y / 200) * 100}%`,
    transform: 'translate(-50%, calc(-100% - 10px))',
  }
}

function SliceTooltip({ slice, currency }) {
  const hasBudget = slice.budget > 0
  const overBudget = hasBudget && slice.total > slice.budget

  return (
    <div className="pointer-events-none min-w-[9.5rem] max-w-[14rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <div className="flex items-center gap-2 font-medium text-slate-900">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: slice.fill }}
          aria-hidden="true"
        />
        <span className="truncate">{slice.name}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{formatMoney(slice.total, currency)}</p>
      <p className="mt-0.5 text-slate-500">{Math.round(slice.pct * 100)}% of spending</p>
      {hasBudget && (
        <p className={`mt-1 ${overBudget ? 'font-medium text-rose-600' : 'text-slate-500'}`}>
          Budget {formatMoney(slice.budget, currency)}
          {overBudget && (
            <span className="block text-[11px]">
              Over by {formatMoney(slice.total - slice.budget, currency)}
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
          <legend className="mb-1.5 block text-xs font-medium text-slate-600">Style</legend>
          <div className="flex gap-1.5" role="group" aria-label="Chart style">
            {[
              { value: 'pie', label: 'Pie' },
              { value: 'donut', label: 'Donut' },
            ].map(({ value, label }) => {
              const selected = prefs.style === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ style: value })}
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

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium text-slate-600">Sort legend by</legend>
          <div className="flex gap-1.5" role="group" aria-label="Legend sort order">
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

        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-0.5">
          <span className="text-xs font-medium text-slate-600">Show category list</span>
          <input
            type="checkbox"
            checked={prefs.showLegend}
            onChange={(e) => onChange({ showLegend: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">Chart size</span>
            <span className="text-xs tabular-nums text-slate-400">{prefs.size}px</span>
          </div>
          <input
            type="range"
            min={CHART_SIZE_MIN}
            max={CHART_SIZE_MAX}
            step={8}
            value={prefs.size}
            onChange={(e) => onChange({ size: Number(e.target.value) })}
            className="h-2 w-full cursor-pointer accent-brand-600"
            aria-label="Chart size"
          />
        </div>
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
}) {
  const { prefs, updatePrefs, resetPrefs } = useChartPreferences()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hoveredSliceId, setHoveredSliceId] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const settingsRef = useRef(null)
  const resizeRef = useRef({ startX: 0, startY: 0, startSize: prefs.size })

  const handleResizeStart = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      resizeRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startSize: prefs.size,
      }
      setIsResizing(true)
    },
    [prefs.size],
  )

  useEffect(() => {
    if (!isResizing) return undefined

    function handlePointerMove(event) {
      const { startX, startY, startSize } = resizeRef.current
      const delta = Math.max(event.clientX - startX, event.clientY - startY)
      const next = Math.min(CHART_SIZE_MAX, Math.max(CHART_SIZE_MIN, startSize + delta))
      updatePrefs({ size: next })
    }

    function handlePointerUp() {
      setIsResizing(false)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizing, updatePrefs])

  const sortedItems = useMemo(
    () => sortItems(items, prefs.sortBy),
    [items, prefs.sortBy],
  )

  const slices = useMemo(() => buildSlices(sortedItems, total), [sortedItems, total])

  const hoveredSlice = useMemo(
    () => slices.find((slice) => slice.categoryId === hoveredSliceId) ?? null,
    [slices, hoveredSliceId],
  )

  const tooltipStyle = hoveredSlice ? getTooltipPosition(hoveredSlice, prefs.style) : null

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
      <p className="py-4 text-center text-sm text-slate-500">No spending breakdown this month</p>
    )
  }

  const overTotalBudget = budgetTotal > 0 && total > budgetTotal
  const chartLabel =
    prefs.style === 'donut' ? 'Spending by category donut chart' : 'Spending by category pie chart'

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
              onReset={() => {
                resetPrefs()
              }}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>

      <div
        className="relative flex justify-center"
        role="img"
        aria-label={chartLabel}
        onMouseLeave={() => setHoveredSliceId(null)}
      >
        <div
          className={`relative mx-auto shrink-0 ${isResizing ? 'select-none' : ''}`}
          style={{
            width: `min(${prefs.size}px, 100%)`,
            aspectRatio: '1 / 1',
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
            {slices.map((slice) => {
              const hasBudget = slice.budget > 0
              const label = hasBudget
                ? `${slice.name}: ${formatMoney(slice.total, currency)} of ${formatMoney(slice.budget, currency)}`
                : `${slice.name}: ${formatMoney(slice.total, currency)} (${Math.round(slice.pct * 100)}%)`
              const isHovered = hoveredSliceId === slice.categoryId
              const isDimmed = hoveredSliceId != null && !isHovered

              const path =
                prefs.style === 'donut'
                  ? describeDonutSlice(CX, CY, INNER_R, OUTER_R, slice.startAngle, slice.endAngle)
                  : describePieSlice(CX, CY, OUTER_R, slice.startAngle, slice.endAngle)

              return (
                <path
                  key={slice.categoryId}
                  d={path}
                  fill={slice.fill}
                  fillRule={
                    prefs.style === 'donut' && slice.endAngle - slice.startAngle >= 359.999
                      ? 'evenodd'
                      : undefined
                  }
                  stroke="#fff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-opacity duration-150"
                  style={{ opacity: isDimmed ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredSliceId(slice.categoryId)}
                  onFocus={() => setHoveredSliceId(slice.categoryId)}
                  onBlur={() => setHoveredSliceId(null)}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={label}
                >
                  <title>{label}</title>
                </path>
              )
            })}

            {prefs.style === 'donut' && (
              <>
                <text
                  x={CX}
                  y={CY - 6}
                  textAnchor="middle"
                  className="fill-slate-400 pointer-events-none"
                  fontSize="9"
                  fontWeight="500"
                >
                  Total
                </text>
                <text
                  x={CX}
                  y={CY + 10}
                  textAnchor="middle"
                  className="fill-slate-800 pointer-events-none"
                  fontSize="11"
                  fontWeight="600"
                >
                  {formatMoney(total, currency)}
                </text>
              </>
            )}
          </svg>

          {hoveredSlice && tooltipStyle && (
            <div className="absolute z-10" style={tooltipStyle}>
              <SliceTooltip slice={hoveredSlice} currency={currency} />
            </div>
          )}

          <button
            type="button"
            aria-label="Resize chart"
            onPointerDown={handleResizeStart}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-se-resize items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-600 active:bg-slate-50 touch-none"
          >
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M11 11L11 7M11 11L7 11M11 11L6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {prefs.showLegend && (
        <ul className="space-y-2 border-t border-slate-100 pt-3">
          {slices.map((item) => {
            const hasBudget = item.budget > 0
            const overBudget = hasBudget && item.total > item.budget

            return (
              <li key={item.categoryId} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-right">
                  <span className="font-medium text-slate-900">{formatMoney(item.total, currency)}</span>
                  {hasBudget ? (
                    <span className="text-xs text-slate-400">/ {formatMoney(item.budget, currency)}</span>
                  ) : (
                    <span className="text-xs text-slate-400">{Math.round(item.pct * 100)}%</span>
                  )}
                  {overBudget && (
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                      over {formatMoney(item.total - item.budget, currency)}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
