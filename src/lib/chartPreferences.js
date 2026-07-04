const STORAGE_KEY = 'savings-lite-chart-preferences'

export const CHART_SIZE_MIN = 200
export const CHART_SIZE_MAX = 560
export const CHART_SIZE_DEFAULT = 380

export const DEFAULT_CHART_PREFERENCES = {
  style: 'pie',
  showLegend: true,
  sortBy: 'amount',
  size: CHART_SIZE_DEFAULT,
}

function clampSize(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return CHART_SIZE_DEFAULT
  return Math.min(CHART_SIZE_MAX, Math.max(CHART_SIZE_MIN, Math.round(n)))
}

export function loadChartPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CHART_PREFERENCES }

    const parsed = JSON.parse(raw)
    return {
      style: parsed.style === 'donut' ? 'donut' : 'pie',
      showLegend: parsed.showLegend !== false,
      sortBy: parsed.sortBy === 'name' ? 'name' : 'amount',
      size: clampSize(parsed.size ?? CHART_SIZE_DEFAULT),
    }
  } catch {
    return { ...DEFAULT_CHART_PREFERENCES }
  }
}

export function saveChartPreferences(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}
