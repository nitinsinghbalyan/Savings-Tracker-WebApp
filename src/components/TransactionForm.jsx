import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { format, subDays } from 'date-fns'
import { Delete, Repeat, X } from 'lucide-react'
import { CURRENCIES } from '../lib/constants'
import { buildCategoryPickerTree, getSelectableCategories } from '../lib/categories'
import { formatTransactionDateLabel } from '../lib/transactions'
import { formatCurrency, parseAmountInput } from '../lib/format'
import { percentComplete, savedAmount } from '../lib/contributions'
import { SELECT_CHIP_BASE, SELECT_CHIP_IDLE, SELECT_CHIP_ON } from '../lib/chipStyles'
import ModalShell from './ModalShell'
import CategoryChip from './CategoryChip'

const chipBase =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition active:scale-95'

const categoryChipBase = SELECT_CHIP_BASE

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
  const dateInputRef = useRef(null)

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
  // Artboard 1f date chips. `isPresetDate` decides whether the third chip reads
  // "Pick date" or the chosen date, so the three chips are mutually exclusive.
  const isPresetDate =
    values.transaction_date === format(new Date(), 'yyyy-MM-dd') ||
    values.transaction_date === format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const openDatePicker = () => {
    const input = dateInputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }
  const currency = selectedAccount?.currency ?? values.currency
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹'
  const amountValue = Number(parseAmountInput(values.amount))

  // Goals offered in the picker: unfinished first (keeping the deadline order
  // they arrive in), finished ones last so topping up stays possible.
  // Plain computation, not useMemo: this runs after the `if (!open) return null`
  // above, and a hook there would change the hook count between renders.
  const goalChoices = [
    ...goals.filter((g) => percentComplete(g) < 100),
    ...goals.filter((g) => percentComplete(g) >= 100),
  ]
  // For an expense, a goal pick stands in for the category.
  const goalCountsAsCategory = values.type === 'expense' && Boolean(values.goal_id)
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
    } else if (!values.category_id && !goalCountsAsCategory) {
      if (selectableCategories.length === 0 && goalChoices.length === 0) {
        onError?.('Add a category in Settings first')
      } else {
        onError?.(
          values.type === 'expense' && goalChoices.length > 0
            ? 'Select a category or a goal'
            : 'Select a category',
        )
      }
      return
    }

    // A goal pick IS the category for an expense: TransactionsPage resolves the
    // goal's own savings category, so no second "Equity"-style pick is needed.
    // On edit the goal entry keeps the category it was saved with.
    const categoryId =
      values.type === 'transfer' || (goalCountsAsCategory && !isEdit)
        ? null
        : values.category_id || null
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

  // Smart preview: what this entry does to the goal, in the goal's terms.
  const goalPreview = (() => {
    if (!selectedGoal || values.type !== 'expense') return null
    const goalCurrency = selectedGoal.currency ?? 'INR'
    const before = Math.round(percentComplete(selectedGoal))
    if (goalCurrency !== currency || !(amountValue > 0)) {
      return { before, after: null, converts: goalCurrency !== currency, goalCurrency }
    }
    const target = Number(selectedGoal.target_amount) || 0
    const after =
      target > 0 ? Math.min(100, Math.round(((savedAmount(selectedGoal) + amountValue) / target) * 100)) : null
    return { before, after, converts: false, goalCurrency }
  })()

  // Picking a category clears a goal pick and vice versa (expenses): one
  // choice, one meaning.
  const renderCategoryChip = (c) => (
    <CategoryChip
      key={c.id}
      category={c}
      selected={values.category_id === c.id && !goalCountsAsCategory}
      onSelect={(id) =>
        setValues((v) => ({
          ...v,
          category_id: id,
          goal_id: v.type === 'expense' && !isEdit ? '' : v.goal_id,
        }))
      }
    />
  )

  const renderGoalChip = (g) => (
    <CategoryChip
      key={g.id}
      category={{ id: g.id, name: g.name, color: g.color, icon: 'target' }}
      selected={values.goal_id === g.id}
      onSelect={(id) =>
        setValues((v) => {
          const picking = v.goal_id !== id
          return {
            ...v,
            goal_id: picking ? id : '',
            // Expense: the goal stands in for the category.
            category_id: v.type === 'expense' && picking ? '' : v.category_id,
          }
        })
      }
    />
  )

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
                      values.type === t.value ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-600'
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
                          values.type === t.value ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-600'
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
                          ? SELECT_CHIP_ON
                          : SELECT_CHIP_IDLE
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
                {selectedAccount && (
                  <p className="mt-2 text-xs text-slate-500">
                    {selectedAccount.name} ·{' '}
                    <span className="n">
                      {formatCurrency(
                        Number(selectedAccount.balance ?? selectedAccount.opening_balance ?? 0),
                        selectedAccount.currency ?? 'INR',
                      )}
                    </span>{' '}
                    left
                  </p>
                )}
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
                              ? SELECT_CHIP_ON
                              : SELECT_CHIP_IDLE
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
                  <p className="label-field">
                    {values.type === 'expense' && goalChoices.length > 0 && !isEdit
                      ? 'Category or goal'
                      : 'Category'}
                  </p>
                  {categoryRows.length === 0 && goalChoices.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No categories yet.{' '}
                      <a href="/settings/categories" className="font-medium text-brand-600">
                        Add categories
                      </a>
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Expenses: goals sit in the picker as categories in their own
                          right — choosing one files the money under the goal's savings
                          category, so the user never picks a second "Equity" chip. */}
                      {values.type === 'expense' && !isEdit && goalChoices.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Save to a goal
                          </p>
                          <div className="flex flex-wrap gap-2">{goalChoices.map(renderGoalChip)}</div>
                        </div>
                      )}
                      {/* Editing a goal entry: the goal is fixed, so show it rather
                          than a category list the change would not apply to. */}
                      {isEdit && values.goal_id && selectedGoal ? (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <CategoryChip
                              category={{ id: selectedGoal.id, name: selectedGoal.name, color: selectedGoal.color, icon: 'target' }}
                              selected
                              onSelect={() => {}}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-ink-soft">
                            Saved to this goal. Delete and re-add to move it.
                          </p>
                        </div>
                      ) : (
                        categoryRows.map((row, i) => {
                          // With a goals row above, the first unlabelled row gets a
                          // heading so the two groups read as separate.
                          const heading =
                            row.label ??
                            (i === 0 && values.type === 'expense' && !isEdit && goalChoices.length > 0
                              ? 'Or a category'
                              : null)
                          return (
                          <div key={row.key}>
                            {heading && (
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {heading}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {row.items.map(renderCategoryChip)}
                            </div>
                          </div>
                          )
                        })
                      )}
                    </div>
                  )}
                  {goalPreview && (
                    <p className="mt-2 text-xs text-positive">
                      Saves to {selectedGoal.name}
                      {goalPreview.after != null
                        ? ` · ${goalPreview.before}% → ${goalPreview.after}%`
                        : ` · ${goalPreview.before}% saved`}
                      {goalPreview.converts && ` (converts ${currency} → ${goalPreview.goalCurrency})`}
                    </p>
                  )}
                </div>
              )}

              {/* Income can still also count toward a goal; its category stays required. */}
              {values.type === 'income' && !isEdit && goalChoices.length > 0 && (
                <div>
                  <p className="label-field">Also add to a goal (optional)</p>
                  <div className="flex flex-wrap gap-2">{goalChoices.map(renderGoalChip)}</div>
                  {selectedGoal && (
                    <p className="mt-1.5 text-xs text-positive">
                      Counts toward goal: {selectedGoal.name}
                      {(selectedGoal.currency ?? 'INR') !== currency &&
                        ` (converts ${currency} → ${selectedGoal.currency ?? 'INR'})`}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="label-field">Date</p>
                <div className="chip-row">
                  {[
                    { label: 'Today', value: format(new Date(), 'yyyy-MM-dd') },
                    { label: 'Yesterday', value: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        setValues((v) => ({ ...v, transaction_date: opt.value }))
                      }
                      className={`${categoryChipBase} chip-row-item justify-center ${
                        values.transaction_date === opt.value
                          ? SELECT_CHIP_ON
                          : SELECT_CHIP_IDLE
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={openDatePicker}
                    className={`${categoryChipBase} chip-row-item justify-center ${
                      isPresetDate
                        ? SELECT_CHIP_IDLE
                        : SELECT_CHIP_ON
                    }`}
                  >
                    {isPresetDate ? 'Pick date' : formatTransactionDateLabel(values.transaction_date)}
                  </button>

                  {/* Visually hidden, opened via showPicker() — same pattern as GoalForm */}
                  <input
                    ref={dateInputRef}
                    id="tx-date"
                    type="date"
                    value={values.transaction_date}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, transaction_date: e.target.value }))
                    }
                    className="sr-only"
                    aria-label="Pick a date"
                    required
                  />
                </div>
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
                <div className="space-y-2.5">
                  {/* Artboard 1f: one compact toggle instead of a checkbox card.
                      isRecurring / frequency and the submit payload are unchanged. */}
                  <button
                    type="button"
                    onClick={() => setIsRecurring((on) => !on)}
                    aria-pressed={isRecurring}
                    className={`${categoryChipBase} gap-1.5 ${
                      isRecurring
                        ? SELECT_CHIP_ON
                        : SELECT_CHIP_IDLE
                    }`}
                  >
                    <Repeat className="h-4 w-4" aria-hidden="true" />
                    {isRecurring
                      ? (FREQUENCIES.find((f) => f.value === frequency)?.label ?? 'Monthly')
                      : 'Repeat'}
                  </button>

                  {isRecurring && (
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCIES.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFrequency(f.value)}
                          className={`${categoryChipBase} ${
                            frequency === f.value
                              ? SELECT_CHIP_ON
                              : SELECT_CHIP_IDLE
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
