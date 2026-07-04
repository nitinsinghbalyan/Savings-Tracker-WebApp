export default function UserAccountInfo({ user }) {
  const email = user?.email ?? ''

  if (!email) {
    return <p className="px-4 py-4 text-sm text-slate-500">Not signed in</p>
  }

  return (
    <p className="truncate px-4 py-4 text-sm font-medium text-slate-900">{email}</p>
  )
}
