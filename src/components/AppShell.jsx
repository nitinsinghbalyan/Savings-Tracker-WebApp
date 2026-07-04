import PersistentTabs from './PersistentTabs'
import SidebarNav from './SidebarNav'
import BottomNav from './BottomNav'
import InstallPrompt from './InstallPrompt'
import { ShellChromeProvider } from '../context/ShellChromeContext'

export default function AppShell() {
  return (
    <ShellChromeProvider>
      <div className="app-shell">
        <SidebarNav />
        <div className="app-main">
          <PersistentTabs />
          <InstallPrompt />
          <BottomNav />
        </div>
      </div>
    </ShellChromeProvider>
  )
}
