import { Check } from 'lucide-react'
import { getColorPalette } from '../lib/constants'
import { SELECT_CHIP_BASE } from '../lib/chipStyles'
import CategoryIcon from './CategoryIcon'

/**
 * Selectable category chip: icon + name, 44px tall, always in the category's
 * own pastel. Selected goes a shade deeper with a coloured ring and a ✓ in
 * place of the icon, so the state never rests on colour alone.
 */
export default function CategoryChip({ category, label, selected, onSelect }) {
  const palette = getColorPalette(category.color)
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={selected}
      className={`${SELECT_CHIP_BASE} ${selected ? `${palette.pastelOn} font-semibold` : palette.pastel}`}
    >
      {selected ? (
        <Check className="h-4 w-4 shrink-0" strokeWidth={2.75} aria-hidden="true" />
      ) : (
        <CategoryIcon category={category} />
      )}
      <span className="min-w-0 truncate">{label ?? category.name}</span>
    </button>
  )
}
