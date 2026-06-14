import { useEffect, useId, useRef, useState } from 'react'
import { addDays, format, isAfter, parseISO, startOfDay } from 'date-fns'
import { Calendar, X } from 'lucide-react'
import {
  CATEGORIES,
  COLOR_PALETTES,
  CURRENCIES,
  DEFAULT_CATEGORY,
  OTHER_CATEGORY,
  PRIORITIES,
  isPresetCategory,
} from '../lib/constants'
import {
  formatAmountInput,
  getAmountScaleLabel,
  parseAmountInput,
} from '../lib/format'

const chipBase =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition active:scale-95'

function emptyForm() {
  return {
    name: '',
    targetAmount: '',
    endDate: '',
    priority: 'medium',
    category: DEFAULT_CATEGORY,
    currency: 'INR',
    color: 'indigo',
  }
}

function goalToForm(goal) {
  return {
    name: goal.name ?? '',
    targetAmount: String(goal.target_amount ?? ''),
    endDate: goal.end_date ?? '',
    priority: goal.priority ?? 'medium',
    category: goal.category || DEFAULT_CATEGORY,
    currency: goal.currency ?? 'INR',
    color: goal.color ?? 'indigo',
  }
}

function validateForm(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required'
  }

  const target = Number(values.targetAmount)
  if (!values.targetAmount || Number.isNaN(target) || target <= 0) {
    errors.targetAmount = 'Target must be greater than 0'
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required'
  } else {
    const end = parseISO(values.endDate)
    if (!isAfter(end, startOfDay(new Date()))) {
      errors.endDate = 'End date must be in the future'
    }
  }

  return errors
}

