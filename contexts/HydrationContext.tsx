import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  calculateDailyGoal,
  getEffectiveHydration,
  getHydrationScore,
  getMilestoneMessage,
  type HydrationProfile,
  type BeverageType,
  type Gender,
  type ActivityLevel,
  type Climate,
} from '@/lib/hydrationEngine'
import { DEFAULT_GOAL_ML } from '@/lib/constants'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IntakeLog {
  id: string
  timestamp: number   // ms since epoch
  ml: number          // raw ml logged
  effectiveMl: number // after beverage multiplier
  beverageType: BeverageType
}

export interface DayData {
  date: string   // 'YYYY-MM-DD'
  totalMl: number
  goalMl: number
  logs: IntakeLog[]
}

interface HydrationState {
  profile: HydrationProfile
  dailyGoal: number
  logs: IntakeLog[]            // today's logs
  allLogs: Record<string, IntakeLog[]> // keyed by 'YYYY-MM-DD'
  todayTotal: number
  todayEffectiveTotal: number
  streak: number
  lastStreakDate: string
}

interface HydrationContextValue extends HydrationState {
  // Actions
  logIntake: (ml: number, type: BeverageType) => Promise<void>
  undoLast: () => Promise<void>
  setProfile: (p: Partial<HydrationProfile>) => Promise<void>
  // Computed
  progressPercent: number
  hydrationScore: number
  weekHistory: DayData[]
  monthHistory: DayData[]
  // Animation trigger
  lastLogAnimation: number
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const defaultProfile: HydrationProfile = {
  weightKg: 70,
  gender: 'other',
  activityLevel: 'moderate',
  climate: 'temperate',
}

const defaultState: HydrationState = {
  profile: defaultProfile,
  dailyGoal: DEFAULT_GOAL_ML,
  logs: [],
  allLogs: {},
  todayTotal: 0,
  todayEffectiveTotal: 0,
  streak: 0,
  lastStreakDate: '',
}

// ── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  profile:  '@hydro/profile',
  allLogs:  '@hydro/allLogs',
  streak:   '@hydro/streak',
  lastDate: '@hydro/lastDate',
}

// ── Helper ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Context ───────────────────────────────────────────────────────────────────

