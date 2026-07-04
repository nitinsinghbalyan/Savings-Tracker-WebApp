import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { buildCategoryTree } from '../lib/categories'
import { COLOR_PALETTES, getColorPalette } from '../lib/constants'

const chipBase =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition'

export default function CategoryTreeManager({
  kind,
  categories,
  onAdd,
  onDelete,
  onError,
}) {
  const [parentName, setParentName] = useState('')
  const [parentColor, setParentColor] = useState('indigo')
  const [isSavings, setIsSavings] = useState(false)
  const [subName, setSubName] = useState('')
  const [subColor, setSubColor] = useState('indigo')
  const [subParentId, setSubParentId] = useState('')
  const [adding, setAdding] = useState(false)

  const tree = useMemo(() => buildCategoryTree(categories, kind), [categories, kind])
  const parents = useMemo(
    () => tree.map((t) => t.parent),
    [tree],
  )

  const handleAddParent = async () => {
    if (!parentName.trim()) {
      onError?.('Category name is required')
      return
    }
    setAdding(true)
    try {
      await onAdd({
        name: parentName.trim(),
        kind,
        color: parentColor,
        is_savings: kind === 'expense' && isSavings,
      })
      setParentName('')
      setParentColor('indigo')
      setIsSavings(false)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setAdding(false)
    }
  }

  const handleAddSub = async () => {
    if (!subParentId) {
      onError?.('Select a parent category')
      return
    }
    if (!subName.trim()) {
      onError?.('Sub-category name is required')
      return
    }
    setAdding(true)
    try {
      await onAdd({
        name: subName.trim(),
        kind,
        color: subColor,
        parent_id: subParentId,
      })
      setSubName('')
      setSubColor('indigo')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to add sub-category')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? Sub-categories will also be removed.`)) return
    try {
      await onDelete(id)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      {tree.length === 0 ? (
        <p className="text-sm text-slate-500">No categories yet. Add a parent category below.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tree.map(({ parent, children }) => {
            const palette = getColorPalette(parent.color)
            return (
              <li
                key={parent.id}
                className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
              >
                <span className={`${chipBase} ${palette.chip}`}>
                  <span className="truncate">{parent.name}</span>
                  {parent.is_savings && (
                    <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                      Savings
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(parent.id, parent.name)}
                    aria-label={`Delete ${parent.name}`}
                    className="-mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current/70 hover:bg-black/5 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
                {children.map((child) => {
                  const childPalette = getColorPalette(child.color)
                  return (
                    <span key={child.id} className={`${chipBase} ${childPalette.chip}`}>
                      <span className="truncate">{child.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(child.id, child.name)}
                        aria-label={`Delete ${child.name}`}
                        className="-mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-current/70 hover:bg-black/5 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )
                })}
              </li>
            )
          })}
        </ul>
      )}

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Add parent category
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Category name"
              className="input-field min-h-10 min-w-[8rem] flex-1 py-2 text-sm"
            />
            <div className="flex gap-1">
              {COLOR_PALETTES.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={p.label}
                  onClick={() => setParentColor(p.id)}
                  className={`h-7 w-7 rounded-full ${p.swatch} ring-2 ring-offset-1 ${
                    parentColor === p.id ? 'ring-brand-600' : 'ring-transparent'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddParent}
              disabled={adding}
              className="btn-secondary min-h-10 px-3"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          {kind === 'expense' && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isSavings}
                onChange={(e) => setIsSavings(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600"
              />
              Savings category
            </label>
          )}
        </div>

        {parents.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Add sub-category
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={subParentId}
                onChange={(e) => setSubParentId(e.target.value)}
                className="input-field min-h-10 text-sm"
                aria-label="Parent category"
              >
                <option value="">Parent category</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Sub-category name"
                className="input-field min-h-10 min-w-[8rem] flex-1 py-2 text-sm"
              />
              <div className="flex gap-1">
                {COLOR_PALETTES.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={p.label}
                    onClick={() => setSubColor(p.id)}
                    className={`h-7 w-7 rounded-full ${p.swatch} ring-2 ring-offset-1 ${
                      subColor === p.id ? 'ring-brand-600' : 'ring-transparent'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddSub}
                disabled={adding}
                className="btn-secondary min-h-10 px-3"
              >
                <Plus className="h-4 w-4" />
                Add sub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CategoriesPageHeader({ title = 'Categories' }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
      <Link
        to="/settings"
        className="btn-icon -ml-1"
        aria-label="Back to settings"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </div>
  )
}
