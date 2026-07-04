import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { dedupeCategoriesForDisplay } from '../lib/categories'
import { CURRENCIES, getColorPalette } from '../lib/constants'
import { parseAmountInput } from '../lib/format'

export default function BudgetManager({ categories, onSave, onError, currency = 'INR' }) {
  const expenseCategories = useMemo(
    () =>
      dedupeCategoriesForDisplay(categories).filter(
        (c) => c.kind === 'expense' && !c.is_savings,
      ),
    [categories],
  )

  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹'

  const storedValue = (cat) => (cat.monthly_budget ? String(cat.monthly_budget) : '')
  const currentValue = (cat) => (drafts[cat.id] !== undefined ? drafts[cat.id] : storedValue(cat))
  const isDirty = (cat) => drafts[cat.id] !== undefined && drafts[cat.id] !== storedValue(cat)

  const handleChange = (cat, raw) => {
    setDrafts((prev) => ({ ...prev, [cat.id]: parseAmountInput(raw) }))
  }

  const handleSave = async (cat) => {
    const amount = Math.max(0, Number(parseAmountInput(currentValue(cat))) || 0)
    setSavingId(cat.id)
    try {
      await onSave(cat.id, { monthly_budget: amount })
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[cat.id]
        return next
      })
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to save budget')
    } finally {
      setSavingId(null)
    }
  }

  if (expenseCategories.length === 0) {
    return (
      <p className="px-4 py-4 text-sm text-slate-500">
        Add an expense category first to set a budget.
      </p>
    )
  }

  return (
    <div className="space-y-1 px-4 py-3">
      <p className="pb-2 text-xs text-slate-500">
        Set a monthly cap per category. Leave at 0 for no budget.
      </p>
      {expenseCategories.map((cat) => {
        const palette = getColorPalette(cat.color)
        const dirty = isDirty(cat)
        return (
          <div key={cat.id} className="flex items-center gap-3 py-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${palette.swatch}`} />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{cat.name}</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-brand-500">
              <span className="text-sm text-slate-400">{symbol}</span>
              <input
                value={currentValue(cat)}
                onChange={(e) => handleChange(cat, e.target.value)}
                inputMode="decimal"
                placeholder="0"
                aria-label={`Monthly budget for ${cat.name}`}
                className="w-20 bg-transparent text-right text-sm text-slate-900 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSave(cat)}
              disabled={!dirty || savingId === cat.id}
              aria-label={`Save budget for ${cat.name}`}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition ${
                dirty
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-slate-50 text-slate-300 ring-slate-200'
              } disabled:cursor-not-allowed`}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