const HydrationContext = createContext<HydrationContextValue | null>(null)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HydrationState>(defaultState)
  const [lastLogAnimation, setLastLogAnimation] = useState(0)
  const initialized = useRef(false)

  // ── Load from storage ────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        const [profileRaw, allLogsRaw, streakRaw, lastDateRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.allLogs),
          AsyncStorage.getItem(KEYS.streak),
          AsyncStorage.getItem(KEYS.lastDate),
        ])

        const profile: HydrationProfile  = profileRaw  ? JSON.parse(profileRaw)  : defaultProfile
        const allLogs: Record<string, IntakeLog[]> = allLogsRaw ? JSON.parse(allLogsRaw) : {}
        const streakRaw2  = streakRaw  ? parseInt(streakRaw, 10) : 0
        const lastDate    = lastDateRaw ?? ''

        const today = todayStr()
        const todayLogs    = allLogs[today] ?? []
        const todayTotal   = todayLogs.reduce((s, l) => s + l.ml, 0)
        const todayEff     = todayLogs.reduce((s, l) => s + l.effectiveMl, 0)
        const dailyGoal    = calculateDailyGoal(profile)

        // Streak: if last date isn't yesterday or today, reset
        let streak = streakRaw2
        if (lastDate) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yStr = yesterday.toISOString().split('T')[0]
          if (lastDate !== today && lastDate !== yStr) {
            streak = 0
          }
        }

        setState({
          profile, dailyGoal, allLogs,
          logs: todayLogs,
          todayTotal, todayEffectiveTotal: todayEff,
          streak, lastStreakDate: lastDate,
        })
        initialized.current = true
      } catch (e) {
        console.warn('[HydrationContext] load error', e)
        initialized.current = true
      }
    })()
  }, [])

  // ── Log intake ───────────────────────────────────────────────────────────────
  const logIntake = useCallback(async (ml: number, type: BeverageType) => {
    const effectiveMl = getEffectiveHydration(ml, type)
    const entry: IntakeLog = {
      id: uid(),
      timestamp: Date.now(),
      ml,
      effectiveMl,
      beverageType: type,
    }

    setState(prev => {
      const today = todayStr()
      const prevTodayLogs = prev.allLogs[today] ?? []
      const newTodayLogs  = [...prevTodayLogs, entry]
      const newAllLogs    = { ...prev.allLogs, [today]: newTodayLogs }
      const todayTotal    = newTodayLogs.reduce((s, l) => s + l.ml, 0)
      const todayEff      = newTodayLogs.reduce((s, l) => s + l.effectiveMl, 0)

      // Streak logic
      let { streak, lastStreakDate } = prev
      if (lastStreakDate !== today && todayEff >= prev.dailyGoal) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yStr = yesterday.toISOString().split('T')[0]
        streak = (lastStreakDate === yStr) ? streak + 1 : 1
        lastStreakDate = today
      }

      // Persist async (fire-and-forget inside setState for perf)
      Promise.all([
        AsyncStorage.setItem(KEYS.allLogs,  JSON.stringify(newAllLogs)),
        AsyncStorage.setItem(KEYS.streak,   String(streak)),
        AsyncStorage.setItem(KEYS.lastDate, lastStreakDate),
      ]).catch(console.warn)

      return { ...prev, allLogs: newAllLogs, logs: newTodayLogs, todayTotal, todayEffectiveTotal: todayEff, streak, lastStreakDate }
    })

    setLastLogAnimation(Date.now())
  }, [])

  // ── Undo last ────────────────────────────────────────────────────────────────
  const undoLast = useCallback(async () => {
    setState(prev => {
      const today = todayStr()
      const todayLogs = [...(prev.allLogs[today] ?? [])]
      if (todayLogs.length === 0) return prev

      todayLogs.pop()
      const newAllLogs   = { ...prev.allLogs, [today]: todayLogs }
      const todayTotal   = todayLogs.reduce((s, l) => s + l.ml, 0)
      const todayEff     = todayLogs.reduce((s, l) => s + l.effectiveMl, 0)

      AsyncStorage.setItem(KEYS.allLogs, JSON.stringify(newAllLogs)).catch(console.warn)

      return { ...prev, allLogs: newAllLogs, logs: todayLogs, todayTotal, todayEffectiveTotal: todayEff }
    })
  }, [])

  // ── Update profile ───────────────────────────────────────────────────────────
  const setProfile = useCallback(async (patch: Partial<HydrationProfile>) => {
    setState(prev => {
      const profile   = { ...prev.profile, ...patch }
      const dailyGoal = calculateDailyGoal(profile)
      AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile)).catch(console.warn)
      return { ...prev, profile, dailyGoal }
    })
  }, [])

  // ── Computed ─────────────────────────────────────────────────────────────────
  const progressPercent  = Math.min(100, Math.round((state.todayEffectiveTotal / state.dailyGoal) * 100))
  const hydrationScore   = getHydrationScore(state.todayEffectiveTotal, state.dailyGoal, state.streak)

  // Week history (last 7 days)
  const weekHistory: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const logs    = state.allLogs[dateStr] ?? []
    return {
      date:    dateStr,
      totalMl: logs.reduce((s, l) => s + l.effectiveMl, 0),
      goalMl:  state.dailyGoal,
      logs,
    }
  })

  // Month history (last 30 days)
  const monthHistory: DayData[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    const logs    = state.allLogs[dateStr] ?? []
    return {
      date:    dateStr,
      totalMl: logs.reduce((s, l) => s + l.effectiveMl, 0),
      goalMl:  state.dailyGoal,
      logs,
    }
  })

  return (
    <HydrationContext.Provider
      value={{
        ...state,
        logIntake,
        undoLast,
        setProfile,
        progressPercent,
        hydrationScore,
        weekHistory,
        monthHistory,
        lastLogAnimation,
      }}
    >
      {children}
    </HydrationContext.Provider>
  )
}

export function useHydration(): HydrationContextValue {
  const ctx = useContext(HydrationContext)
  if (!ctx) throw new Error('useHydration must be used inside HydrationProvider')
  return ctx
}
