import { useEffect, useId, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { formatTransactionDateLabel } from '../lib/transactions'
import ModalShell from './ModalShell'

const PAGE_SIZE = 10

export default function CategoryTransactionsModal({
  open,
  onClose,
  categoryName,
  transactions,
  currency,
}) {
  const titleId = useId()
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (open) setPage(1)
  }, [open, categoryName])

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, page])

  if (!open) return null

  return (
    <ModalShell open={open} onClose={onClose} hideBottomNav>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel flex max-h-[min(85dvh,640px)] w-full max-w-lg flex-col rounded-t-3xl lg:max-w-xl lg:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold text-slate-900">
              {categoryName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-icon shrink-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div data-modal-scroll className="modal-scroll min-h-0 flex-1 px-4 py-3">
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No transactions in this category.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {paginated.map((tx) => {
                const accountName = tx.account?.name ?? '—'
                const label = tx.note?.trim() || accountName

                return (
                  <li key={tx.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatTransactionDateLabel(tx.transaction_date)} · {accountName}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-rose-600">
                      −{formatMoney(tx.amount, currency)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {transactions.length > PAGE_SIZE && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, transactions.length)} of{' '}
              {transactions.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  )
}
