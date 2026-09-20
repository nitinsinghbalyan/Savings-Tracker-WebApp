// Month-over-month change pill from artboard 1a. Spending more is bad (warm),
// earning or saving more is good (green) — so the caller says which direction
// counts as positive rather than the badge assuming higher is better.
export default function DeltaBadge({ delta, higherIsBetter = true }) {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) return null
  if (delta === 0) return null

  const up = delta > 0
  const good = up === higherIsBetter
  const magnitude = Math.abs(delta)

  return (
    <span
      className={`n mt-1 inline-block rounded px-[5px] py-px text-[10px] ${
        good ? 'bg-positive-tint text-positive' : 'bg-negative-tint text-negative'
      }`}
    >
      {up ? '▲' : '▼'} {magnitude >= 100 ? Math.round(magnitude) : magnitude.toFixed(0)}%
    </span>
  )
}
