import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import PageHeader from '../components/PageHeader'
import SummarySection from '../components/SummarySection'

export default function SummaryPage() {
  const { user, authReady } = useAuth()
  const { profile } = useProfile({ enabled: Boolean(user) && authReady })

  return (
    <>
      <PageHeader title="Summary" subtitle="Charts and monthly breakdown" />
      <main className="page-container">
        <SummarySection profile={profile} />
      </main>
    </>
  )
}
