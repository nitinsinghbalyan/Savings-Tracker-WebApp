import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { dedupeCategoriesForDisplay } from '../lib/categories'
import { COLOR_PALETTES, getColorPalette } from '../lib/constants'

export default function CategoryManager({
  kind,
  categories,
  onAdd,
  onArchive,
  onError,
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('indigo')
  const [isSavings, setIsSavings] = useState(false)
  const [adding, setAdding] = useState(false)

  const filtered = useMemo(
    () => dedupeCategoriesForDisplay(categories).filter((c) => c.kind === kind),
    [categories, kind],
  )

  const handleAdd = async () => {
    if (!name.trim()) {
      onError?.('Category name is required')
      return
    }
    setAdding(true)
    try {
      await onAdd({
        name: name.trim(),
        kind,
        color,
        is_savings: kind === 'expense' && isSavings,
      })
      setName('')
      setColor('indigo')
      setIsSavings(false)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setAdding(false)
    }
  }

  const chipBase =
    'inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition'

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="chip-row flex-wrap gap-2.5">
        {filtered.map((cat) => {
          const palette = getColorPalette(cat.color)
          return (
            <span
              key={cat.id}
              className={`${chipBase} ${palette.chip}`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.is_savings && (
                <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Savings
                </span>
              )}
              {!cat.is_system && (
                <button
                  type="button"
                  onClick={() => onArchive(cat.id)}
                  aria-label={`Remove ${cat.name}`}
                  className="-mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current/70 hover:bg-black/5 hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          )
        })}
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category"
            className="input-field min-h-10 min-w-[8rem] flex-1 py-2 text-sm"
          />
          <div className="flex gap-1">
            {COLOR_PALETTES.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={p.label}
                onClick={() => setColor(p.id)}
                className={`h-7 w-7 rounded-full ${p.swatch} ring-2 ring-offset-1 ${
                  color === p.id ? 'ring-brand-600' : 'ring-transparent'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="btn-secondary min-h-10 px-3"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        {kind === 'expense' && (
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input
              type="checkbox"
              checked={isSavings}
              onChange={(e) => setIsSavings(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">
              Savings category
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                Expenses here won&apos;t count toward monthly spending
              </span>
            </span>
          </label>
        )}
      </div>
    </div>
  )
}
