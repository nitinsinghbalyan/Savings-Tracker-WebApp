import { useEffect } from 'react'
import { PartyPopper } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

function ConfettiPiece({ index }) {
  const left = `${(index * 17 + 7) % 100}%`
  const delay = `${(index % 10) * 0.08}s`
  const duration = `${2.2 + (index % 5) * 0.3}s`
  const color = COLORS[index % COLORS.length]
  const size = 6 + (index % 4) * 2

  return (
    <span
      className="celebration-confetti pointer-events-none absolute top-0 block rounded-sm opacity-0"
      style={{
        left,
        width: size,
        height: size * 1.4,
        backgroundColor: color,
        animationDelay: delay,
        animationDuration: duration,
      }}
      aria-hidden="true"
    />
  )
}

export default function Celebration({ message, onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 3200)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20 safe-top sm:pt-24"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto relative max-w-sm animate-celebration-pop rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <PartyPopper className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Goal reached!</p>
            <p className="mt-0.5 text-sm text-slate-600">{message}</p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>
    </div>
  )
}
