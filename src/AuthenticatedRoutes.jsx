import { Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import AppShell from './components/AppShell'

export default function AuthenticatedRoutes() {
  return (
    <AppDataProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/summary" replace />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </AppDataProvider>
  )
}
