import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { buildCategoryTree } from '../lib/categories'
import { COLOR_PALETTES, getColorPalette } from '../lib/constants'
import { defaultIconForName, getCategoryIconId } from '../lib/categoryIcons'
import CategoryIcon from './CategoryIcon'
import IconPicker from './IconPicker'
import ModalShell from './ModalShell'

const chipBase =
  'inline-flex min-h-11 items-center rounded-full text-sm font-medium ring-1 ring-inset transition'

function ColorSwatches({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {COLOR_PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={p.label}
          aria-pressed={value === p.id}
          onClick={() => onChange(p.id)}
          className="flex h-11 w-9 items-center justify-center"
        >
          <span
            className={`h-7 w-7 rounded-full ${p.swatch} ring-2 ring-offset-1 ${
              value === p.id ? 'ring-brand-600' : 'ring-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

/** One category chip: tap the name to change its icon, tap × to delete. */
function CategoryTreeChip({ category, onEdit, onDelete, badge }) {
  const palette = getColorPalette(category.color)
  return (
    <span className={`${chipBase} ${palette.chip} max-w-full`}>
      <button
        type="button"
        onClick={() => onEdit(category)}
        aria-label={`Change icon for ${category.name}`}
        className="flex min-h-11 min-w-0 items-center gap-1.5 rounded-l-full pl-3.5 pr-1"
      >
        <CategoryIcon category={category} />
        <span className="truncate">{category.name}</span>
        {badge}
      </button>
      <button
        type="button"
        onClick={() => onDelete(category.id, category.name)}
        aria-label={`Delete ${category.name}`}
        className="flex h-11 w-10 shrink-0 items-center justify-center rounded-r-full text-current/70 hover:bg-black/5 hover:text-rose-600"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </span>
  )
}

/**
 * Icon-only editor. Colour is deliberately not editable here: transactions
 * freeze `category_color` at write time, so recolouring would split one
 * category's history across two colours.
 */
function IconSheet({ title, initialIconId, saveLabel = 'Save icon', onClose, onSave }) {
  const titleId = useId()
  const [iconId, setIconId] = useState(initialIconId)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(iconId)
      onClose()
    } catch {
      // The caller already surfaced the error; keep the sheet open to retry.
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell open onClose={onClose} closeDisabled={saving} hideBottomNav>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel flex max-h-[min(85dvh,640px)] w-full max-w-lg flex-col rounded-t-3xl lg:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 id={titleId} className="flex min-w-0 items-center gap-2 text-lg font-semibold text-slate-900">
            <CategoryIcon iconId={iconId} className="h-5 w-5" />
            <span className="truncate">{title}</span>
          </h2>
          <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div data-modal-scroll className="modal-scroll min-h-0 flex-1 px-4 py-4">
          <IconPicker value={iconId} onChange={setIconId} />
        </div>
        <div className="shrink-0 border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default function CategoryTreeManager({
  kind,
  categories,
  onAdd,
  onUpdate,
  onDelete,
  onError,
}) {
  const [parentName, setParentName] = useState('')
  const [parentColor, setParentColor] = useState('indigo')
  const [parentIcon, setParentIcon] = useState(null)
  const [subIcon, setSubIcon] = useState(null)
  // { kind: 'category', category } | { kind: 'parent' } | { kind: 'sub' } | null
  const [sheet, setSheet] = useState(null)
  const setEditing = (category) => setSheet({ kind: 'category', category })
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
        icon: parentIcon ?? defaultIconForName(parentName, { isSavings }),
        is_savings: kind === 'expense' && isSavings,
      })
      setParentName('')
      setParentColor('indigo')
      setParentIcon(null)
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
        icon: subIcon ?? defaultIconForName(subName),
        parent_id: subParentId,
      })
      setSubName('')
      setSubColor('indigo')
      setSubIcon(null)
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

  const handleSaveIcon = async (id, icon) => {
    if (!onUpdate) return
    try {
      await onUpdate(id, { icon })
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to update icon')
      throw err
    }
  }

  // Until the user picks one, the preview follows the typed name.
  const parentIconPreview = parentIcon ?? defaultIconForName(parentName, { isSavings })
  const subIconPreview = subIcon ?? defaultIconForName(subName)

  return (
    <div className="space-y-6">
      {tree.length > 0 && (
        <p className="text-xs text-slate-500">Tap a category to change its icon.</p>
      )}
      {tree.length === 0 ? (
        <p className="text-sm text-slate-500">No categories yet. Add a parent category below.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tree.map(({ parent, children }) => {
            return (
              <li
                key={parent.id}
                className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
              >
                <CategoryTreeChip
                  category={parent}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  badge={
                    parent.is_savings ? (
                      <span className="rounded-full bg-surface/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        Savings
                      </span>
                    ) : null
                  }
                />
                {children.map((child) => (
                  <CategoryTreeChip
                    key={child.id}
                    category={child}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                  />
                ))}
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
            <button
              type="button"
              onClick={() => setSheet({ kind: 'parent' })}
              aria-label="Choose icon"
              title="Choose icon"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            >
              <CategoryIcon iconId={parentIconPreview} className="h-5 w-5" />
            </button>
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Category name"
              className="input-field min-h-11 min-w-[8rem] flex-1 py-2 text-sm"
            />
            <ColorSwatches value={parentColor} onChange={setParentColor} />
            <button
              type="button"
              onClick={handleAddParent}
              disabled={adding}
              className="btn-secondary min-h-11 px-3"
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
                className="input-field min-h-11 text-sm"
                aria-label="Parent category"
              >
                <option value="">Parent category</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSheet({ kind: 'sub' })}
                aria-label="Choose icon"
                title="Choose icon"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
              >
                <CategoryIcon iconId={subIconPreview} className="h-5 w-5" />
              </button>
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Sub-category name"
                className="input-field min-h-11 min-w-[8rem] flex-1 py-2 text-sm"
              />
              <ColorSwatches value={subColor} onChange={setSubColor} />
              <button
                type="button"
                onClick={handleAddSub}
                disabled={adding}
                className="btn-secondary min-h-11 px-3"
              >
                <Plus className="h-4 w-4" />
                Add sub
              </button>
            </div>
          </div>
        )}
      </div>

      {sheet?.kind === 'category' && (
        <IconSheet
          title={sheet.category.name}
          initialIconId={getCategoryIconId(sheet.category)}
          onClose={() => setSheet(null)}
          onSave={(icon) => handleSaveIcon(sheet.category.id, icon)}
        />
      )}
      {sheet?.kind === 'parent' && (
        <IconSheet
          title={parentName.trim() || 'New category'}
          initialIconId={parentIconPreview}
          saveLabel="Use icon"
          onClose={() => setSheet(null)}
          onSave={setParentIcon}
        />
      )}
      {sheet?.kind === 'sub' && (
        <IconSheet
          title={subName.trim() || 'New sub-category'}
          initialIconId={subIconPreview}
          saveLabel="Use icon"
          onClose={() => setSheet(null)}
          onSave={setSubIcon}
        />
      )}
    </div>
  )
}

export function CategoriesPageHeader({ title = 'Categories' }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-surface px-4 py-3 lg:px-6">
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
