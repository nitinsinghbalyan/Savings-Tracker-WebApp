import { getColorPalette } from '../lib/constants'
import { SELECT_CHIP_BASE, SELECT_CHIP_IDLE } from '../lib/chipStyles'
import CategoryIcon from './CategoryIcon'

/** Selectable category chip: icon + name, 44px tall, palette ring when selected. */
export default function CategoryChip({ category, label, selected, onSelect }) {
  const palette = getColorPalette(category.color)
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      aria-pressed={selected}
      className={`${SELECT_CHIP_BASE} ${selected ? `${palette.chip} ring-2` : SELECT_CHIP_IDLE}`}
    >
      <CategoryIcon category={category} />
      <span className="min-w-0 truncate">{label ?? category.name}</span>
    </button>
  )
}
