import { Routes, Route } from 'react-router-dom'
import SettingsPage from './SettingsPage'
import CategoriesPage from './CategoriesPage'
import RecurringTransactionsPage from './RecurringTransactionsPage'

export default function SettingsRoutes() {
  return (
    <Routes>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/categories" element={<CategoriesPage />} />
      <Route path="/settings/recurring" element={<RecurringTransactionsPage />} />
    </Routes>
  )
}
