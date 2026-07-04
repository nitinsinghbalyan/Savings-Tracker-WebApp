import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, CircleDollarSign, DollarSign, Repeat, Tags } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useGoals } from '../hooks/useGoals'
import { useProfile } from '../hooks/useProfile'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useToast } from '../hooks/useToast'
import { downloadBackup } from '../lib/backup'
import { CURRENCIES } from '../lib/constants'
import PageHeader from '../components/PageHeader'
import SettingsSection from '../components/SettingsSection'
import UserAccountInfo from '../components/UserAccountInfo'
import AccountCard from '../components/AccountCard'
import AccountForm from '../components/AccountForm'
import ImportBackupModal from '../components/ImportBackupModal'
import RupeeIcon from '../components/icons/RupeeIcon'

const chipBase =
  'inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition'

const iconToggleBase =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition disabled:opacity-50'

export default function SettingsPage() {
  const toast = useToast()
  const { user, signOut, authReady } = useAuth()
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [savingPref, setSavingPref] = useState(false)

  const { goals, refetch: refetchGoals } = useGoals({ enabled: Boolean(user) && authReady })
  const { profile, loading: profileLoading, saveProfile } = useProfile({ enabled: Boolean(user) && authReady })
  const { accounts, createAccount, updateAccount, refetch: refetchAccounts } = useAccounts({
    enabled: Boolean(user) && authReady,
  })
  const { refetch: refetchCategories } = useCategories({
    enabled: Boolean(user) && authReady,
  })

  const handleSaveAccount = async (data) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, {
        name: data.name,
        account_type: data.account_type,
        color: data.color,
        bank: data.bank || null,
      })
      toast.success('Account updated')
    } else {
      await createAccount(data)
      toast.success('Account created')
    }
  }

  const handlePreference = async (patch) => {
    setSavingPref(true)
    try {
      await saveProfile(patch)
      toast.success('Preferences saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingPref(false)
    }
  }

  const handleExport = async () => {
    try {
      await downloadBackup(goals)
      toast.success('Backup downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const handleImported = async () => {
    await Promise.all([refetchGoals(), refetchAccounts(), refetchCategories()])
    toast.success('Backup imported')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign out')
    }
  }

  return (
    <>
      <PageHeader title="Settings" />

      <main className="page-container space-y-6">
        <SettingsSection title="Account">
          <UserAccountInfo user={user} />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">Default currency</span>
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Default currency">
                {CURRENCIES.map((c) => {
                  const selected = (profile?.default_currency ?? 'INR') === c.code
                  return (
                    <button
                      key={c.code}
                      type="button"
                      disabled={profileLoading || savingPref}
                      onClick={() => handlePreference({ default_currency: c.code })}
                      aria-label={c.code}
                      aria-pressed={selected}
                      className={`${iconToggleBase} ${
                        selected
                          ? 'bg-brand-600 text-white ring-brand-600'
                          : 'bg-slate-50 text-slate-600 ring-slate-200'
                      }`}
                    >
                      {c.code === 'INR' ? (
                        <RupeeIcon className="h-5 w-5" strokeWidth={2.25} />
                      ) : (
                        <DollarSign className="h-5 w-5" strokeWidth={2.25} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">Month starts on</span>
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Month starts on">
                {[1, 15].map((day) => {
                  const selected = (profile?.month_start_day ?? 1) === day
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={profileLoading || savingPref}
                      onClick={() => handlePreference({ month_start_day: day })}
                      aria-pressed={selected}
                      className={`${chipBase} min-w-[3.25rem] px-3 ${
                        selected
                          ? 'bg-brand-600 text-white ring-brand-600'
                          : 'bg-slate-50 text-slate-700 ring-slate-200'
                      }`}
                    >
                      {day === 1 ? '1st' : '15th'}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Balances"
          action={
            <button
              type="button"
              onClick={() => {
                setEditingAccount(null)
                setAccountFormOpen(true)
              }}
              className="text-xs font-semibold text-brand-600"
            >
              + Add
            </button>
          }
        >
          {accounts.filter((a) => !a.is_archived).length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">No balances yet. Add one to track expenses.</p>
          ) : (
            accounts
              .filter((a) => !a.is_archived)
              .map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onClick={(a) => {
                    setEditingAccount(a)
                    setAccountFormOpen(true)
                  }}
                />
              ))
          )}
        </SettingsSection>

        <SettingsSection title="Finance">
          <Link
            to="/settings/categories"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
          >
            <Tags className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-slate-900">Manage categories</span>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </Link>
          <Link
            to="/settings/recurring"
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50"
          >
            <Repeat className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-slate-900">Recurring transactions</span>
            <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </Link>
        </SettingsSection>

        <SettingsSection title="Data">
          <button
            type="button"
            onClick={handleExport}
            className="flex w-full px-4 py-3.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Download backup
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex w-full border-t border-slate-100 px-4 py-3.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Import backup
          </button>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Sync goals and finance data across devices.
          </p>
        </SettingsSection>

        <button type="button" onClick={handleSignOut} className="btn-secondary w-full">
          Sign out
        </button>
      </main>

      <AccountForm
        open={accountFormOpen}
        onClose={() => {
          setAccountFormOpen(false)
          setEditingAccount(null)
        }}
        account={editingAccount}
        defaultCurrency={profile?.default_currency ?? 'INR'}
        onSubmit={handleSaveAccount}
        onError={(msg) => toast.error(msg)}
      />

      <ImportBackupModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
        hasExistingGoals={goals.length > 0}
      />
    </>
  )
}
