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

// ── Smart reminder timing ─────────────────────────────────────────────────────

export interface ReminderSlot {
  hour: number
  minute: number
  label: string
}

/**
 * Note: label in ReminderSlot is now just a placeholder or should be localized in the caller.
 * Refactoring it to return just the ml left so the UI can construct the localized message.
 */
export interface SmartReminder {
  hour: number
  minute: number
  mlLeft: number
}

export function getSmartReminders(
  currentMl: number,
  goalMl: number,
  wakeHour = 7,
  sleepHour = 23
): SmartReminder[] {
  const progressRatio = currentMl / goalMl
  const hoursLeft     = sleepHour - new Date().getHours()
  const mlLeft        = goalMl - currentMl

  if (progressRatio >= 1 || hoursLeft <= 0) return []

  const mlPerReminder = 250
  const count         = Math.min(8, Math.ceil(mlLeft / mlPerReminder))
  const interval      = Math.max(30, Math.floor((hoursLeft * 60) / count))

  const slots: SmartReminder[] = []
  let cursor = new Date()
  cursor.setMinutes(cursor.getMinutes() + interval)

  for (let i = 0; i < count; i++) {
    slots.push({
      hour:   cursor.getHours(),
      minute: cursor.getMinutes(),
      mlLeft: mlLeft - i * mlPerReminder,
    })
    cursor = new Date(cursor.getTime() + interval * 60_000)
    if (cursor.getHours() >= sleepHour) break
  }

  return slots
}

export interface GoalFactor {
  label: string
  value: string
  contribution: number
}

export function getGoalFactors(profile: HydrationProfile): GoalFactor[] {
  const base = profile.weightKg * 35
  return [
    {
      label: 'Weight',
      value: `${profile.weightKg}kg`,
      contribution: Math.round(base),
    },
    {
      label: 'Activity',
      value: profile.activityLevel,
      contribution: Math.round(base * (ACTIVITY_MULTIPLIERS[profile.activityLevel] - 1)),
    },
    {
      label: 'Climate',
      value: profile.climate,
      contribution: CLIMATE_ADDITIONS[profile.climate],
    },
  ]
}

// ── Motivational microcopy ───────────────────────────────────────────────────

export function getMotivationMessage(percent: number): string {
  if (percent >= 100) return "You're a hydration hero! 🏆"
  if (percent >= 80)  return "Almost there! Keep sipping. 💧"
  if (percent >= 50)  return "Halfway point! You're doing great. 🌊"
  if (percent >= 25)  return "Good start! Let's hit that goal. 🥛"
  return "Time for some water! Your body will thank you. ✨"
}

export function getMilestoneMessage(streak: number): string | null {
  if (streak === 3)  return "3-day streak! You're building a habit! 🔥"
  if (streak === 7)  return "One whole week! Hydration master! 🏅"
  if (streak === 30) return "30 days! You're officially a water god! 🌊"
  if (streak > 0 && streak % 10 === 0) return `${streak} days in a row! Incredible! ⚡`
  return null
}

export const BEVERAGE_LABELS: Record<BeverageType, string> = {
  water:  'Water',
  coffee: 'Coffee',
  tea:    'Tea',
  juice:  'Juice',
  sports: 'Sports Drink',
  milk:   'Milk',
}

