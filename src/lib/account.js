export function getSignInMethod(user) {
  if (!user) return null
  const provider = user.app_metadata?.provider
  if (provider === 'google') return 'Google'
  if (provider === 'email') return 'Email'
  return provider ?? 'Account'
}