function Chip({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${chipBase} ${
        selected
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

function PriorityChip({ priority, selected, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${chipBase} ${selected ? priority.selected : priority.idle} ${className}`}
    >
      {priority.label}
    </button>
  )
}

function DatePickerField({ id, value, onChange, error, minDate }) {
  const inputRef = useRef(null)
  const displayValue = value
    ? format(parseISO(value), 'EEE, d MMM yyyy')
    : null

  const openPicker = () => {
    const input = inputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPicker}
        aria-labelledby={`${id}-label`}
        className={`date-picker-trigger w-full ${error ? 'border-red-300 ring-red-100' : ''}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Calendar className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span
            className={`block truncate text-base ${displayValue ? 'font-medium text-slate-900' : 'text-slate-400'}`}
          >
            {displayValue ?? 'Pick an end date'}
          </span>
          {displayValue && (
            <span className="mt-0.5 block text-xs text-slate-500">Tap to change</span>
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        min={minDate}
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

function CurrencyAmountField({ id, amount, currency, onAmountChange, onCurrencyChange, error }) {
  const scaleLabel = getAmountScaleLabel(amount, currency)
  const displayValue = formatAmountInput(amount, currency)

  const handleAmountChange = (event) => {
    const parsed = parseAmountInput(event.target.value)
    onAmountChange({ target: { value: parsed } })
  }

  return (
    <div>
      <div
        className={`currency-amount-field ${error ? 'border-red-300 ring-2 ring-red-100' : 'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'}`}
      >
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleAmountChange}
          placeholder="0"
          className="min-h-11 flex-1 border-0 bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        <div
          className="flex shrink-0 border-l border-slate-200 bg-slate-50 p-1"
          role="group"
          aria-label="Currency"
        >
          {CURRENCIES.map(({ code, symbol }) => {
            const selected = currency === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => onCurrencyChange(code)}
                aria-label={code}
                aria-pressed={selected}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold transition ${
                  selected
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:bg-white/80 hover:text-slate-600'
                }`}
              >
                {symbol}
              </button>
            )
          })}
        </div>
      </div>
      {scaleLabel && (
        <p className="mt-1.5 text-sm font-medium text-brand-600" aria-live="polite">
          {scaleLabel}
        </p>
      )}
    </div>
  )
}

export default function GoalForm({
  open,
  onClose,
  goal = null,
  createGoal,
  updateGoal,
  onError,
}) {
  const titleId = useId()
  const isEdit = Boolean(goal)
  const [values, setValues] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional modal reset
    setValues(goal ? goalToForm(goal) : emptyForm())
    setFieldErrors({})
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

  if (!open) return null

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(null)
  }

  const setChipField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = validateForm(values)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    const payload = {
      name: values.name.trim(),
      target_amount: Number(values.targetAmount),
      end_date: values.endDate,
      priority: values.priority,
      category: values.category.trim() || DEFAULT_CATEGORY,
      currency: values.currency,
      color: values.color,
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      if (isEdit) {
        await updateGoal(goal.id, payload)
      } else {
        await createGoal(payload)
      }
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

  const minEndDate = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd')
  const endDateLabelId = 'goal-end-date-label'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close form"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
        disabled={submitting}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-center border-b border-slate-100 px-4 pb-3 pt-3 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" aria-hidden="true" />
        </div>

        <div className="relative flex shrink-0 items-center justify-center border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 id={titleId} className="text-center text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit goal' : 'New goal'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="btn-icon absolute right-4 sm:right-6"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
            {submitError && (
              <p role="alert" className="alert-error">
                {submitError}
              </p>
            )}

            <div>
              <label htmlFor="goal-name" className="label-field">
                Name
              </label>
              <input
                id="goal-name"
                type="text"
                value={values.name}
                onChange={setField('name')}
                placeholder="e.g. Emergency fund"
                className="input-field"
                autoComplete="off"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="goal-target" className="label-field">
                Target amount
              </label>
              <CurrencyAmountField
                id="goal-target"
                amount={values.targetAmount}
                currency={values.currency}
                onAmountChange={setField('targetAmount')}
                onCurrencyChange={(code) => setChipField('currency', code)}
                error={fieldErrors.targetAmount}
              />
              {fieldErrors.targetAmount && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.targetAmount}</p>
              )}
            </div>

            <div>
              <label id={endDateLabelId} htmlFor="goal-end-date" className="label-field">
                End date
              </label>
              <DatePickerField
                id="goal-end-date"
                value={values.endDate}
                onChange={setField('endDate')}
                error={fieldErrors.endDate}
                minDate={minEndDate}
              />
              {fieldErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.endDate}</p>
              )}
            </div>

            <div>
              <p className="label-field">Priority</p>
              <div className="chip-row">
                {PRIORITIES.map((priority) => (
                  <PriorityChip
                    key={priority.value}
                    priority={priority}
                    selected={values.priority === priority.value}
                    onClick={() => setChipField('priority', priority.value)}
                    className="chip-row-item"
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="label-field">Color</p>
              <div className="chip-row justify-between gap-2">
                {COLOR_PALETTES.map((palette) => {
                  const selected = values.color === palette.id
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setChipField('color', palette.id)}
                      aria-label={palette.label}
                      aria-pressed={selected}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95 sm:h-11 sm:w-11 ${
                        selected
                          ? 'ring-2 ring-offset-2 ring-slate-900'
                          : 'ring-1 ring-slate-200 hover:ring-slate-300'
                      }`}
                    >
                      <span
                        className={`h-6 w-6 rounded-full sm:h-7 sm:w-7 ${palette.swatch}`}
                        aria-hidden="true"
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="label-field">Category</p>
              <div className="chip-row">
                {CATEGORIES.map((category) => (
                  <Chip
                    key={category}
                    selected={
                      category === OTHER_CATEGORY
                        ? !isPresetCategory(values.category)
                        : values.category === category
                    }
                    onClick={() => {
                      if (category === OTHER_CATEGORY) {
                        if (!isPresetCategory(values.category)) return
                        setChipField('category', '')
                      } else if (values.category !== category) {
                        setChipField('category', category)
                      } else if (category !== DEFAULT_CATEGORY) {
                        setChipField('category', DEFAULT_CATEGORY)
                      }
                    }}
                    className="chip-row-item"
                  >
                    {category}
                  </Chip>
                ))}
              </div>
              {!isPresetCategory(values.category) && (
                <input
                  type="text"
                  value={values.category}
                  onChange={setField('category')}
                  placeholder="Enter category name"
                  className="input-field mt-2"
                  autoComplete="off"
                />
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 safe-bottom sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:flex-1">
                {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create goal'}
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
          </div>
        </form>
      </div>
    </div>
  )
}
