import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import ModalShell from '../ModalShell'
import { CURRENCIES } from '../../lib/constants'
import { HOLDING_GROUPS } from '../../lib/netWorth'
import { formatAmountInput, formatMoney, parseAmountInput } from '../../lib/format'

const EMPTY = {
  name: '',
  holding_group: 'large_fixed',
  currency: 'INR',
  value: '',
  quantity: '',
  unit_price: '',
  unit_label: '',
  excluded_from_target: false,
  note: '',
}

export default function HoldingForm({
  open,
  holding,
  defaultGroup,
  defaultCurrency = 'INR',
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(EMPTY)
  const [byQuantity, setByQuantity] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    if (holding) {
      const priced = holding.quantity !== null && holding.quantity !== undefined
      setForm({
        name: holding.name ?? '',
        holding_group: holding.holding_group,
        currency: holding.currency ?? 'INR',
        value: holding.value != null ? String(holding.value) : '',
        quantity: holding.quantity != null ? String(holding.quantity) : '',
        unit_price: holding.unit_price != null ? String(holding.unit_price) : '',
        unit_label: holding.unit_label ?? '',
        excluded_from_target: Boolean(holding.excluded_from_target),
        note: holding.note ?? '',
      })
      setByQuantity(priced)
    } else {
      setForm({
        ...EMPTY,
        holding_group: defaultGroup ?? EMPTY.holding_group,
        currency: defaultCurrency,
      })
      setByQuantity(false)
    }
    setError(null)
  }, [open, holding, defaultGroup, defaultCurrency])

  const computed = useMemo(() => {
    const q = Number(form.quantity)
    const p = Number(form.unit_price)
    if (!Number.isFinite(q) || !Number.isFinite(p)) return 0
    return q * p
  }, [form.quantity, form.unit_price])

  const set = (key) => (event) => {
    const target = event.target
    setForm((prev) => ({
      ...prev,
      [key]: target.type === 'checkbox' ? target.checked : target.value,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Give it a name.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        value: byQuantity ? 0 : Number(form.value) || 0,
        quantity: byQuantity ? form.quantity : null,
        unit_price: byQuantity ? form.unit_price : null,
        unit_label: byQuantity ? form.unit_label : null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this holding')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setSaving(true)
    setError(null)
    try {
      await onDelete(holding.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this holding')
      setSaving(false)
    }
  }

  const fieldClass =
    'n w-full rounded-lg border border-ink-rule bg-paper-sunk px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent'
  const labelClass = 'text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint'

  return (
    <ModalShell open={open} onClose={onClose} closeDisabled={saving} hideBottomNav>
      <div className="modal-panel max-h-[90dvh] rounded-t-2xl border border-ink-rule bg-paper-card lg:max-w-md lg:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink-hairline px-4 py-3">
          <h2 className="font-display text-[17px] font-semibold text-ink">
            {holding ? 'Edit holding' : 'Add holding'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="holding-form"
              disabled={saving}
              className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-paper-sunk"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <form id="holding-form" onSubmit={submit} className="modal-scroll space-y-3.5 px-4 py-4">
          <div>
            <label htmlFor="h-name" className={labelClass}>Name</label>
            <input
              id="h-name"
              value={form.name}
              onChange={set('name')}
              autoFocus
              placeholder="What is it?"
              className={`${fieldClass} font-sans`}
            />
          </div>

          <div>
            <span className={labelClass}>Group</span>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {HOLDING_GROUPS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, holding_group: g.key }))}
                  className={`rounded-lg px-2.5 py-2 text-left text-[12px] transition ${
                    form.holding_group === g.key
                      ? 'bg-accent text-white'
                      : 'bg-paper-sunk text-ink-muted hover:bg-paper-rail'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Currency</span>
            <div className="mt-1.5 flex gap-1.5">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, currency: c.code }))}
                  className={`flex-1 rounded-lg px-3 py-2 text-[12.5px] transition ${
                    form.currency === c.code
                      ? 'bg-accent text-white'
                      : 'bg-paper-sunk text-ink-muted hover:bg-paper-rail'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-paper-sunk px-3 py-2.5">
            <label htmlFor="h-by-qty" className="text-[13px] text-ink">
              Price by quantity
            </label>
            <input
              id="h-by-qty"
              type="checkbox"
              checked={byQuantity}
              onChange={(e) => setByQuantity(e.target.checked)}
              className="h-4 w-4 accent-[#3B4CC0]"
            />
          </div>

          {byQuantity ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="h-qty" className={labelClass}>Quantity</label>
                  <input
                    id="h-qty"
                    inputMode="decimal"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, quantity: parseAmountInput(e.target.value) }))
                    }
                    placeholder="0"
                    className={`${fieldClass} mt-1.5`}
                  />
                </div>
                <div>
                  <label htmlFor="h-price" className={labelClass}>Unit price</label>
                  <input
                    id="h-price"
                    inputMode="decimal"
                    value={form.unit_price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit_price: parseAmountInput(e.target.value) }))
                    }
                    placeholder="0"
                    className={`${fieldClass} mt-1.5`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="h-unit" className={labelClass}>Unit label (optional)</label>
                <input
                  id="h-unit"
                  value={form.unit_label}
                  onChange={set('unit_label')}
                  placeholder="units, g, shares"
                  className={`${fieldClass} mt-1.5 font-sans`}
                />
              </div>
              <p className="rounded-lg bg-paper-sunk px-3 py-2.5 text-[12.5px] text-ink-muted">
                Value{' '}
                <span className="n font-medium text-ink">
                  {formatMoney(computed, form.currency)}
                </span>
              </p>
            </>
          ) : (
            <div>
              <label htmlFor="h-value" className={labelClass}>Value</label>
              <input
                id="h-value"
                inputMode="decimal"
                value={formatAmountInput(form.value, form.currency)}
                onChange={(e) => setForm((p) => ({ ...p, value: parseAmountInput(e.target.value) }))}
                placeholder="0"
                className={`${fieldClass} mt-1.5`}
              />
            </div>
          )}

          <div className="flex items-start justify-between gap-3 rounded-lg bg-paper-sunk px-3 py-2.5">
            <label htmlFor="h-excluded" className="text-[13px] text-ink">
              Exclude from target
              <span className="mt-0.5 block text-[11px] text-ink-faint">
                Still counts in net worth, but not toward the target.
              </span>
            </label>
            <input
              id="h-excluded"
              type="checkbox"
              checked={form.excluded_from_target}
              onChange={set('excluded_from_target')}
              className="mt-1 h-4 w-4 shrink-0 accent-[#3B4CC0]"
            />
          </div>

          <div>
            <label htmlFor="h-note" className={labelClass}>Note (optional)</label>
            <input
              id="h-note"
              value={form.note}
              onChange={set('note')}
              className={`${fieldClass} mt-1.5 font-sans`}
            />
          </div>

          {error && <p className="text-[12.5px] text-negative">{error}</p>}

          {holding && (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="w-full rounded-lg border border-negative/30 bg-negative-tint px-3 py-2.5 text-[13px] font-medium text-negative transition hover:bg-negative/15 disabled:opacity-60"
            >
              Delete holding
            </button>
          )}
        </form>
      </div>
    </ModalShell>
  )
}
