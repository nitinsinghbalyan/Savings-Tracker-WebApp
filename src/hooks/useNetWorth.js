import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'
import {
  archiveHolding,
  createHolding,
  deleteHolding,
  getHoldings,
  updateHolding,
} from '../lib/holdings'
import { getSnapshots, upsertSnapshot } from '../lib/netWorthSnapshots'
import { getContributionPlans } from '../lib/contributionPlans'
import { saveNetWorthTarget } from '../lib/profile'
import { buildNetWorth, buildTargetProgress, netWorthCurrencies } from '../lib/netWorth'
import { getMonthRange, getPeriodForDate } from '../lib/transactions'

// Net worth data is deliberately NOT part of the AppDataContext bootstrap.
// That bootstrap already fires five parallel requests before first paint and
// sessions 75-76 were spent recovering that time; a sixth would slow the
// default Month tab for a screen most visits never open. Instead this hook
// fetches on first activation of the Worth tab and caches at module scope so
// switching tabs does not refetch.
const cache = {
  userId: null,
  loaded: false,
  holdings: [],
  snapshots: [],
  plans: [],
  migrationPending: false,
}

const subscribers = new Set()
let version = 0

function publish() {
  version += 1
  for (const notify of subscribers) notify()
}

function resetCache(userId) {
  cache.userId = userId
  cache.loaded = false
  cache.holdings = []
  cache.snapshots = []
  cache.plans = []
  cache.migrationPending = false
}

