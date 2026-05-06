/**
 * 💧 Hydration Engine
 *
 * Smart hydration calculation logic:
 * - Daily goal based on weight, gender, activity, climate
 * - Beverage multipliers (not all drinks are equal)
 * - Hydration score (0-100)
 * - Motivational microcopy
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type Gender       = 'male' | 'female' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'
export type Climate      = 'arctic' | 'temperate' | 'warm' | 'hot' | 'tropical'
export type BeverageType = 'water' | 'coffee' | 'tea' | 'juice' | 'sports' | 'milk'

export interface HydrationProfile {
  weightKg: number
  gender: Gender
  activityLevel: ActivityLevel
  climate: Climate
  age?: number
}

// ── Beverage multipliers ───────────────────────────────────────────────────────
// How much of the volume counts toward hydration

export const BEVERAGE_MULTIPLIERS: Record<BeverageType, number> = {
  water:  1.00,
  tea:    0.90,
  juice:  0.85,
  milk:   0.85,
  sports: 0.80,
  coffee: 0.60, // diuretic offset
}

export const BEVERAGE_LABELS: Record<BeverageType, string> = {
  water:  'Water',
  coffee: 'Coffee',
  tea:    'Tea',
  juice:  'Juice',
  sports: 'Sports',
  milk:   'Milk',
}

export const BEVERAGE_ICONS: Record<BeverageType, string> = {
  water:  '💧',
  coffee: '☕',
  tea:    '🍵',
  juice:  '🍊',
  sports: '⚡',
  milk:   '🥛',
}

// ── Daily goal calculator ──────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 0.85,
  light:     1.00,
  moderate:  1.20,
  active:    1.40,
  athlete:   1.65,
}

const CLIMATE_ADDITIONS: Record<Climate, number> = {
  arctic:    -200,
  temperate:    0,
  warm:       300,
  hot:        500,
  tropical:   600,
}

/**
 * Calculate daily water goal in ml.
 * Base: 35ml per kg body weight (standard formula)
 * Adjusted for gender, activity, and climate.
 */
export function calculateDailyGoal(profile: HydrationProfile): number {
  const { weightKg, gender, activityLevel, climate } = profile

  // Base: 35ml/kg
  let base = weightKg * 35

  // Gender adjustment
  if (gender === 'male')   base *= 1.05
  if (gender === 'female') base *= 0.95

  // Activity multiplier
  base *= ACTIVITY_MULTIPLIERS[activityLevel]

  // Climate addition
  base += CLIMATE_ADDITIONS[climate]

  // Clamp between 1500ml and 5000ml
  return Math.round(Math.max(1500, Math.min(5000, base)))
}

/**
 * Calculate effective hydration from a log entry.
 */
export function getEffectiveHydration(ml: number, type: BeverageType): number {
  return Math.round(ml * BEVERAGE_MULTIPLIERS[type])
}

// ── Hydration score (0–100) ───────────────────────────────────────────────────

export function getHydrationScore(
  intakeMl: number,
  goalMl: number,
  streak: number
): number {
  const progressScore = Math.min(100, (intakeMl / goalMl) * 80)
  const streakBonus   = Math.min(20, streak * 0.5)
  return Math.round(progressScore + streakBonus)
}

// ── Progress percentage ───────────────────────────────────────────────────────

export function getProgressPercent(intakeMl: number, goalMl: number): number {
  return Math.min(100, Math.round((intakeMl / goalMl) * 100))
}

// ── Score color ───────────────────────────────────────────────────────────────

export function getScoreColor(percent: number): string {
  if (percent >= 90) return '#00ff87'
  if (percent >= 70) return '#00d4ff'
  if (percent >= 40) return '#ffa502'
  return '#ff4757'
}

// ── Motivational microcopy ────────────────────────────────────────────────────

export function getMotivationMessage(percent: number): string {
  if (percent === 0)        return "Let's start your hydration journey! 🌊"
  if (percent < 15)         return 'Every drop counts. Keep going! 💧'
  if (percent < 30)         return 'Good start! You\'re building momentum 🚀'
  if (percent < 50)         return 'Almost halfway there! Stay hydrated 💦'
  if (percent < 70)         return 'Over halfway! Your body loves this 🌿'
  if (percent < 85)         return 'So close! Push through the finish line 🏆'
  if (percent < 100)        return 'Almost there! One more sip! ✨'
  return 'Goal crushed! You\'re a hydration champion! 🎉'
}

export function getMilestoneMessage(streak: number): string | null {
  const messages: Record<number, string> = {
    3:   '3-day streak! You\'re building a great habit! 🔥',
    7:   '1-week warrior! Your cells are cheering! 💪',
    14:  '2 weeks strong! Pure dedication! ⚡',
    30:  '30-day legend! You\'re unstoppable! 🏆',
    60:  '60 days! You\'re a hydration master! 👑',
    100: '100 days! Hall of fame level! 🌟',
    365: '365 days! One full year! LEGENDARY! 🚀',
  }
  return messages[streak] ?? null
}

// ── Smart reminder timing ─────────────────────────────────────────────────────

export interface ReminderSlot {
  hour: number
  minute: number
  label: string
}

export function getSmartReminders(
  currentMl: number,
  goalMl: number,
  wakeHour = 7,
  sleepHour = 23
): ReminderSlot[] {
  const progressRatio = currentMl / goalMl
  const hoursLeft     = sleepHour - new Date().getHours()
  const mlLeft        = goalMl - currentMl

  if (progressRatio >= 1 || hoursLeft <= 0) return []

  // How many reminders needed?
  const mlPerReminder = 250
  const count         = Math.min(8, Math.ceil(mlLeft / mlPerReminder))
  const interval      = Math.max(30, Math.floor((hoursLeft * 60) / count))

  const slots: ReminderSlot[] = []
  let cursor = new Date()
  cursor.setMinutes(cursor.getMinutes() + interval)

  for (let i = 0; i < count; i++) {
    slots.push({
      hour:   cursor.getHours(),
      minute: cursor.getMinutes(),
      label:  `Time to hydrate! ${mlLeft - i * mlPerReminder}ml to go`,
    })
    cursor = new Date(cursor.getTime() + interval * 60_000)
    if (cursor.getHours() >= sleepHour) break
  }

  return slots
}

// ── Goal factor breakdown ─────────────────────────────────────────────────────

export interface GoalFactor {
  label: string
  value: string
  contribution: number // ml added or multiplied
}

export function getGoalFactors(profile: HydrationProfile): GoalFactor[] {
  const base = profile.weightKg * 35
  return [
    {
      label: 'Body Weight',
      value: `${profile.weightKg}kg`,
      contribution: Math.round(base),
    },
    {
      label: 'Activity Level',
      value: profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1),
      contribution: Math.round(base * (ACTIVITY_MULTIPLIERS[profile.activityLevel] - 1)),
    },
    {
      label: 'Climate',
      value: profile.climate.charAt(0).toUpperCase() + profile.climate.slice(1),
      contribution: CLIMATE_ADDITIONS[profile.climate],
    },
  ]
}
