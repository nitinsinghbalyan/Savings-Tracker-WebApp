import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'

export default function MonthPicker({ year, month, onChange }) {
  const date = new Date(year, month - 1, 1)
  const label = format(date, 'MMMM yyyy')

  const goPrev = () => {
    const prev = subMonths(date, 1)
    onChange(prev.getFullYear(), prev.getMonth() + 1)
  }

  const goNext = () => {
    const next = addMonths(date, 1)
    onChange(next.getFullYear(), next.getMonth() + 1)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous month"
        className="btn-icon rounded-xl"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="min-w-[9rem] text-center text-sm font-semibold text-slate-900">{label}</span>
      <button
        type="button"
        onClick={goNext}
        aria-label="Next month"
        className="btn-icon rounded-xl"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
