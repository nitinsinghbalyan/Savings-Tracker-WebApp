import { Plus } from 'lucide-react'
import { formatMoney } from '../../lib/format'
import HoldingRow from './HoldingRow'

export default function HoldingGroupSection({ group, currency, onAdd, onEdit }) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          {group.label}
        </h2>
        <div className="flex items-baseline gap-3">
          <span className="n text-[12px] font-medium text-ink-muted">
            {formatMoney(group.total, currency)}
          </span>
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(group.key)}
              aria-label={`Add to ${group.label}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-faint transition hover:bg-paper-card hover:text-ink"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-ink-rule">
        {group.items.length === 0 ? (
          <p className="border-b border-ink-hairline py-[15px] text-[12.5px] text-ink-faint">
            Nothing here yet.
          </p>
        ) : (
          group.items.map((item) => (
            <HoldingRow
              key={`${item.source}-${item.id}`}
              item={item}
              currency={currency}
              onClick={item.source === 'holding' ? () => onEdit(item.holding) : undefined}
            />
          ))
        )}
      </div>
    </section>
  )
}
