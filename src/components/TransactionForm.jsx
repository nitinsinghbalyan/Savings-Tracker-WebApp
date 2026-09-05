import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Delete, X } from 'lucide-react'
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

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back']

function emptyForm(defaultCurrency = 'INR') {
  return {
    type: 'expense',
    amount: '',
    account_id: '',
    transfer_to_account_id: '',
    category_id: '',
    goal_id: '',
    transaction_date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
    currency: defaultCurrency,
  }
}

function appendKeypadDigit(current, key) {
  const raw = String(current ?? '')
  if (key === 'back') {
    return raw.slice(0, -1)
  }
  if (key === '.') {
    if (raw.includes('.')) return raw
    return raw === '' ? '0.' : `${raw}.`
  }
  if (!/^\d$/.test(key)) return raw

  const dotIndex = raw.indexOf('.')
  if (dotIndex !== -1 && raw.length - dotIndex > 2) return raw
  if (raw === '0') return key
  return parseAmountInput(`${raw}${key}`)
}

function AmountKeypad({ onKey }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Amount keypad">
      {KEYPAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          className="flex min-h-14 items-center justify-center rounded-2xl bg-slate-50 text-xl font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 transition active:scale-95 active:bg-slate-100"
          aria-label={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}
        >
          {key === 'back' ? <Delete className="h-5 w-5" aria-hidden="true" /> : key}
        </button>
      ))}
    </div>
  )
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
  const [step, setStep] = useState('amount')
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
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
  // Exclude goal-linked categories from the Category section (they live under Goals).
  const categoryRows = useMemo(() => {
    const rows = []
    let rootItems = []
    for (const group of pickerGroups) {
      if (group.isGoalsGroup) continue
      const items = group.items.filter((c) => !c.goal_id)
      if (items.length === 0) continue
      if (!group.label) {
        rootItems = rootItems.concat(items)
        continue
      }
      if (rootItems.length > 0) {
        rows.push({ key: 'root', label: null, items: rootItems })
        rootItems = []
      }
      rows.push({
        key: group.parentId ?? group.label,
        label: group.label,
        items,
      })
    }
    if (rootItems.length > 0) {
      rows.push({ key: 'root', label: null, items: rootItems })
    }
    return rows
  }, [pickerGroups])
  const selectableCategories = useMemo(
    () => getSelectableCategories(categories, categoryKind).filter((c) => !c.goal_id),
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

    setIsRecurring(false)
    setFrequency('monthly')

    if (transaction) {
      setStep('details')
      setValues({
        type: transaction.type,
        amount: String(transaction.amount ?? ''),
        account_id: transaction.account_id ?? '',
        transfer_to_account_id: transaction.transfer_to_account_id ?? '',
        category_id: transaction.category_id ?? '',
        goal_id: transaction.goal_id ?? '',
        transaction_date: transaction.transaction_date ?? format(new Date(), 'yyyy-MM-dd'),
        note: transaction.note ?? '',
        currency: transaction.account?.currency ?? defaultCurrency,
      })
    } else {
      const firstAccount = activeAccounts[0]
      setStep('amount')
      setValues({
        ...emptyForm(defaultCurrency),
        account_id: firstAccount?.id ?? '',
        currency: firstAccount?.currency ?? defaultCurrency,
        category_id: '',
        goal_id: '',
      })
    }
  }, [open, resetKey, transaction, activeAccounts, expenseCategories, incomeCategories, defaultCurrency])

  if (!open) return null

  const selectedAccount = activeAccounts.find((a) => a.id === values.account_id)
  const currency = selectedAccount?.currency ?? values.currency
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹'
  const amountValue = Number(parseAmountInput(values.amount))
  const amountReady = Boolean(amountValue && amountValue > 0)

  const handleTypeChange = (type) => {
    setValues((v) => ({
      ...v,
      type,
      category_id: type === 'transfer' ? '' : v.category_id,
      goal_id: type === 'transfer' ? '' : v.goal_id,
      transfer_to_account_id: '',
    }))
    if (type === 'transfer') {
      setIsRecurring(false)
    }
  }

  const handleKeypad = (key) => {
    setValues((v) => ({ ...v, amount: appendKeypadDigit(v.amount, key) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isEdit && step === 'amount') {
      if (!amountReady) {
        onError?.('Enter a valid amount')
        return
      }
      setStep('details')
      return
    }

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
    } else if (!values.category_id) {
      if (selectableCategories.length === 0) {
        onError?.('Add a category in Settings first')
      } else {
        onError?.('Select a category')
      }
      return
    }

    const categoryId = values.type === 'transfer' ? null : values.category_id
    // Explicit goal pick only — no category→goal auto-link
    const goalId = values.goal_id || null

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
        recurring:
          !isEdit && isRecurring && values.type !== 'transfer'
            ? {
                frequency,
                interval_count: 1,
                start_date: values.transaction_date,
                day_of_month:
                  frequency === 'monthly'
                    ? Number(String(values.transaction_date).slice(8, 10)) || new Date().getDate()
                    : null,
              }
            : null,
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

  const saveDisabled = submitting || (isEdit && values.type === 'transfer')
  const showAmountStep = !isEdit && step === 'amount'
  const selectedGoal = values.goal_id
    ? (goals.find((g) => g.id === values.goal_id) ?? null)
    : null

  const renderCategoryChip = (c) => {
    const palette = getColorPalette(c.color)
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => setValues((v) => ({ ...v, category_id: c.id }))}
        className={`${categoryChipBase} ${
          values.category_id === c.id
            ? `${palette.chip} ring-2`
            : 'bg-slate-50 text-slate-700 ring-slate-200'
        }`}
      >
        {c.name}
      </button>
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
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h2 id={titleId} className="min-w-0 truncate text-lg font-semibold text-slate-900">
              {isEdit ? 'Edit transaction' : showAmountStep ? 'Amount' : 'Add transaction'}
            </h2>
            <div className="flex shrink-0 items-center gap-1.5">
              {showAmountStep ? (
                <button
                  type="submit"
                  disabled={!amountReady || submitting}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saveDisabled}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {submitting ? 'Saving…' : isEdit ? 'Save' : 'Save'}
                </button>
              )}
              <button type="button" onClick={onClose} disabled={submitting} className="btn-icon" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {showAmountStep ? (
            <div data-modal-scroll className="modal-scroll flex flex-1 flex-col gap-5 p-4 pb-8">
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

              <div className="flex flex-1 flex-col justify-center py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {currency}
                </p>
                <p className="mt-1 truncate text-5xl font-semibold tracking-tight text-slate-900">
                  <span className="mr-1 text-3xl font-medium text-slate-400">{currencySymbol}</span>
                  {values.amount || '0'}
                </p>
              </div>

              <AmountKeypad onKey={handleKeypad} />
            </div>
          ) : (
            <div data-modal-scroll className="modal-scroll space-y-5 p-4 pb-8">
              {!isEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep('amount')}
                    className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
                  >
                    <span className="text-sm text-slate-500">Amount</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {currencySymbol}
                      {values.amount || '0'}
                      <span className="ml-2 text-xs font-medium text-brand-600">Edit</span>
                    </span>
                  </button>

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
                </>
              )}

              {isEdit && (
                <div>
                  <label htmlFor="tx-amount" className="label-field">Amount</label>
                  <div className="currency-amount-field">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                      {currencySymbol}
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
              )}

              <div>
                <p className="label-field">{values.type === 'transfer' ? 'From account' : 'Account'}</p>
                <div className="flex flex-wrap gap-2">
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
                  <div className="flex flex-wrap gap-2">
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
                  {categoryRows.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No categories yet.{' '}
                      <a href="/settings/categories" className="font-medium text-brand-600">
                        Add categories
                      </a>
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {categoryRows.map((row) => (
                        <div key={row.key}>
                          {row.label && (
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {row.label}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {row.items.map(renderCategoryChip)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {values.type !== 'transfer' && !isEdit && goals.length > 0 && (
                <div>
                  <p className="label-field">Goal (optional)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() =>
                          setValues((v) => ({
                            ...v,
                            goal_id: v.goal_id === g.id ? '' : g.id,
                          }))
                        }
                        className={`${categoryChipBase} ${
                          values.goal_id === g.id
                            ? 'bg-brand-600 text-white ring-brand-600'
                            : 'bg-slate-50 text-slate-700 ring-slate-200'
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  {selectedGoal && (
                    <p className="mt-1.5 text-xs text-emerald-700">
                      Counts toward goal: {selectedGoal.name}
                      {(selectedGoal.currency ?? 'INR') !== currency &&
                        ` (converts ${currency} → ${selectedGoal.currency ?? 'INR'})`}
                    </p>
                  )}
                </div>
              )}

              {values.type !== 'transfer' && isEdit && values.goal_id && selectedGoal && (
                <p className="text-xs text-emerald-700">
                  Counts toward goal: {selectedGoal.name}. Delete and re-add to change this.
                </p>
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

              {!isEdit && values.type !== 'transfer' && (
                <div className="space-y-2.5 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-inset ring-slate-200">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-slate-800">Make recurring</span>
                  </label>
                  {isRecurring && (
                    <div className="flex flex-wrap gap-1.5 pl-7">
                      {FREQUENCIES.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFrequency(f.value)}
                          className={`${categoryChipBase} ${
                            frequency === f.value
                              ? 'bg-brand-600 text-white ring-brand-600'
                              : 'bg-white text-slate-700 ring-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isEdit && values.type === 'transfer' && (
                <p className="text-center text-xs text-slate-500">
                  Transfers cannot be edited. Delete and recreate.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </ModalShell>
  )
}
