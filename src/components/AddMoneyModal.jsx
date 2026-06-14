import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { getCurrencySymbol } from '../lib/constants'

export default function AddMoneyModal({ open, onClose, goal, onSubmit, onError }) {
  const titleId = useId()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional modal reset
    setAmount('')
    setNote('')
    setAmountError(null)
    setSubmitError(null)
    setSubmitting(false)
  }, [open, goal])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, submitting])

  if (!open || !goal) return null

  const currencySymbol = getCurrencySymbol(goal.currency)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const value = Number(amount)
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setAmountError('Enter an amount greater than 0')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(goal, value, note.trim() || null)
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
        disabled={submitting}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
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

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6">
          <p className="mb-4 text-sm text-slate-600">
            Adding to{' '}
            <span className="font-semibold text-slate-900">{goal.name}</span>
          </p>

          {submitError && (
            <p role="alert" className="alert-error mb-4">
              {submitError}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="contribution-amount" className="label-field">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {currencySymbol}
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
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:flex-1">
              {submitting ? 'Adding…' : 'Add contribution'}
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
    </div>
  )
}
