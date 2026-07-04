import { memo } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { getColorPalette } from '../lib/constants'

function TransactionRow({ transaction, onEdit, onDelete }) {
  const { type, amount, category, account, transfer_to: transferTo, note } = transaction
  const palette = category ? getColorPalette(category.color) : null
  const currency = account?.currency ?? 'INR'

  const title = category?.name ?? 'Transfer'
  const accountLabel =
    type === 'transfer' && transferTo
      ? `${account?.name} → ${transferTo.name}`
      : (account?.name ?? '')
  const mobileSubtitle = type === 'transfer' ? accountLabel : (note || accountLabel)

  const amountClass =
    type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-600' : 'text-slate-900'
  const prefix = type === 'income' ? '+' : type === 'expense' ? '−' : ''

  return (
    <div className="flex items-center gap-3 py-3 lg:grid lg:grid-cols-[auto_1fr_minmax(6rem,auto)_auto] lg:items-center lg:gap-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          type === 'transfer' ? 'bg-slate-100 text-slate-600' : palette ? palette.chip : 'bg-slate-100'
        }`}
      >
        {type === 'transfer' ? (
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        ) : (
          <span className={`h-3 w-3 rounded-full ${palette?.swatch ?? 'bg-slate-300'}`} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500 lg:hidden">{mobileSubtitle}</p>
        <p className="hidden truncate text-sm text-slate-500 lg:block">{accountLabel}</p>
        {note && type !== 'transfer' && (
          <p className="mt-0.5 hidden truncate text-xs text-slate-400 lg:block">{note}</p>
        )}
      </div>

      <span className="hidden shrink-0 truncate text-sm text-slate-500 lg:block">
        {account?.name ?? '—'}
      </span>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:justify-end">
        <span className={`whitespace-nowrap text-sm font-semibold tabular-nums ${amountClass}`}>
          {prefix}
          {formatMoney(amount, currency)}
        </span>
        <div className="flex items-center gap-1">
          {type !== 'transfer' && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(TransactionRow)
