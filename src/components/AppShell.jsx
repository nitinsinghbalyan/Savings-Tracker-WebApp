import { lazy, Suspense } from 'react'
import PersistentTabs from './PersistentTabs'
import SidebarNav from './SidebarNav'
import BottomNav from './BottomNav'
import { ShellChromeProvider } from '../context/ShellChromeContext'

const InstallPrompt = lazy(() => import('./InstallPrompt'))

export default function AppShell() {
  return (
    <ShellChromeProvider>
      <div className="app-shell">
        <SidebarNav />
        <div className="app-main">
          <PersistentTabs />
          <Suspense fallback={null}>
            <InstallPrompt />
          </Suspense>
          <BottomNav />
        </div>
      </div>
    </ShellChromeProvider>
  )
}
