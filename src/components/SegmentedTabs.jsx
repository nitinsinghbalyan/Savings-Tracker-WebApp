import { NavLink } from 'react-router-dom'

// Mobile navigation from artboard 1e of the Savings Tracker Redesign:
// a top segmented control on the paper track, replacing the bottom tab bar.
const tabs = [
  { to: '/summary', label: 'Month' },
  { to: '/goals', label: 'Goals' },
  { to: '/transactions', label: 'Ledger' },
  { to: '/settings', label: 'More' },
]

export default function SegmentedTabs() {
  return (
    <nav
      className="mt-3.5 flex gap-1 rounded-lg bg-paper-line p-[3px] lg:hidden"
      aria-label="Main navigation"
    >
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 rounded-md py-[7px] text-center text-xs transition ${
              isActive
                ? 'bg-paper-card font-medium text-ink shadow-[0_1px_2px_rgba(22,19,15,.07)]'
                : 'font-normal text-ink-soft'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
