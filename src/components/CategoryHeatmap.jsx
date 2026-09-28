import { useState } from 'react'
import { formatMoney } from '../lib/format'
import { HEATMAP_RAMP_DARK, HEATMAP_RAMP_LIGHT } from '../lib/constants'

// A real heatmap: rows = categories, columns = days, cell darkness = spend.
//
// Colour here is SEQUENTIAL — one hue, light to dark — because it encodes
// magnitude only. Identity comes from the row label, never from the colour.
// That is deliberate: the six category colours cannot all be told apart on a
// dark surface (see COLOR_PALETTES), so nothing load-bearing may ride on them.

function rampColor(ratio, dark) {
  const ramp = dark ? HEATMAP_RAMP_DARK : HEATMAP_RAMP_LIGHT
  if (ratio <= 0) return 'transparent'
  // Bucket into the ramp's steps rather than interpolating, so the legend's
  // discrete swatches actually match what a cell can be.
  const idx = Math.min(ramp.length - 1, Math.max(1, Math.ceil(ratio * (ramp.length - 1))))
  return ramp[idx]
}

function Legend({ dark }) {
  const ramp = dark ? HEATMAP_RAMP_DARK : HEATMAP_RAMP_LIGHT
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-ink-faint">less</span>
      <div className="flex gap-[2px]" aria-hidden="true">
        {ramp.slice(1).map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
        ))}
      </div>
      <span className="text-[10px] text-ink-faint">more</span>
    </div>
  )
}

export default function CategoryHeatmap({ matrix, currency = 'INR', dark = false, onSelect }) {
  const [hover, setHover] = useState(null)

  if (!matrix?.rows?.length) {
    return <p className="py-6 text-center text-sm text-ink-faint">No spending to chart yet.</p>
  }

  const { rows, daysInMonth } = matrix

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          By day
        </p>
        <Legend dark={dark} />
      </div>

      {/* Horizontal scroll rather than squeezing 31 columns into 375px. */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="min-w-[19rem]">
          {rows.map((row) => (
            <div key={row.categoryId} className="mb-1.5 last:mb-0">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                {/* The label carries identity — never colour alone. */}
                <span className="truncate text-[11.5px] text-ink" title={row.name}>
                  {row.name}
                  {row.parentName && (
                    <span className="text-ink-faint"> · {row.parentName}</span>
                  )}
                </span>
                <span className="n shrink-0 text-[11px] text-ink-faint">
                  {formatMoney(row.total, currency)} · {row.share.toFixed(0)}%
                </span>
              </div>

              <div className="flex gap-[2px]">
                {row.cells.map((cell) => {
                  const active =
                    hover && hover.categoryId === row.categoryId && hover.day === cell.day
                  return (
                    <button
                      key={cell.day}
                      type="button"
                      onMouseEnter={() =>
                        setHover({ categoryId: row.categoryId, day: cell.day, cell, row })
                      }
                      onMouseLeave={() => setHover(null)}
                      onFocus={() =>
                        setHover({ categoryId: row.categoryId, day: cell.day, cell, row })
                      }
                      onBlur={() => setHover(null)}
                      onClick={() => onSelect?.({ categoryId: row.categoryId, name: row.name })}
                      title={`${row.name} · day ${cell.day}: ${formatMoney(cell.amount, currency)}`}
                      aria-label={`${row.name}, day ${cell.day}, ${formatMoney(cell.amount, currency)}`}
                      className={`h-5 min-w-0 flex-1 rounded-[2px] border transition ${
                        active ? 'border-accent' : 'border-ink-hairline'
                      }`}
                      style={{ background: rampColor(cell.ratio, dark) }}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-1.5 flex justify-between text-[9.5px] text-ink-faint">
            <span className="n">1</span>
            <span className="n">{Math.round(daysInMonth / 2)}</span>
            <span className="n">{daysInMonth}</span>
          </div>
        </div>
      </div>

      {/* Anchored under the grid rather than floating over it — the parent card
          is overflow-hidden and would clip an escaping tooltip. */}
      <div className="mt-2 min-h-[1.25rem]" aria-live="polite">
        {hover && (
          <p className="text-[11.5px] text-ink-muted">
            <span className="text-ink">{hover.row.name}</span> · day {hover.day} ·{' '}
            <span className="n text-ink">{formatMoney(hover.cell.amount, currency)}</span>
          </p>
        )}
      </div>
    </div>
  )
}
