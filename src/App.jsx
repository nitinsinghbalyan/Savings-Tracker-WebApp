import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './hooks/useAuth'
import { useToast } from './hooks/useToast'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const AuthenticatedRoutes = lazy(() => import('./AuthenticatedRoutes'))

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  )
}

function AppRoutes() {
  const { session, initialLoading, claimNotice, clearClaimNotice } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (claimNotice > 0) {
      toast.success(`Linked ${claimNotice} existing goals to your account`)
      clearClaimNotice()
    }
  }, [claimNotice, clearClaimNotice, toast])

  if (initialLoading) {
    return <LoadingScreen />
  }

  if (!session) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthenticatedRoutes />
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