/** First day of the profile's current period, as a yyyy-MM-dd date. */
function currentPeriodStart(monthStartDay) {
  const today = new Date()
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`
  const { year, month } = getPeriodForDate(iso, monthStartDay)
  return getMonthRange(year, month, monthStartDay).start
}

export function useNetWorth({ enabled = true } = {}) {
  const { user } = useAuth()
  const { accounts, profile, bootstrapping, refreshProfile } = useAppData()

  const [dataVersion, setDataVersion] = useState(version)
  const [loading, setLoading] = useState(!cache.loaded)
  const [error, setError] = useState(null)
  const inFlightRef = useRef(null)
  const snapshotWrittenRef = useRef(null)

  useEffect(() => {
    const notify = () => setDataVersion(version)
    subscribers.add(notify)
    notify()
    return () => subscribers.delete(notify)
  }, [])

  // A different user must never see the previous one's cached holdings.
  if (user?.id && cache.userId !== user.id) {
    resetCache(user.id)
  }

  const load = useCallback(
    async ({ force = false } = {}) => {
      if (!user?.id) return
      if (!force && cache.loaded) {
        setLoading(false)
        return
      }
      if (inFlightRef.current) return inFlightRef.current

      setError(null)
      const promise = (async () => {
        try {
          const [holdings, snapshots, plans] = await Promise.all([
            getHoldings(),
            getSnapshots(),
            getContributionPlans(),
          ])
          cache.holdings = holdings
          cache.snapshots = snapshots
          cache.plans = plans
          // Every getter returns [] rather than throwing when its table is
          // absent, so an empty holdings read on a fresh DB is indistinguishable
          // from "no rows". Probe once so the UI can explain itself.
          cache.migrationPending = holdings.length === 0 && (await probeMigration())
          cache.loaded = true
          publish()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load net worth')
        } finally {
          setLoading(false)
          inFlightRef.current = null
        }
      })()

      inFlightRef.current = promise
      return promise
    },
    [user?.id],
  )

  useEffect(() => {
    if (!enabled) return
    if (!user?.id) return
    if (cache.loaded) {
      setLoading(false)
      return
    }
    void load()
  }, [enabled, user?.id, load])

  // --- Everything below reads the hook state above. Declaration order is
  // load-bearing: a useMemo hoisted above the values it reads throws on every
  // render and blanks the whole screen (error-history.md, sessions 14/81),
  // and `vite build` does not catch it.

  const holdings = cache.holdings
  const snapshots = cache.snapshots
  const plans = cache.plans
  const monthStartDay = profile?.month_start_day ?? 1
  const preferredCurrency = profile?.default_currency ?? 'INR'

  const currencies = useMemo(
    () => netWorthCurrencies(holdings, accounts),
    [holdings, accounts, dataVersion],
  )

  const summaries = useMemo(
    () => currencies.map((currency) => buildNetWorth(holdings, accounts, { currency })),
    [currencies, holdings, accounts, dataVersion],
  )

  const primary = useMemo(
    () => summaries.find((s) => s.currency === preferredCurrency) ?? summaries[0] ?? null,
    [summaries, preferredCurrency],
  )

  const target = useMemo(
    () =>
      buildTargetProgress(primary, {
        target: profile?.net_worth_target,
        targetDate: profile?.net_worth_target_date,
      }),
    [primary, profile?.net_worth_target, profile?.net_worth_target_date],
  )

  // Record this period's figure once per visit. Cheap, idempotent, and the
  // only thing the trend chart ever reads.
  useEffect(() => {
    if (!enabled || !user?.id) return
    if (!cache.loaded || cache.migrationPending) return
    if (!primary) return

    const period = currentPeriodStart(monthStartDay)
    const key = `${period}:${primary.currency}`
    if (snapshotWrittenRef.current === key) return
    snapshotWrittenRef.current = key

    void upsertSnapshot({
      period,
      currency: primary.currency,
      assets: primary.assets.total,
      liabilities: primary.liabilities.total,
      netWorth: primary.netWorth,
      targetEligible: primary.targetEligible,
    })
      .then((saved) => {
        if (!saved) return
        const rest = cache.snapshots.filter(
          (s) => !(s.period === saved.period && s.currency === saved.currency),
        )
        cache.snapshots = [...rest, saved].sort((a, b) =>
          String(a.period).localeCompare(String(b.period)),
        )
        publish()
      })
      .catch(() => {})
  }, [enabled, user?.id, primary, monthStartDay])

  const refetch = useCallback(() => load({ force: true }), [load])

  const applyHolding = useCallback((next, { removed = false } = {}) => {
    if (removed) {
      cache.holdings = cache.holdings.filter((h) => h.id !== next)
    } else {
      const exists = cache.holdings.some((h) => h.id === next.id)
      cache.holdings = exists
        ? cache.holdings.map((h) => (h.id === next.id ? { ...h, ...next } : h))
        : [...cache.holdings, next]
    }
    cache.migrationPending = false
    snapshotWrittenRef.current = null
    publish()
  }, [])

  const handleCreate = useCallback(
    async (data) => {
      const created = await createHolding(data)
      applyHolding(created)
      return created
    },
    [applyHolding],
  )

  const handleUpdate = useCallback(
    async (id, patch) => {
      const updated = await updateHolding(id, patch)
      applyHolding(updated)
      return updated
    },
    [applyHolding],
  )

  const handleArchive = useCallback(
    async (id) => {
      const updated = await archiveHolding(id)
      applyHolding(updated)
      return updated
    },
    [applyHolding],
  )

  const handleDelete = useCallback(
    async (id) => {
      await deleteHolding(id)
      applyHolding(id, { removed: true })
      return id
    },
    [applyHolding],
  )

  const handleSaveTarget = useCallback(
    async ({ target: amount, targetDate }) => {
      const saved = await saveNetWorthTarget({ target: amount, targetDate })
      await refreshProfile()
      return saved
    },
    [refreshProfile],
  )

  return {
    holdings,
    snapshots,
    plans,
    currencies,
    summaries,
    summary: primary,
    target,
    loaded: cache.loaded,
    migrationPending: cache.migrationPending,
    loading: enabled && (loading || (bootstrapping && !cache.loaded)),
    error,
    refetch,
    createHolding: handleCreate,
    updateHolding: handleUpdate,
    archiveHolding: handleArchive,
    deleteHolding: handleDelete,
    saveTarget: handleSaveTarget,
  }
}

/** One cheap HEAD request that tells "no rows" apart from "no table". */
async function probeMigration() {
  const { supabase } = await import('../lib/supabase')
  const { error } = await supabase.from('holdings').select('id', { head: true, count: 'exact' })
  const { isMissingRelationError } = await import('../lib/errors')
  return isMissingRelationError(error)
}
