import { useState } from 'react'
import { Target } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { signIn, signUp, signInGoogle } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(null)

  const busy = submitting || googleLoading

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      await signInGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed'
      setError(message)
      toast.error(message)
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        toast.success('Signed in')
      } else {
        const result = await signUp(email.trim(), password)
        if (result.needsConfirmation) {
          toast.success('Check your email to confirm your account')
        } else {
          toast.success('Account created')
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <div className="hidden flex-1 flex-col justify-center bg-brand-600 px-12 py-16 text-white lg:flex">
        <div className="mx-auto max-w-md">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Target className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-bold">Savings Tracker</h1>
          <p className="mt-3 text-lg text-indigo-100">
            Track goals, monthly spending, and account balances in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-indigo-100">
            <li>• Set savings goals with progress tracking</li>
            <li>• Record income, expenses, and transfers</li>
            <li>• Sync across devices with your account</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="text-center lg:text-left">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 lg:mx-0">
              <Target className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 lg:hidden">Savings Tracker</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to sync your goals across every browser and device.
            </p>
          </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="btn-secondary mt-6 w-full"
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-white px-2 text-slate-400">or use email</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError(null)
            }}
            disabled={busy}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
            disabled={busy}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="auth-email" className="label-field">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="label-field">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              disabled={busy}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {submitting
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
