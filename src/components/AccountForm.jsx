import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { ACCOUNT_TYPES, BANKS, COLOR_PALETTES, CURRENCIES, getBankPreset } from '../lib/constants'
import { formatAmountInput, parseAmountInput } from '../lib/format'
import BankIcon from './icons/banks/BankIcon'
import ModalShell from './ModalShell'

const chipBase =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition active:scale-95'

function emptyForm(defaultCurrency = 'INR') {
  return {
    name: '',
    account_type: 'checking',
    currency: defaultCurrency,
    opening_balance: '',
    color: 'indigo',
    bank: '',
  }
}

export default function AccountForm({
  open,
  onClose,
  account,
  defaultCurrency = 'INR',
  onSubmit,
  onError,
}) {
  const titleId = useId()
  const [values, setValues] = useState(emptyForm(defaultCurrency))
  const [submitting, setSubmitting] = useState(false)
  const isEdit = Boolean(account)

  useEffect(() => {
    if (!open) return
    if (account) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form when modal opens
      setValues({
        name: account.name ?? '',
        account_type: account.account_type ?? 'checking',
        currency: account.currency ?? 'INR',
        opening_balance: String(account.opening_balance ?? ''),
        color: account.color ?? 'indigo',
        bank: account.bank ?? '',
      })
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form when modal opens
      setValues(emptyForm(defaultCurrency))
    }
  }, [open, account, defaultCurrency])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!values.name.trim()) {
      onError?.('Name is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        account_type: values.account_type,
        currency: values.currency,
        opening_balance: Number(parseAmountInput(values.opening_balance)) || 0,
        color: values.color,
        bank: values.bank || null,
      })
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to save account')
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
        className="modal-panel max-h-[min(92dvh,100dvh)] max-w-lg rounded-t-3xl lg:max-h-[90dvh] lg:max-w-xl lg:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit account' : 'Add account'}
          </h2>
          <button type="button" onClick={onClose} disabled={submitting} className="btn-icon">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div data-modal-scroll className="modal-scroll space-y-5 p-4 pb-8">
          <div>
            <label htmlFor="account-name" className="label-field">Name</label>
            <input
              id="account-name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              className="input-field"
              placeholder="HDFC Savings"
              required
            />
          </div>

          <div>
            <p className="label-field">Type</p>
            <div className="chip-row flex-wrap">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, account_type: t.value }))}
                  className={`${chipBase} ${
                    values.account_type === t.value
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-slate-50 text-slate-700 ring-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-field">Bank (optional)</p>
            <div className="chip-row flex-wrap">
              <button
                type="button"
                onClick={() => setValues((v) => ({ ...v, bank: '' }))}
                className={`${chipBase} ${
                  !values.bank
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-slate-50 text-slate-700 ring-slate-200'
                }`}
              >
                None
              </button>
              {BANKS.filter((b) => b.id !== 'other').map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() =>
                    setValues((v) => ({
                      ...v,
                      bank: bank.id,
                      name: v.name.trim() ? v.name : bank.defaultName,
                    }))
                  }
                  className={`${chipBase} ${
                    values.bank === bank.id
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-slate-50 text-slate-700 ring-slate-200'
                  }`}
                >
                  <BankIcon bank={bank.id} className="h-5 w-5" />
                  {bank.label}
                </button>
              ))}
            </div>
            {values.bank && getBankPreset(values.bank)?.defaultName && (
              <p className="mt-1 text-xs text-slate-500">
                Suggested name: {getBankPreset(values.bank).defaultName}
              </p>
            )}
          </div>

          {!isEdit && (
            <>
              <div>
                <p className="label-field">Currency</p>
                <div className="chip-row">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, currency: c.code }))}
                      className={`${chipBase} chip-row-item ${
                        values.currency === c.code
                          ? 'bg-brand-600 text-white ring-brand-600'
                          : 'bg-slate-50 text-slate-700 ring-slate-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="opening-balance" className="label-field">Opening balance</label>
                <div className="currency-amount-field">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                    {CURRENCIES.find((c) => c.code === values.currency)?.symbol}
                  </span>
                  <input
                    id="opening-balance"
                    inputMode="decimal"
                    value={values.opening_balance}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, opening_balance: parseAmountInput(e.target.value) }))
                    }
                    onBlur={() =>
                      setValues((v) => ({
                        ...v,
                        opening_balance: formatAmountInput(v.opening_balance, v.currency),
                      }))
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-base focus:outline-none focus:ring-0"
                    placeholder="0"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <p className="label-field">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={p.label}
                  onClick={() => setValues((v) => ({ ...v, color: p.id }))}
                  className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${p.swatch} ${
                    values.color === p.id ? 'ring-brand-600' : 'ring-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add account'}
          </button>
          </div>
        </form>
      </div>
    </ModalShell>
  )
}
