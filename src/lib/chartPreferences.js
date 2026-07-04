const STORAGE_KEY = 'savings-lite-chart-preferences'

export const DEFAULT_CHART_PREFERENCES = {
  sortBy: 'amount',
}

export function loadChartPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CHART_PREFERENCES }

    const parsed = JSON.parse(raw)
    return {
      sortBy: parsed.sortBy === 'name' ? 'name' : 'amount',
    }
  } catch {
    return { ...DEFAULT_CHART_PREFERENCES }
  }
}

export function saveChartPreferences(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}
