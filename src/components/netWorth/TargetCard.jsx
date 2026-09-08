import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { formatAmountInput, formatMoney, parseAmountInput } from '../../lib/format'

export default function TargetCard({ target, currency, excludedCount = 0, onSave }) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(target ? String(target.target) : '')
  const [date, setDate] = useState(target?.targetDate ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const open = () => {
    setAmount(target ? String(target.target) : '')
    setDate(target?.targetDate ?? '')
    setError(null)
    setEditing(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({ target: amount === '' ? null : Number(amount), targetDate: date || null })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the target')
    } finally {
      setSaving(false)
    }
  }

  const dateLabel = (() => {
    if (!target?.targetDate) return null
    try {
      return format(parseISO(target.targetDate), 'd MMM yyyy')
    } catch {
      return target.targetDate
    }
  })()

  if (editing) {
    return (
      <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card p-4">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="nw-target" className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
              Target amount
            </label>
            <input
              id="nw-target"
              inputMode="decimal"
              value={formatAmountInput(amount, currency)}
              onChange={(e) => setAmount(parseAmountInput(e.target.value))}
              placeholder="0"
              className="n mt-1.5 w-full rounded-lg border border-ink-rule bg-paper-sunk px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="nw-target-date" className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
              By
            </label>
            <input
              id="nw-target-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="n mt-1.5 w-full rounded-lg border border-ink-rule bg-paper-sunk px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-[12px] text-negative">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent px-3 py-2.5 text-[13px] font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save target'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-ink-rule px-3 py-2.5 text-[13px] text-ink-muted transition hover:bg-paper-sunk"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    )
  }

  if (!target) {
    return (
      <button
        type="button"
        onClick={open}
        className="w-full rounded-xl border border-dashed border-ink-rule bg-paper-card px-4 py-3.5 text-left text-[13px] text-ink-muted transition hover:border-accent hover:text-ink"
      >
        Set a net worth target
      </button>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
          Target{dateLabel ? ` · ${dateLabel}` : ''}
        </p>
        <button
          type="button"
          onClick={open}
          className="text-[11px] text-accent transition hover:text-accent-hover"
        >
          Edit
        </button>
      </div>

      <p className="n mt-1.5 text-[22px] font-medium leading-none tracking-[-.02em] text-ink">
        {formatMoney(target.eligible, currency)}
        <span className="text-[13px] font-normal text-ink-faint">
          {' / '}
          {formatMoney(target.target, currency)}
        </span>
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-line">
        <div
          className={`h-full rounded-full ${target.reached ? 'bg-positive' : 'bg-accent'}`}
          style={{ width: `${Math.min(100, target.percent)}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
        <span className="n">{target.percent.toFixed(1)}% complete</span>
        <span className="n">
          {target.reached ? 'Reached' : `${formatMoney(target.delta, currency)} to go`}
        </span>
      </div>

      {excludedCount > 0 && (
        <p className="mt-2 text-[10.5px] text-ink-faint">
          Excludes {excludedCount} holding{excludedCount === 1 ? '' : 's'} marked off target.
        </p>
      )}
    </section>
  )
}
