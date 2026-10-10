import { CATEGORY_ICONS } from '../lib/categoryIcons'

/** Grid of curated category icons. 44px cells; the label is the accessible name. */
export default function IconPicker({ value, onChange, className = '' }) {
  return (
    <div
      role="radiogroup"
      aria-label="Icon"
      className={`grid grid-cols-6 gap-1.5 sm:grid-cols-8 ${className}`}
    >
      {CATEGORY_ICONS.map(({ id, Icon, label }) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={`flex h-11 items-center justify-center rounded-xl ring-1 ring-inset transition active:scale-95 ${
              selected
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
