import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  claimDeviceData,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
} from '../lib/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [claimNotice, setClaimNotice] = useState(0)
  const establishingRef = useRef(false)
  const sessionRef = useRef(null)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const completeSignIn = useCallback(async () => {
    try {
      const claimed = await claimDeviceData()
      if (claimed > 0) {
        setClaimNotice(claimed)
      }
      return { claimed }
    } catch {
      return { claimed: 0 }
    }
  }, [])

  const establishSession = useCallback(
    async (nextSession) => {
      if (establishingRef.current) return
      establishingRef.current = true

      try {
        setSession(nextSession)
        if (nextSession) {
          await completeSignIn()
        }
        setAuthReady(true)
        setInitialLoading(false)
      } finally {
        establishingRef.current = false
      }
    },
    [completeSignIn],
  )

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      await establishSession(data.session)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT') {
        setSession(null)
        setAuthReady(false)
        setClaimNotice(0)
        setInitialLoading(false)
        return
      }

      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession)
        return
      }

      if (event === 'SIGNED_IN' && nextSession) {
        const sameUser = sessionRef.current?.user?.id === nextSession.user?.id
        if (sameUser) {
          setSession(nextSession)
          return
        }
        setAuthReady(false)
        await establishSession(nextSession)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [establishSession])

  const clearClaimNotice = useCallback(() => {
    setClaimNotice(0)
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { session: nextSession } = await signInWithEmail(email, password)
    if (!nextSession) {
      throw new Error('Sign in failed')
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { session: nextSession, user } = await signUpWithEmail(email, password)
    if (!nextSession) {
      return { needsConfirmation: true, user }
    }
    return { needsConfirmation: false }
  }, [])

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle()
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      initialLoading,
      loading: initialLoading,
      authReady,
      claimNotice,
      clearClaimNotice,
      signIn,
      signUp,
      signInGoogle,
      signOut: handleSignOut,
    }),
    [
      session,
      initialLoading,
      authReady,
      claimNotice,
      clearClaimNotice,
      signIn,
      signUp,
      signInGoogle,
      handleSignOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
