import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { AppDataProvider } from './context/AppDataContext'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'

function AppRoutes() {
  const { session, initialLoading, claimNotice, clearClaimNotice } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (claimNotice > 0) {
      toast.success(`Linked ${claimNotice} existing goals to your account`)
      clearClaimNotice()
    }
  }, [claimNotice, clearClaimNotice, toast.success])

  if (initialLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/summary" replace />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AppDataProvider>
    </AuthProvider>
  )
}
