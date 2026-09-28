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

// Chart/category colours.
//
// The `id`s are persisted (accounts.color has a CHECK constraint on exactly
// these six) so they never change — only the hex values do.
//
// `fill` / `fillDark` were chosen by running the dataviz palette validator,
// not by eye. Light passes all-pairs; the worst pair is deutan ΔE 6.9, which
// is inside the 6–8 band that is legal ONLY WITH SECONDARY ENCODING.
//
// An exhaustive search proved NO six- or even five-colour set passes all-pairs
// on a dark surface. Dark is therefore tuned to the best achievable floor
// (worst normal-vision pair emerald↔cyan ΔE 11.9, worst CVD violet↔indigo 4.1)
// while keeping the lightness band and 3:1 contrast — a more separated cyan
// scored 13.0 but fell out of the band, which is not a good trade. So colour must never be the only thing distinguishing two
// categories: every chart carries a direct label. Do not "tidy away" those
// labels — they are the thing making this palette legal.
//
// The previous values had violet ↔ indigo at ΔE 6.3 for NORMAL vision (floor
// is 15) — near-identical for everyone — and emerald ↔ rose at 5.6 for deutan.
export const COLOR_PALETTES = [
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    fill: '#2a78d6',
    fillDark: '#3987e5',
    border: 'border-l-indigo-500',
    chip: 'ring-indigo-500 bg-indigo-50 text-indigo-700',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: 'bg-rose-500',
    bar: 'bg-rose-500',
    fill: '#e34948',
    fillDark: '#e66767',
    border: 'border-l-rose-500',
    chip: 'ring-rose-500 bg-rose-50 text-rose-700',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    fill: '#008300',
    fillDark: '#008300',
    border: 'border-l-emerald-500',
    chip: 'ring-emerald-500 bg-emerald-50 text-emerald-700',
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: 'bg-amber-500',
    bar: 'bg-amber-500',
    fill: '#eda100',
    fillDark: '#c98500',
    border: 'border-l-amber-500',
    chip: 'ring-amber-500 bg-amber-50 text-amber-700',
  },
  {
    id: 'violet',
    label: 'Violet',
    swatch: 'bg-violet-500',
    bar: 'bg-violet-500',
    fill: '#4a3aa7',
    fillDark: '#8b5cf6',
    border: 'border-l-violet-500',
    chip: 'ring-violet-500 bg-violet-50 text-violet-700',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    swatch: 'bg-cyan-500',
    bar: 'bg-cyan-500',
    fill: '#1baf7a',
    fillDark: '#199e70',
    border: 'border-l-cyan-500',
    chip: 'ring-cyan-500 bg-cyan-50 text-cyan-700',
  },
]

/**
 * Reserved status colour for "over budget". Previously #f43f5e — identical to
 * the old rose fill, so an over-budget rose category looked exactly like an
 * on-budget one. Status colours ship with an icon, never colour alone.
 */
export const OVER_BUDGET_COLOR = '#d03b3b'

/** Sequential ramp for the heatmap: one hue, light → dark. Magnitude only. */
export const HEATMAP_RAMP_LIGHT = ['#f0f4fb', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']
export const HEATMAP_RAMP_DARK = ['#1d2430', '#1c3557', '#18477c', '#1c5cab', '#2a78d6', '#5598e7', '#86b6ef']

export function getColorPalette(colorId) {
  return COLOR_PALETTES.find((p) => p.id === colorId) ?? COLOR_PALETTES[0]
}

export function getCurrencySymbol(currencyCode) {
  return CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? '₹'
}

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
]

export const TRANSACTION_TYPES = ['expense', 'income', 'transfer']

export const BANKS = [
  { id: 'icici', label: 'ICICI Bank', defaultName: 'ICICI Savings' },
  { id: 'sbi', label: 'SBI', defaultName: 'SBI Savings' },
  { id: 'hdfc', label: 'HDFC Bank', defaultName: 'HDFC Savings' },
  { id: 'axis', label: 'Axis Bank', defaultName: 'Axis Savings' },
  { id: 'other', label: 'Other bank', defaultName: '' },
]

export function getBankPreset(bankId) {
  return BANKS.find((b) => b.id === bankId) ?? null
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food', color: 'amber' },
  { name: 'Transport', color: 'cyan' },
  { name: 'Rent', color: 'indigo' },
  { name: 'Utilities', color: 'violet' },
  { name: 'Shopping', color: 'rose' },
  { name: 'Health', color: 'emerald' },
  { name: 'Entertainment', color: 'rose' },
  { name: 'Other', color: 'indigo' },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', color: 'emerald' },
  { name: 'Freelance', color: 'indigo' },
  { name: 'Investment', color: 'violet' },
  { name: 'Other', color: 'amber' },
]

export function getAccountTypeLabel(type) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type
}
