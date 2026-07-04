import { NavLink } from 'react-router-dom'
import { Target, BarChart3, Settings } from 'lucide-react'
import { useShellChrome } from '../hooks/useShellChrome'
import RupeeIcon from './icons/RupeeIcon'

const tabs = [
  { to: '/summary', label: 'Summary', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/transactions', label: 'Activity', icon: RupeeIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const { bottomNavHidden } = useShellChrome()

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur transition-transform duration-200 ease-out supports-[backdrop-filter]:bg-white/90 lg:hidden ${
        bottomNavHidden ? 'pointer-events-none translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
      aria-hidden={bottomNavHidden}
    >      <div className="mx-auto grid max-w-app grid-cols-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition ${
                isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
