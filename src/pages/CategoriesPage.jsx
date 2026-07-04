import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../hooks/useToast'
import { seedStarterCategories } from '../lib/categories'
import CategoryTreeManager, { CategoriesPageHeader } from '../components/CategoryTreeManager'
import SettingsSection from '../components/SettingsSection'

export default function CategoriesPage() {
  const toast = useToast()
  const { user, authReady } = useAuth()
  const [categoryTab, setCategoryTab] = useState('expense')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deletingAll, setDeletingAll] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const {
    categories,
    loading,
    createCategory,
    deleteCategory,
    deleteAllCategories,
    refetch,
  } = useCategories({ enabled: Boolean(user) && authReady })

  const handleDeleteAll = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Type DELETE to confirm')
      return
    }
    setDeletingAll(true)
    try {
      await deleteAllCategories()
      setDeleteConfirm('')
      toast.success('All categories deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete categories')
    } finally {
      setDeletingAll(false)
    }
  }

  const handleStarterPack = async () => {
    setSeeding(true)
    try {
      await seedStarterCategories()
      await refetch()
      toast.success('Starter categories added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add starter categories')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      <CategoriesPageHeader />

      <main className="page-container space-y-6">
        <SettingsSection title="Manage categories">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5">
              {[
                { id: 'expense', label: 'Expense' },
                { id: 'income', label: 'Income' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryTab(tab.id)}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    categoryTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading && categories.length === 0 ? (
            <div className="animate-pulse px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-9 w-24 rounded-full bg-slate-100" />
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <CategoryTreeManager
                kind={categoryTab}
                categories={categories}
                onAdd={createCategory}
                onDelete={deleteCategory}
                onError={(msg) => toast.error(msg)}
              />
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="Quick actions">
          <div className="space-y-3 px-4 py-4">
            <button
              type="button"
              onClick={handleStarterPack}
              disabled={seeding}
              className="btn-secondary w-full"
            >
              {seeding ? 'Adding…' : 'Add starter category pack'}
            </button>
            <p className="text-xs text-slate-500">
              Optional preset list (Food, Transport, Salary, etc.). You can delete any category
              afterward.
            </p>
          </div>
        </SettingsSection>

        <SettingsSection title="Delete all categories">
          <div className="space-y-3 px-4 py-4">
            <p className="text-sm text-slate-600">
              Permanently removes every category. Existing transactions will keep their amounts but
              lose category labels.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type DELETE to confirm'
              className="input-field w-full"
              aria-label="Confirm delete all"
            />
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={deletingAll || deleteConfirm !== 'DELETE'}
              className="btn-secondary w-full text-rose-700 ring-rose-200 hover:bg-rose-50"
            >
              {deletingAll ? 'Deleting…' : 'Delete all categories'}
            </button>
          </div>
        </SettingsSection>
      </main>
    </>
  )
}
