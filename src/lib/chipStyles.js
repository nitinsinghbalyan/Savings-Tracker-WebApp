// Shared chip classes for the Log sheet and recurring form.
// 44px minimum height everywhere (decisions.md 2026-06-14: chip UI with
// mobile-friendly 44px targets). The old category chip was ~28px tall.
export const SELECT_CHIP_BASE =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 ring-inset transition active:scale-95'

export const SELECT_CHIP_IDLE = 'bg-slate-50 text-slate-700 ring-slate-200'
export const SELECT_CHIP_ON = 'bg-brand-600 text-white ring-brand-600'
