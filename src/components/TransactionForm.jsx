import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { CURRENCIES, getColorPalette } from '../lib/constants'
import { buildCategoryPickerTree, getSelectableCategories } from '../lib/categories'
import { parseAmountInput } from '../lib/format'
import ModalShell from './ModalShell'

const chipBase =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition active:scale-95'

const categoryChipBase =
  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition active:scale-95 sm:text-sm'

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

function emptyForm(defaultCurrency = 'INR') {
  return {
    type: 'expense',
    amount: '',
    account_id: '',
    transfer_to_account_id: '',
    category_id: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
    currency: defaultCurrency,
  }
}

export default function TransactionForm({
  open,
  onClose,
  transaction,
  accounts,
  expenseCategories,
  incomeCategories,
  goals = [],
  defaultCurrency = 'INR',
  onSubmit,
  onError,
}) {
  const titleId = useId()
  const [values, setValues] = useState(emptyForm(defaultCurrency))
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(transaction)

  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.is_archived),
    [accounts],
  )
  const categories = values.type === 'income' ? incomeCategories : expenseCategories
  const categoryKind = values.type === 'income' ? 'income' : 'expense'
  const pickerGroups = useMemo(
    () => buildCategoryPickerTree(categories, categoryKind),
    [categories, categoryKind],
  )
  const selectableCategories = useMemo(
    () => getSelectableCategories(categories, categoryKind),
    [categories, categoryKind],
  )
  const resetKey = open
    ? `${transaction?.id ?? 'new'}:${activeAccounts.map((a) => a.id).join(',')}:${expenseCategories.map((c) => c.id).join(',')}:${incomeCategories.map((c) => c.id).join(',')}:${defaultCurrency}`
    : 'closed'
  const lastResetKeyRef = useRef('')

  useEffect(() => {
    if (!open) {
      lastResetKeyRef.current = 'closed'
      return
    }
    if (lastResetKeyRef.current === resetKey) return
    lastResetKeyRef.current = resetKey

    if (transaction) {
      setValues({
        type: transaction.type,
        amount: String(transaction.amount ?? ''),
        account_id: transaction.account_id ?? '',
        transfer_to_account_id: transaction.transfer_to_account_id ?? '',
        category_id: transaction.category_id ?? '',
        transaction_date: transaction.transaction_date ?? format(new Date(), 'yyyy-MM-dd'),
        note: transaction.note ?? '',
        currency: transaction.account?.currency ?? defaultCurrency,
      })
    } else {
      const firstAccount = activeAccounts[0]
      setValues({
        ...emptyForm(defaultCurrency),
        account_id: firstAccount?.id ?? '',
        currency: firstAccount?.currency ?? defaultCurrency,
        category_id: selectableCategories[0]?.id ?? '',
      })
    }
  }, [open, resetKey, transaction, activeAccounts, expenseCategories, incomeCategories, defaultCurrency])

  if (!open) return null

  const selectedAccount = activeAccounts.find((a) => a.id === values.account_id)
  const currency = selectedAccount?.currency ?? values.currency

  const handleTypeChange = (type) => {
    const kind = type === 'income' ? 'income' : 'expense'
    const cats = type === 'income' ? incomeCategories : expenseCategories
    const first = getSelectableCategories(cats, kind)[0]
    setValues((v) => ({
      ...v,
      type,
      category_id: type === 'transfer' ? '' : (first?.id ?? ''),
      transfer_to_account_id: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = Number(parseAmountInput(values.amount))
    if (!amount || amount <= 0) {
      onError?.('Enter a valid amount')
      return
    }
    if (!values.account_id) {
      onError?.('Select an account')
      return
    }
    if (values.type === 'transfer') {
      if (!values.transfer_to_account_id) {
        onError?.('Select a destination account')
        return
      }
      if (values.transfer_to_account_id === values.account_id) {
        onError?.('Choose different accounts')
        return
      }
      const to = activeAccounts.find((a) => a.id === values.transfer_to_account_id)
      if (to && to.currency !== currency) {
        onError?.('Accounts must use the same currency')
        return
      }
    } else if (!values.category_id && !selectableCategories[0]?.id) {
      onError?.('Add a category in Settings first')
      return
    }

    const categoryId =
      values.type === 'transfer' ? null : values.category_id || selectableCategories[0]?.id
    const selectedCategory = selectableCategories.find((c) => c.id === categoryId)
    const linkedGoalId = selectedCategory?.goal_id || null
    // Prefer category.goal_id; fall back to goals list match by linked_category_id
    const goalId =
      linkedGoalId ||
      goals.find((g) => g.linked_category_id === categoryId)?.id ||
      null

    setSubmitting(true)
    try {
      const payload = {
        type: values.type,
        amount,
        account_id: values.account_id,
        category_id: categoryId,
        transfer_to_account_id:
          values.type === 'transfer' ? values.transfer_to_account_id : null,
        transaction_date: values.transaction_date,
        note: values.note.trim() || null,
      }
      await onSubmit(payload, transaction?.id, {
        goalId: !isEdit && values.type !== 'transfer' ? goalId : null,
      })
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  if (activeAccounts.length === 0) {
    return (
      <ModalShell open={open} onClose={onClose} align="center" hideBottomNav>
        <div
          data-modal-panel
          className="modal-panel relative max-w-sm rounded-2xl p-4 text-center"
        >
          <p className="text-slate-700">Add a balance in Settings before recording transactions.</p>
          <button type="button" onClick={onClose} className="btn-primary mt-4 w-full">
            OK
          </button>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell open={open} onClose={onClose} closeDisabled={submitting} hideBottomNav>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel max-h-[min(92dvh,100dvh)] max-w-lg rounded-t-3xl lg:max-h-[90dvh] lg:max-w-xl lg:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button type="button" onClick={onClose} disabled={submitting} className="btn-icon">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div data-modal-scroll className="modal-scroll space-y-5 p-4 pb-8">
          {!isEdit && (
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                    values.type === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="tx-amount" className="label-field">Amount</label>
            <div className="currency-amount-field">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                {CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹'}
              </span>
              <input
                id="tx-amount"
                inputMode="decimal"
                value={values.amount}
                onChange={(e) => setValues((v) => ({ ...v, amount: parseAmountInput(e.target.value) }))}
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-base focus:outline-none"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <p className="label-field">{values.type === 'transfer' ? 'From account' : 'Account'}</p>
            <div className="chip-row flex-wrap">
              {activeAccounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, account_id: a.id, currency: a.currency }))}
                  className={`${chipBase} ${
                    values.account_id === a.id
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-slate-50 text-slate-700 ring-slate-200'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {values.type === 'transfer' && (
            <div>
              <p className="label-field">To account</p>
              <div className="chip-row flex-wrap">
                {activeAccounts
                  .filter((a) => a.id !== values.account_id && a.currency === currency)
                  .map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, transfer_to_account_id: a.id }))}
                      className={`${chipBase} ${
                        values.transfer_to_account_id === a.id
                          ? 'bg-brand-600 text-white ring-brand-600'
                          : 'bg-slate-50 text-slate-700 ring-slate-200'
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {values.type !== 'transfer' && (
            <div>
              <p className="label-field">Category</p>
              {pickerGroups.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No categories yet.{' '}
                  <a href="/settings/categories" className="font-medium text-brand-600">
                    Add categories
                  </a>
                </p>
              ) : (
                <div className="space-y-3">
                  {pickerGroups.map((group) => (
                    <div key={group.label ?? group.parentId ?? 'root'}>
                      {group.label && (
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {group.label}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((c) => {
                          const palette = getColorPalette(c.color)
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setValues((v) => ({ ...v, category_id: c.id }))}
                              className={`${categoryChipBase} ${
                                values.category_id === c.id
                                  ? palette.chip + ' ring-2'
                                  : 'bg-slate-50 text-slate-700 ring-slate-200'
                              }`}
                            >
                              {c.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(() => {
                const selected = selectableCategories.find((c) => c.id === values.category_id)
                const goal =
                  selected?.goal_id
                    ? goals.find((g) => g.id === selected.goal_id)
                    : goals.find((g) => g.linked_category_id === values.category_id)
                if (!goal) return null
                const goalCurrency = goal.currency ?? 'INR'
                if (goalCurrency === currency) {
                  return (
                    <p className="mt-1.5 text-xs text-emerald-700">
                      Counts toward goal: {goal.name}
                    </p>
                  )
                }
                return (
                  <p className="mt-1.5 text-xs text-emerald-700">
                    Counts toward goal: {goal.name} (converts {currency} → {goalCurrency})
                  </p>
                )
              })()}
            </div>
          )}

          <div>
            <label htmlFor="tx-date" className="label-field">Date</label>
            <input
              id="tx-date"
              type="date"
              value={values.transaction_date}
              onChange={(e) => setValues((v) => ({ ...v, transaction_date: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="tx-note" className="label-field">Note (optional)</label>
            <input
              id="tx-note"
              value={values.note}
              onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
              className="input-field"
              placeholder="Coffee, salary, etc."
            />
          </div>

          <button type="submit" disabled={submitting || (isEdit && values.type === 'transfer')} className="btn-primary w-full">
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add transaction'}
          </button>
          {isEdit && values.type === 'transfer' && (
            <p className="text-center text-xs text-slate-500">Transfers cannot be edited. Delete and recreate.</p>
          )}
          </div>
        </form>
      </div>
    </ModalShell>
  )
}
