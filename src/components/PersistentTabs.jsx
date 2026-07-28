import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SummaryPage = lazy(() => import('../pages/SummaryPage'))
const HomePage = lazy(() => import('../pages/HomePage'))
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'))
const SettingsRoutes = lazy(() => import('../pages/SettingsRoutes'))

const TABS = [
  { path: '/summary', Component: SummaryPage },
  { path: '/goals', Component: HomePage },
  { path: '/transactions', Component: TransactionsPage },
  { path: '/settings', Component: SettingsRoutes },
]

const TAB_PATHS = TABS.map((tab) => tab.path)

function normalizeTabPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/settings' || path.startsWith('/settings/')) return '/settings'
  return TAB_PATHS.includes(path) ? path : '/summary'
}

function TabFallback() {
  return (
    <div className="page-container space-y-4 py-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="card h-64 animate-pulse" />
    </div>
  )
}

export default function PersistentTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activePath = normalizeTabPath(pathname)
  const [mountedTabs, setMountedTabs] = useState(() => new Set([activePath]))

  useEffect(() => {
    const normalized = pathname.replace(/\/+$/, '') || '/'
    if (!TAB_PATHS.includes(normalized) && !normalized.startsWith('/settings/')) {
      navigate('/summary', { replace: true })
    }
  }, [pathname, navigate])

  useEffect(() => {
    setMountedTabs((prev) => {
      if (prev.has(activePath)) return prev
      const next = new Set(prev)
      next.add(activePath)
      return next
    })
  }, [activePath])

  // Warm likely next tab chunks during idle time (improves tab-switch INP/TTI)
  useEffect(() => {
    const prefetchers = {
      '/summary': () => import('../pages/SummaryPage'),
      '/goals': () => import('../pages/HomePage'),
      '/transactions': () => import('../pages/TransactionsPage'),
      '/settings': () => import('../pages/SettingsRoutes'),
    }
    const order = ['/summary', '/goals', '/transactions', '/settings'].filter(
      (path) => path !== activePath,
    )

    let cancelled = false
    const run = () => {
      if (cancelled) return
      const path = order.shift()
      if (!path) return
      prefetchers[path]?.().catch(() => {})
      if (order.length) schedule()
    }
    const schedule = () => {
      if (typeof requestIdleCallback === 'function') {
        idleId = requestIdleCallback(run, { timeout: 2500 })
      } else {
        idleId = window.setTimeout(run, 400)
      }
    }
    let idleId
    schedule()
    return () => {
      cancelled = true
      if (typeof cancelIdleCallback === 'function' && typeof idleId === 'number') {
        cancelIdleCallback(idleId)
      } else {
        clearTimeout(idleId)
      }
    }
  }, [activePath])

  return (
    <div className="relative">
      {TABS.map(({ path, Component }) => {
        if (!mountedTabs.has(path)) return null
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
            <Suspense fallback={active ? <TabFallback /> : null}>
              <Component isTabActive={active} />
            </Suspense>
          </div>
        )
      })}
    </div>
  )
}
