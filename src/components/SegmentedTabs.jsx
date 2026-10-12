import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// Mobile navigation merged into the title row (session 90). The active tab IS
// the page title — large, in the display face — and the other tabs sit beside
// it in small type, swipeable when they overflow. Replaces the two-row header
// (title above an 11px segmented control) and the Summary/Month,
// Activity/Ledger, Settings/More naming mismatch between the two.
const tabs = [
  { to: '/summary', label: 'Month', activeLabel: 'Month' },
  { to: '/goals', label: 'Goals', activeLabel: 'Goals' },
  { to: '/worth', label: 'Worth', activeLabel: 'Worth' },
  { to: '/transactions', label: 'Ledger', activeLabel: 'Ledger' },
  { to: '/settings', label: 'More', activeLabel: 'Settings' },
]

export default function SegmentedTabs() {
  const { pathname } = useLocation()
  const navRef = useRef(null)
  // Fade the right edge only while there is more strip to scroll to.
  const [fadeEnd, setFadeEnd] = useState(false)

  useEffect(() => {
    const el = navRef.current
    if (!el) return undefined
    const update = () => setFadeEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer?.disconnect()
    }
  }, [])

  // Keep the active (title) tab on screen after navigation.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })
  }, [pathname])

  return (
    <nav
      ref={navRef}
      className="no-scrollbar -ml-1 flex min-w-0 flex-1 items-end gap-3.5 overflow-x-auto pl-1 lg:hidden"
      style={
        fadeEnd
          ? {
              maskImage: 'linear-gradient(to right, #000 calc(100% - 28px), transparent)',
              WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 28px), transparent)',
            }
          : undefined
      }
      aria-label="Main navigation"
    >
      {tabs.map(({ to, label, activeLabel }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-11 shrink-0 items-end whitespace-nowrap pb-2 leading-none transition ${
              isActive
                ? 'font-display text-[21px] font-semibold tracking-[-0.02em] text-ink'
                : 'text-[13px] font-medium text-ink-soft hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (isActive ? activeLabel : label)}
        </NavLink>
      ))}
    </nav>
  )
}
