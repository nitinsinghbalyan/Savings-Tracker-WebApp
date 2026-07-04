import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import SummaryPage from '../pages/SummaryPage'
import SettingsRoutes from '../pages/SettingsRoutes'

const TABS = [
  { path: '/goals', Component: HomePage },
  { path: '/summary', Component: SummaryPage },
  { path: '/settings', Component: SettingsRoutes },
]

const TAB_PATHS = TABS.map((tab) => tab.path)

function normalizeTabPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/settings' || path.startsWith('/settings/')) return '/settings'
  if (path === '/transactions') return '/goals'
  return TAB_PATHS.includes(path) ? path : '/goals'
}

export default function PersistentTabs() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const activePath = normalizeTabPath(pathname)

  useEffect(() => {
    const normalized = pathname.replace(/\/+$/, '') || '/'
    if (normalized === '/transactions') {
      navigate(`/goals${search}`, { replace: true })
      return
    }
    if (!TAB_PATHS.includes(normalized) && !normalized.startsWith('/settings/')) {
      navigate('/goals', { replace: true })
    }
  }, [pathname, search, navigate])

  return (
    <div className="relative">
      {TABS.map(({ path, Component }) => {
        const active = activePath === path
        return (
          <div
            key={path}
            className={
              active
                ? 'relative z-0 w-full'
                : 'pointer-events-none invisible absolute inset-0 -z-10 w-full overflow-y-auto opacity-0'
            }
            inert={!active || undefined}
            aria-hidden={!active}
          >
            <Component isTabActive={active} />
          </div>
        )
      })}
    </div>
  )
}
