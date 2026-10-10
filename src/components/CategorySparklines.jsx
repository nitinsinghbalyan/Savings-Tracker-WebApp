import { formatMoney } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import DeltaBadge from './DeltaBadge'
import CategoryIcon from './CategoryIcon'

// Small multiples: one row per category with its own shape over the period.
// Hand-rolled SVG per the house idiom (NetWorthTrend) — no chart library.
//
// Every row is directly labelled. The colour swatch is decoration, not
// identity: the six category colours are not mutually distinguishable on a
// dark surface, so the name always does the work.

const W = 120
const H = 26
const PAD = 2

function Spark({ values, max, color }) {
  if (!values?.length) return null

  // A single point has no line to draw — show a dot so the row isn't empty.
  const usable = values.length > 1
  const stepX = usable ? (W - PAD * 2) / (values.length - 1) : 0
  const y = (v) => PAD + (1 - (max > 0 ? v / max : 0)) * (H - PAD * 2)

  const points = values.map((v, i) => `${(PAD + i * stepX).toFixed(1)},${y(v).toFixed(1)}`)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[26px] w-[120px] shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {usable ? (
        <>
          <polygon
            points={`${PAD},${H - PAD} ${points.join(' ')} ${(W - PAD).toFixed(1)},${H - PAD}`}
            fill={color}
            opacity="0.14"
          />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <circle cx={W / 2} cy={y(values[0])} r="2.5" fill={color} />
      )}
    </svg>
  )
}

export default function CategorySparklines({
  series = [],
  comparison = [],
  currency = 'INR',
  dark = false,
  onSelect,
}) {
  if (!series.length) {
    return <p className="py-6 text-center text-sm text-ink-faint">No spending to chart yet.</p>
  }

  const deltaById = new Map(comparison.map((c) => [c.categoryId, c]))

  return (
    <div className="border-t border-ink-rule">
      {series.map((row) => {
        const palette = getColorPalette(row.color)
        const color = dark ? (palette.fillDark ?? palette.fill) : palette.fill
        const cmp = deltaById.get(row.categoryId)

        return (
          <button
            key={row.categoryId}
            type="button"
            onClick={() => onSelect?.({ categoryId: row.categoryId, name: row.name, icon: row.icon })}
            className="flex w-full items-center gap-3 border-b border-ink-hairline px-0.5 py-2.5 text-left transition hover:bg-paper-sunk"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-sm"
              style={{ background: color }}
              aria-hidden="true"
            />
            <CategoryIcon category={row} className="h-4 w-4 text-ink-soft" />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-ink">{row.name}</span>
              <span className="n mt-0.5 block text-[11px] text-ink-faint">
                {formatMoney(row.total, currency)} · {row.share.toFixed(0)}%
                {cmp?.isNew && ' · new'}
              </span>
            </span>

            <Spark values={row.values} max={row.max} color={color} />

            <span className="w-12 shrink-0 text-right">
              {cmp && <DeltaBadge delta={cmp.delta} higherIsBetter={false} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
