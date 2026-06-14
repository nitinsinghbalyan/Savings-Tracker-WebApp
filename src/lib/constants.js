export const CURRENCIES = [
  { code: 'INR', label: '₹ INR', symbol: '₹' },
  { code: 'USD', label: '$ USD', symbol: '$' },
]

export const PRIORITIES = [
  {
    value: 'high',
    label: 'High',
    selected: 'bg-rose-600 text-white ring-rose-600',
    idle: 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100',
    badge: 'bg-rose-100 text-rose-700 ring-rose-200',
  },
  {
    value: 'medium',
    label: 'Medium',
    selected: 'bg-amber-500 text-white ring-amber-500',
    idle: 'bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100',
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  {
    value: 'low',
    label: 'Low',
    selected: 'bg-emerald-600 text-white ring-emerald-600',
    idle: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
]

export const DEFAULT_CATEGORY = 'Home'

export const CATEGORY_PRESETS = ['Home', 'Travel', 'Emergency', 'Health']
export const OTHER_CATEGORY = 'Other'
export const CATEGORIES = [...CATEGORY_PRESETS, OTHER_CATEGORY]

export function isPresetCategory(category) {
  return CATEGORY_PRESETS.includes(category)
}

export const COLOR_PALETTES = [
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    border: 'border-l-indigo-500',
    chip: 'ring-indigo-500 bg-indigo-50 text-indigo-700',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: 'bg-rose-500',
    bar: 'bg-rose-500',
    border: 'border-l-rose-500',
    chip: 'ring-rose-500 bg-rose-50 text-rose-700',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    border: 'border-l-emerald-500',
    chip: 'ring-emerald-500 bg-emerald-50 text-emerald-700',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: 'bg-amber-500',
    bar: 'bg-amber-500',
    border: 'border-l-amber-500',
    chip: 'ring-amber-500 bg-amber-50 text-amber-700',
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: 'bg-violet-500',
    bar: 'bg-violet-500',
    border: 'border-l-violet-500',
    chip: 'ring-violet-500 bg-violet-50 text-violet-700',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    swatch: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    border: 'border-l-cyan-500',
    chip: 'ring-cyan-500 bg-cyan-50 text-cyan-700',
  },
]

export function getColorPalette(colorId) {
  return COLOR_PALETTES.find((p) => p.id === colorId) ?? COLOR_PALETTES[0]
}

export function getCurrencySymbol(currencyCode) {
  return CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? '₹'
}
