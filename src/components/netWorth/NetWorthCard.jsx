import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatMoney } from '../../lib/format'

// Compact Summary entry point. Renders nothing until net worth is loaded so it
// can never delay the default tab's first paint.
export default function NetWorthCard({ summary }) {
  if (!summary) return null

  return (
    <Link
      to="/worth"
      className="flex items-center gap-3 rounded-xl border border-ink-rule bg-paper-card px-4 py-3.5 transition hover:border-accent/40"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Net worth
        </p>
        <p
          className={`n mt-1 text-[19px] font-medium leading-none tracking-[-.02em] ${
            summary.netWorth >= 0 ? 'text-ink' : 'text-negative'
          }`}
        >
          {formatMoney(summary.netWorth, summary.currency)}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
    </Link>
  )
}
