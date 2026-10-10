// Local display preferences — theme and the Overview comparison period.
// Deliberately localStorage, not `user_profiles`: the profile loads async after
// auth, so a database-backed theme would paint the wrong one first. Same shape
// as chartPreferences.js, which is the established pattern here.
const STORAGE_KEY = 'savings-lite-display-preferences'

export const THEMES = ['light', 'dark', 'auto']
export const COMPARE_PERIODS = ['month', 'year']

export const DEFAULT_DISPLAY_PREFERENCES = {
  theme: 'auto',
  comparePeriod: 'month',
}

export function loadDisplayPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DISPLAY_PREFERENCES }

    const parsed = JSON.parse(raw)
    return {
      theme: THEMES.includes(parsed?.theme)
        ? parsed.theme
        : DEFAULT_DISPLAY_PREFERENCES.theme,
      comparePeriod: COMPARE_PERIODS.includes(parsed?.comparePeriod)
        ? parsed.comparePeriod
        : DEFAULT_DISPLAY_PREFERENCES.comparePeriod,
    }
  } catch {
    // Private mode, disabled storage, or corrupt JSON — defaults are always safe.
    return { ...DEFAULT_DISPLAY_PREFERENCES }
  }
}

const CHANGE_EVENT = 'savings-lite:display-preferences'

export function saveDisplayPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* storage unavailable — preference simply does not persist */
  }
  // Every useTheme() keeps its own state, and PersistentTabs keeps Settings and
  // Summary mounted side by side — without this, changing Compare with or the
  // theme in Settings left Summary on the old value until a reload.
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: prefs }))
  } catch {
    /* no window (SSR checks) */
  }
}

/**
 * Subscribe to preference changes from any hook instance in this tab (custom
 * event) or another tab (storage event). Returns an unsubscribe function.
 */
export function subscribeDisplayPreferences(onChange) {
  if (typeof window === 'undefined') return () => {}
  const handleLocal = (event) => onChange(event.detail ?? loadDisplayPreferences())
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) onChange(loadDisplayPreferences())
  }
  window.addEventListener(CHANGE_EVENT, handleLocal)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, handleLocal)
    window.removeEventListener('storage', handleStorage)
  }
}

// Goals list sort — its own key so a bad value can never reset the theme.
const GOAL_SORT_KEY = 'savings-lite-goal-sort'
const GOAL_SORT_VALUES = ['deadline', 'progress', 'priority', 'name']

export function loadGoalSort() {
  try {
    const value = localStorage.getItem(GOAL_SORT_KEY)
    return GOAL_SORT_VALUES.includes(value) ? value : 'deadline'
  } catch {
    return 'deadline'
  }
}

export function saveGoalSort(value) {
  try {
    localStorage.setItem(GOAL_SORT_KEY, value)
  } catch {
    /* storage unavailable — sort simply does not persist */
  }
}
