import { useEffect, useId, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { buildCategoryPickerTree, getSelectableCategories } from '../lib/categories'
import { CURRENCIES, getColorPalette } from '../lib/constants'
import { parseAmountInput } from '../lib/format'
import ModalShell from './ModalShell'

const chipBase =
  'inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition active:scale-95'

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

function emptyForm(defaultCurrency = 'INR') {
  const today = format(new Date(), 'yyyy-MM-dd')
  return {
    type: 'expense',
    amount: '',
    account_id: '',
    transfer_to_account_id: '',
    category_id: '',
    note: '',
    frequency: 'monthly',
    interval_count: '1',
    day_of_month: String(new Date().getDate()),
    start_date: today,
    end_date: '',
    currency: defaultCurrency,
    is_paused: false,
  }
}

export default function RecurringTransactionForm({
  open,
  onClose,
  rule,
  accounts,
  expenseCategories,
  incomeCategories,
  defaultCurrency = 'INR',
  onSubmit,
  onError,
}) {
  const titleId = useId()
  const [values, setValues] = useState(emptyForm(defaultCurrency))
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(rule)

  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.is_archived),
    [accounts],
  )

  const allCategories = values.type === 'income' ? incomeCategories : expenseCategories
  const pickerGroups = useMemo(
    () => buildCategoryPickerTree(allCategories, values.type === 'income' ? 'income' : 'expense'),
    [allCategories, values.type],
  )
  const selectable = useMemo(
    () => getSelectableCategories(allCategories, values.type === 'income' ? 'income' : 'expense'),
    [allCategories, values.type],
  )

  useEffect(() => {
    if (!open) return
    if (rule) {
      setValues({
        type: rule.type,
        amount: String(rule.amount ?? ''),
        account_id: rule.account_id ?? '',
        transfer_to_account_id: rule.transfer_to_account_id ?? '',
        category_id: rule.category_id ?? '',
        note: rule.note ?? '',
        frequency: rule.frequency ?? 'monthly',
        interval_count: String(rule.interval_count ?? 1),
        day_of_month: String(rule.day_of_month ?? new Date().getDate()),
        start_date: rule.start_date ?? format(new Date(), 'yyyy-MM-dd'),
        end_date: rule.end_date ?? '',
        currency: rule.account?.currency ?? defaultCurrency,
        is_paused: Boolean(rule.is_paused),
      })
    } else {
      const firstAccount = activeAccounts[0]
      const firstCat = getSelectableCategories(expenseCategories, 'expense')[0]
      setValues({
        ...emptyForm(defaultCurrency),
        account_id: firstAccount?.id ?? '',
        currency: firstAccount?.currency ?? defaultCurrency,
        category_id: firstCat?.id ?? '',
      })
    }
  }, [open, rule, activeAccounts, expenseCategories, defaultCurrency])

  if (!open) return null

  const currency = values.currency

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = Number(values.amount)
    if (!amount || amount <= 0) {
      onError?.('Enter a valid amount')
      return
    }
    if (!values.account_id) {
      onError?.('Select an account')
      return
    }
    if (values.type === 'transfer' && !values.transfer_to_account_id) {
      onError?.('Select a destination account')
      return
    }
    if (values.type !== 'transfer' && !values.category_id && !selectable[0]?.id) {
      onError?.('Add a category in Settings first')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(
        {
          type: values.type,
          amount,
          account_id: values.account_id,
          category_id: values.type === 'transfer' ? null : values.category_id || selectable[0]?.id,
          transfer_to_account_id: values.type === 'transfer' ? values.transfer_to_account_id : null,
          note: values.note.trim() || null,
          frequency: values.frequency,
          interval_count: Math.max(1, Number(values.interval_count) || 1),
          day_of_month:
            values.frequency === 'monthly'
              ? Math.min(31, Math.max(1, Number(values.day_of_month) || 1))
              : null,
          start_date: values.start_date,
          end_date: values.end_date || null,
          is_paused: values.is_paused,
        },
        rule?.id,
      )
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
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
            {isEdit ? 'Edit recurring' : 'Add recurring'}
          </h2>
          <button type="button" onClick={onClose} disabled={submitting} className="btn-icon">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div data-modal-scroll className="modal-scroll space-y-5 p-4 pb-8">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    setValues((v) => ({
                      ...v,
                      type: t.value,
                      category_id: getSelectableCategories(
                        t.value === 'income' ? incomeCategories : expenseCategories,
                        t.value === 'income' ? 'income' : 'expense',
                      )[0]?.id ?? '',
                    }))
                  }
                  className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                    values.type === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="rec-amount" className="label-field">Amount</label>
              <div className="currency-amount-field">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                  {CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹'}
                </span>
                <input
                  id="rec-amount"
                  inputMode="decimal"
                  value={values.amount}
                  onChange={(e) => setValues((v) => ({ ...v, amount: parseAmountInput(e.target.value) }))}
                  className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-base focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <p className="label-field">Account</p>
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
                  <p className="text-sm text-slate-500">Add categories in Settings first.</p>
                ) : (
                  <div className="space-y-3">
                    {pickerGroups.map((group) => (
                      <div key={group.parentId ?? group.label ?? 'leaf'}>
                        {group.label && (
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {group.label}
                          </p>
                        )}
                        <div className="chip-row flex-wrap">
                          {group.items.map((c) => {
                            const palette = getColorPalette(c.color)
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setValues((v) => ({ ...v, category_id: c.id }))}
                                className={`${chipBase} ${
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
              </div>
            )}

            <div>
              <p className="label-field">Frequency</p>
              <div className="chip-row flex-wrap">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, frequency: f.value }))}
                    className={`${chipBase} ${
                      values.frequency === f.value
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-slate-50 text-slate-700 ring-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rec-interval" className="label-field">Every</label>
                <input
                  id="rec-interval"
                  type="number"
                  min="1"
                  value={values.interval_count}
                  onChange={(e) => setValues((v) => ({ ...v, interval_count: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              {values.frequency === 'monthly' && (
                <div>
                  <label htmlFor="rec-dom" className="label-field">Day of month</label>
                  <input
                    id="rec-dom"
                    type="number"
                    min="1"
                    max="31"
                    value={values.day_of_month}
                    onChange={(e) => setValues((v) => ({ ...v, day_of_month: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rec-start" className="label-field">Start date</label>
                <input
                  id="rec-start"
                  type="date"
                  value={values.start_date}
                  onChange={(e) => setValues((v) => ({ ...v, start_date: e.target.value }))}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="rec-end" className="label-field">End (optional)</label>
                <input
                  id="rec-end"
                  type="date"
                  value={values.end_date}
                  onChange={(e) => setValues((v) => ({ ...v, end_date: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rec-note" className="label-field">Note (optional)</label>
              <input
                id="rec-note"
                value={values.note}
                onChange={(e) => setValues((v) => ({ ...v, note: e.target.value }))}
                className="input-field w-full"
                placeholder="Rent, salary, SIP…"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.is_paused}
                onChange={(e) => setValues((v) => ({ ...v, is_paused: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Start paused
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create recurring rule'}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  )
}
