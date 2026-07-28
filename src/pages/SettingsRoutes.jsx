import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import SettingsPage from './SettingsPage'

const CategoriesPage = lazy(() => import('./CategoriesPage'))
const RecurringTransactionsPage = lazy(() => import('./RecurringTransactionsPage'))

function SettingsSubFallback() {
  return (
    <div className="page-container space-y-4 py-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="card h-48 animate-pulse" />
    </div>
  )
}

export default function SettingsRoutes() {
  return (
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route
        path="/settings/categories"
        element={
          <Suspense fallback={<SettingsSubFallback />}>
            <CategoriesPage />
          </Suspense>
        }
      />
      <Route
        path="/settings/recurring"
        element={
          <Suspense fallback={<SettingsSubFallback />}>
            <RecurringTransactionsPage />
          </Suspense>
        }
      />
    </Routes>
  )
}
