import { memo, useMemo } from 'react'
import { percentComplete, savedAmount } from '../lib/contributions'
import { getColorPalette } from '../lib/constants'
import { formatCurrency } from '../lib/format'
import { formatDaysRemaining, getDaysRemaining } from '../lib/goalDisplay'

function GoalsProgressBars({ goals, onGoalClick }) {
  const visibleGoals = useMemo(
    () => [...goals].sort((a, b) => percentComplete(a) - percentComplete(b)),
    [goals],
  )

  if (visibleGoals.length === 0) {
    return (
      <section className="card">
        <h3 className="text-sm font-medium text-slate-700">Goals</h3>
        <p className="mt-2 text-sm text-slate-500">No goals yet.</p>
      </section>
    )
  }

  return (
    <section className="card space-y-4">
      <h3 className="text-sm font-medium text-slate-700">Goals</h3>
      <ul className="space-y-4">
        {visibleGoals.map((goal) => {
          const progress = percentComplete(goal)
          const saved = savedAmount(goal)
          const target = Number(goal.target_amount) || 0
          const currency = goal.currency ?? 'INR'
          const palette = getColorPalette(goal.color)
          const rounded = Math.round(progress)
          const daysLeft = goal.end_date ? getDaysRemaining(goal.end_date) : null
          const daysLabel =
            daysLeft !== null ? formatDaysRemaining(daysLeft) : null
          const clickable = Boolean(onGoalClick)

          const row = (
            <>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-900">{goal.name}</span>
                <div className="flex shrink-0 items-baseline gap-2">
                  {daysLabel && (
                    <span
                      className={`text-xs font-medium ${
                        daysLeft < 0
                          ? 'text-rose-600'
                          : daysLeft <= 7
                            ? 'text-amber-700'
                            : 'text-slate-500'
                      }`}
                    >
                      {daysLabel}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-slate-700">{rounded}%</span>
                </div>
              </div>

              <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={rounded}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${goal.name} progress`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${palette.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {formatCurrency(saved, currency)}{' '}
                <span className="text-slate-400">of {formatCurrency(target, currency)}</span>
              </p>
            </>
          )

          return (
            <li key={goal.id} className="min-w-0">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onGoalClick(goal)}
                  className="w-full rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 active:bg-slate-100"
                  aria-label={`${goal.name}, ${rounded}% complete${daysLabel ? `, ${daysLabel}` : ''}`}
                >
                  {row}
                </button>
              ) : (
                row
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default memo(GoalsProgressBars)
