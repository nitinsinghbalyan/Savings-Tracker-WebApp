import { lazy, Suspense } from 'react'
import PersistentTabs from './PersistentTabs'
import SidebarNav from './SidebarNav'
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
        </div>
      </div>
    </ShellChromeProvider>
  )
}
