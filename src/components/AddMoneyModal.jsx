import { useEffect, useId, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { getCurrencySymbol } from '../lib/constants'
import { formatMoney } from '../lib/format'
import {
  buildConversionNote,
  convertAmount,
  fetchExchangeRate,
} from '../lib/exchangeRate'
import ModalShell from './ModalShell'

const chipBase =
  'inline-flex min-h-10 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition'

export default function AddMoneyModal({
  open,
  onClose,
  goal,
  accounts = [],
  defaultCurrency = 'INR',
  onSubmit,
  onError,
}) {
  const titleId = useId()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState('')
  const [transactionDate, setTransactionDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [amountError, setAmountError] = useState(null)
  const [accountError, setAccountError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [rateInfo, setRateInfo] = useState(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState(null)

  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.is_archived),
    [accounts],
  )

  const selectedAccount = activeAccounts.find((a) => a.id === accountId)
  const goalCurrency = goal?.currency ?? 'INR'
  const inputCurrency = selectedAccount?.currency ?? defaultCurrency ?? 'INR'
  const needsConversion = goalCurrency !== inputCurrency

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional modal reset
    setAmount('')
    setNote('')
    setAmountError(null)
    setAccountError(null)
    setSubmitError(null)
    setSubmitting(false)
    setRateInfo(null)
    setRateLoading(false)
    setRateError(null)
    setTransactionDate(format(new Date(), 'yyyy-MM-dd'))

    const preferred =
      activeAccounts.find((a) => (a.currency ?? 'INR') === (defaultCurrency ?? 'INR')) ??
      activeAccounts[0]
    setAccountId(preferred?.id ?? '')
  }, [open, goal, activeAccounts, defaultCurrency])

  useEffect(() => {
    if (!open || !needsConversion) {
      setRateInfo(null)
      setRateError(null)
      setRateLoading(false)
      return undefined
    }

    let cancelled = false
    setRateLoading(true)
    setRateError(null)

    fetchExchangeRate(inputCurrency, goalCurrency)
      .then((data) => {
        if (!cancelled) {
          setRateInfo(data)
          setRateLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRateInfo(null)
          setRateLoading(false)
          setRateError(
            err instanceof Error ? err.message : 'Could not load exchange rate',
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, needsConversion, inputCurrency, goalCurrency])

  const convertedAmount = useMemo(() => {
    if (!needsConversion || !rateInfo?.rate || !amount.trim()) return null
    const value = Number(amount)
    if (Number.isNaN(value) || value <= 0) return null
    return convertAmount(value, rateInfo.rate)
  }, [amount, needsConversion, rateInfo])

  if (!open || !goal) return null

  const inputCurrencySymbol = getCurrencySymbol(inputCurrency)
  const goalCurrencySymbol = getCurrencySymbol(goalCurrency)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!accountId) {
      setAccountError('Select an account')
      return
    }

    const sourceAmount = Number(amount)
    if (!amount.trim() || Number.isNaN(sourceAmount) || sourceAmount <= 0) {
      setAmountError('Enter an amount greater than 0')
      return
    }

    if (needsConversion && (rateLoading || !rateInfo?.rate)) {
      setAmountError('Exchange rate is still loading. Try again in a moment.')
      return
    }

    const contributionAmount = needsConversion
      ? convertAmount(sourceAmount, rateInfo.rate)
      : sourceAmount

    if (!contributionAmount || contributionAmount <= 0) {
      setAmountError('Converted amount must be greater than 0')
      return
    }

    const contributionNote = needsConversion
      ? buildConversionNote({
          sourceAmount,
          sourceCurrency: inputCurrency,
          goalAmount: contributionAmount,
          goalCurrency,
          rate: rateInfo.rate,
          userNote: note.trim() || null,
        })
      : note.trim() || null

    setSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(goal, contributionAmount, contributionNote, {
        accountId,
        transactionDate,
        sourceAmount,
        accountCurrency: inputCurrency,
      })
      onClose()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setSubmitError(message)
      onError?.(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} closeDisabled={submitting}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel max-w-md rounded-t-2xl shadow-2xl lg:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Add money
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="btn-icon"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6" data-modal-scroll>
          <p className="mb-4 text-sm text-slate-600">
            Adding to{' '}
            <span className="font-semibold text-slate-900">{goal.name}</span>
            <span className="mt-1 block text-xs text-slate-500">
              Also records an Activity transaction from the selected account.
            </span>
            {needsConversion && (
              <span className="mt-1 block text-xs text-slate-500">
                Goal is in {goalCurrency}. Amount is in account currency ({inputCurrency}); we convert
                for the goal at today&apos;s rate.
              </span>
            )}
          </p>

          {submitError && (
            <p role="alert" className="alert-error mb-4">
              {submitError}
            </p>
          )}

          <div className="mb-4">
            <p className="label-field">Account</p>
            {activeAccounts.length === 0 ? (
              <p className="text-sm text-slate-500">Add a balance in Settings first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeAccounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAccountId(a.id)
                      setAccountError(null)
                    }}
                    className={`${chipBase} ${
                      accountId === a.id
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-slate-50 text-slate-700 ring-slate-200'
                    }`}
                  >
                    {a.name}
                    <span className={`ml-1 text-xs ${accountId === a.id ? 'text-white/80' : 'text-slate-400'}`}>
                      {a.currency ?? 'INR'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {accountError && <p className="mt-1 text-sm text-red-600">{accountError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="contribution-amount" className="label-field">
              Amount ({inputCurrency})
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {inputCurrencySymbol}
              </span>
              <input
                id="contribution-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setAmountError(null)
                  setSubmitError(null)
                }}
                placeholder="0"
                className="input-field pl-9"
                autoFocus
              />
            </div>
            {amountError && <p className="mt-1 text-sm text-red-600">{amountError}</p>}
            {needsConversion && rateLoading && (
              <p className="mt-2 text-sm text-slate-500">
                Loading today&apos;s {inputCurrency}/{goalCurrency} rate…
              </p>
            )}
            {needsConversion && rateError && (
              <p className="mt-2 text-sm text-red-600">{rateError}</p>
            )}
            {needsConversion && convertedAmount != null && rateInfo?.rate && (
              <p className="mt-2 text-sm font-medium text-brand-600">
                ≈ {formatMoney(convertedAmount, goalCurrency)} added to goal
                <span className="block text-xs font-normal text-slate-500">
                  1 {inputCurrency} = {rateInfo.rate} {goalCurrency}
                  {rateInfo.date ? ` · ${rateInfo.date}` : ''}
                </span>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="contribution-date" className="label-field">
              Date
            </label>
            <input
              id="contribution-date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="contribution-note" className="label-field">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="contribution-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Birthday gift money"
              className="input-field"
            />
          </div>

          <div className="flex flex-col gap-3 safe-bottom sm:flex-row-reverse">
            <button
              type="submit"
              disabled={
                submitting ||
                activeAccounts.length === 0 ||
                (needsConversion && (rateLoading || !rateInfo?.rate))
              }
              className="btn-primary w-full sm:flex-1"
            >
              {submitting
                ? 'Adding…'
                : needsConversion
                  ? `Add ${goalCurrencySymbol} to goal`
                  : 'Add to goal & Activity'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary w-full sm:flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  )
}
