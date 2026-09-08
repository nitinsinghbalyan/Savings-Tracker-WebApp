import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { formatCurrencyCompact } from '../../lib/format'

// Hand-rolled SVG: the repo carries no chart library and should not gain one
// for a single sparkline (CategoryBreakdownChart is hand-built the same way).
const WIDTH = 320
const HEIGHT = 88
const PAD = 4

export default function NetWorthTrend({ snapshots = [], currency = 'INR' }) {
  const points = useMemo(() => {
    const rows = snapshots.filter((s) => (s.currency ?? 'INR') === currency)
    if (rows.length < 2) return null

    const values = rows.map((r) => Number(r.net_worth) || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const stepX = (WIDTH - PAD * 2) / (rows.length - 1)

    return {
      rows,
      min,
      max,
      coords: values.map((value, i) => ({
        x: PAD + i * stepX,
        y: PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2),
        value,
      })),
    }
  }, [snapshots, currency])

  if (!points) return null

  const line = points.coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${PAD},${HEIGHT - PAD} ${line} ${(WIDTH - PAD).toFixed(1)},${HEIGHT - PAD}`
  const first = points.rows[0]
  const last = points.rows[points.rows.length - 1]
  const latest = points.coords[points.coords.length - 1]

  const safeLabel = (row) => {
    try {
      return format(parseISO(row.period), 'MMM yy')
    } catch {
      return row.period
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Trend
        </p>
        <p className="text-[10.5px] text-ink-faint">{points.rows.length} months</p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-3 h-[88px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Net worth trend over ${points.rows.length} months`}
      >
        <polygon points={area} fill="rgba(59,76,192,.09)" />
        <polyline
          points={line}
          fill="none"
          stroke="#3B4CC0"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={latest.x} cy={latest.y} r="3" fill="#3B4CC0" />
      </svg>

      <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-faint">
        <span>{safeLabel(first)}</span>
        <span className="n">
          {formatCurrencyCompact(points.min, currency)} – {formatCurrencyCompact(points.max, currency)}
        </span>
        <span>{safeLabel(last)}</span>
      </div>
    </section>
  )
}
