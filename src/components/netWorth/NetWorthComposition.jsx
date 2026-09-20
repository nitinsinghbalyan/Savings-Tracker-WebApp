import { format, parseISO } from 'date-fns'
import { formatMoney } from '../../lib/format'

// Artboard 1h: proportional Assets / Personal / Owed band, the spendable-today
// line, and a compact spark of recent snapshots.
const BANDS = [
  { key: 'assets', label: 'Assets', swatch: '#3B4CC0' },
  { key: 'personal', label: 'Personal', swatch: '#8F9BD8' },
  { key: 'liabilities', label: 'Owed', swatch: '#B3452B' },
]

function Spark({ snapshots, currency }) {
  const rows = snapshots
    .filter((s) => (s.currency ?? 'INR') === currency)
    .slice(-6)
  if (rows.length < 2) return null

  const values = rows.map((r) => Number(r.net_worth) || 0)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1

  const label = (() => {
    try {
      return `${format(parseISO(rows[0].period), 'MMM')} – ${format(
        parseISO(rows[rows.length - 1].period),
        'MMM',
      )}`
    } catch {
      return null
    }
  })()

  return (
    <div className="w-24 shrink-0">
      <div className="flex h-7 items-end gap-[3px]" aria-hidden="true">
        {values.map((v, i) => (
          <div
            key={rows[i].period}
            className={`min-h-[3px] flex-1 rounded-t-sm ${
              i === values.length - 1 ? 'bg-accent' : 'bg-accent/30'
            }`}
            style={{ height: `${20 + ((v - min) / span) * 80}%` }}
          />
        ))}
      </div>
      {label && (
        <p className="n mt-[3px] text-right text-[9px] text-ink-faint">{label}</p>
      )}
    </div>
  )
}

export default function NetWorthComposition({ composition, snapshots = [], currency }) {
  if (!composition?.hasSpan) return null

  const { liquid, assetsPct, personalPct, liabilitiesPct } = composition

  return (
    <section className="rounded-xl border border-ink-rule bg-paper-card px-3.5 py-3">
      <div className="flex items-end gap-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex h-3 gap-[2px] overflow-hidden rounded" aria-hidden="true">
            {assetsPct > 0 && <div style={{ flex: assetsPct, background: '#3B4CC0' }} />}
            {personalPct > 0 && <div style={{ flex: personalPct, background: '#8F9BD8' }} />}
            {liabilitiesPct > 0 && (
              <div style={{ flex: liabilitiesPct, background: '#B3452B' }} />
            )}
          </div>
          <p className="text-[10.5px] leading-[1.4] text-ink-soft">
            Only <span className="n text-ink">{formatMoney(liquid, currency)}</span> is
            spendable today
          </p>
        </div>

        <Spark snapshots={snapshots} currency={currency} />
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {BANDS.map(({ key, label, swatch }) => (
          <div key={key}>
            <div className="flex items-center gap-1.5 text-[10.5px] text-ink-soft">
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-sm"
                style={{ background: swatch }}
                aria-hidden="true"
              />
              {label}
            </div>
            <p className="n mt-[3px] text-[13px] font-medium text-ink">
              {key === 'liabilities' && composition[key] > 0 ? '−' : ''}
              {formatMoney(composition[key], currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
