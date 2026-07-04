import { NavLink } from 'react-router-dom'
import { Target, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import RupeeIcon from './icons/RupeeIcon'

const tabs = [
  { to: '/summary', label: 'Summary', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/transactions', label: 'Activity', icon: RupeeIcon },  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function SidebarNav() {
  const { user } = useAuth()

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col border-r border-slate-200 bg-white lg:flex"
      aria-label="Main navigation"
    >
      <div className="border-b border-slate-100 px-5 py-5">
        <p className="text-lg font-bold text-slate-900">Savings Tracker</p>
        <p className="mt-0.5 text-xs text-slate-500">Goals &amp; finances</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {user?.email && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="truncate text-xs text-slate-400">Signed in as</p>
          <p className="truncate text-sm font-medium text-slate-700" title={user.email}>
            {user.email}
          </p>
        </div>
      )}
    </aside>
  )
}
