import { memo } from 'react'
import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import { resolveTransactionCategory } from '../lib/transactionCategory'

export const TRANSACTION_TABLE_GRID =
  'w-full lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_minmax(8rem,14rem)_minmax(6rem,9rem)_5rem] lg:items-center lg:gap-x-4'

export function TransactionTableHeader() {
  return (
    <div
      className={`mb-1 hidden border-b border-slate-100 pb-2 text-xs font-medium uppercase tracking-wide text-slate-400 ${TRANSACTION_TABLE_GRID}`}
    >
      <span aria-hidden="true" />
      <span>Description</span>
      <span>Account</span>
      <span className="text-right">Amount</span>
      <span aria-hidden="true" />
    </div>
  )
}

function TransactionRow({ transaction, onEdit, onDelete }) {
  const { type, amount, account, transfer_to: transferTo, note } = transaction
  const category = resolveTransactionCategory(transaction)
  const palette = category ? getColorPalette(category.color) : null
  const currency = account?.currency ?? 'INR'

  const title = category?.name ?? 'Transfer'
  const accountLabel =
    type === 'transfer' && transferTo
      ? `${account?.name} → ${transferTo.name}`
      : (account?.name ?? '—')
  const mobileSubtitle = type === 'transfer' ? accountLabel : note || accountLabel

  const amountClass =
    type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-600' : 'text-slate-900'
  const prefix = type === 'income' ? '+' : type === 'expense' ? '−' : ''

  return (
    <div className={`flex items-center gap-3 py-3 ${TRANSACTION_TABLE_GRID}`}>
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

      <div className="min-w-0 flex-1 lg:min-w-0">
        <p className="truncate font-medium text-slate-900">{title}</p>
        <p className="truncate text-xs text-slate-500 lg:hidden">{mobileSubtitle}</p>
        {note && type !== 'transfer' && (
          <p className="mt-0.5 hidden truncate text-xs text-slate-400 lg:block">{note}</p>
        )}
      </div>

      <span className="hidden min-w-0 truncate text-sm text-slate-600 lg:block" title={accountLabel}>
        {accountLabel}
      </span>

      <div className="flex shrink-0 items-center gap-1 lg:contents">
        <span
          className={`whitespace-nowrap text-sm font-semibold tabular-nums lg:text-right ${amountClass}`}
        >
          {prefix}
          {formatMoney(amount, currency)}
        </span>

        <div className="flex shrink-0 items-center justify-end gap-0.5">
          {type !== 'transfer' && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="btn-icon text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Edit ${title}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="btn-icon text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            aria-label={`Delete ${title}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(TransactionRow)
