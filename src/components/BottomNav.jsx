import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Landmark, Plus } from 'lucide-react'
import { useShellChrome } from '../hooks/useShellChrome'
import RupeeIcon from './icons/RupeeIcon'

// Mobile quick-access bar: the three most-visited screens plus Add. Full
// navigation still lives in the top SegmentedTabs, so this deliberately does
// not carry every destination.
//
// The 4.5rem content height is a contract — `.app-main` reserves exactly that
// much bottom padding and `InstallPrompt` offsets by it. Changing the height
// here silently mispositions both.
const tabs = [
  { to: '/summary', label: 'Month', icon: BarChart3 },
  { to: '/worth', label: 'Worth', icon: Landmark },
  { to: '/transactions', label: 'Ledger', icon: RupeeIcon },
]

export default function BottomNav() {
  const { bottomNavHidden } = useShellChrome()
  const navigate = useNavigate()

  // TransactionsPage opens its Add form when it sees ?new=1, then strips the
  // param. Going through the URL avoids wiring cross-tab state through context.
  const openAddTransaction = () => navigate('/transactions?new=1')

  const item = (to, label, Icon) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `flex h-full min-h-11 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition ${
          isActive ? 'text-accent' : 'text-ink-faint hover:text-ink-muted'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-rule bg-paper-card transition-transform duration-200 ease-out lg:hidden ${
        bottomNavHidden ? 'pointer-events-none translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      aria-label="Quick navigation"
      aria-hidden={bottomNavHidden}
    >
      <div className="mx-auto grid h-[4.5rem] max-w-app grid-cols-4">
        {item(tabs[0].to, tabs[0].label, tabs[0].icon)}
        {item(tabs[1].to, tabs[1].label, tabs[1].icon)}

        <div className="flex h-full items-center justify-center">
          <button
            type="button"
            onClick={openAddTransaction}
            aria-label="Add transaction"
            className="-mt-4 flex h-12 w-12 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full bg-accent text-white shadow-fab transition hover:bg-accent-hover active:scale-95"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {item(tabs[2].to, tabs[2].label, tabs[2].icon)}
      </div>
    </nav>
  )
}
