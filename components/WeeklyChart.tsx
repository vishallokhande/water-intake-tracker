/**
 * WeeklyChart — Animated 7-day hydration bar chart.
 * Color-coded from red (0%) → amber → cyan → green (100%+).
 */
import React, { useEffect } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { SURFACE2, BORDER, TEXT_TERTIARY } from '@/lib/theme'
import { getScoreColor } from '@/lib/hydrationEngine'
import type { DayData } from '@/contexts/HydrationContext'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_BAR_HEIGHT = 100

interface BarProps {
  day: DayData
  index: number
  isToday: boolean
  maxMl: number
}

function Bar({ day, index, isToday, maxMl }: BarProps) {
  const pct     = day.goalMl > 0 ? Math.min(1, day.totalMl / day.goalMl) : 0
  const height  = useSharedValue(0)
  const color   = getScoreColor(Math.round(pct * 100))
  const dayName = DAY_LABELS[new Date(day.date + 'T12:00:00').getDay() === 0 ? 6 : new Date(day.date + 'T12:00:00').getDay() - 1]
  const barH    = Math.max(4, pct * MAX_BAR_HEIGHT)

  useEffect(() => {
    height.value = withDelay(
      index * 60,
      withSpring(barH, { damping: 14, stiffness: 100 })
    )
  }, [barH])

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: color,
  }))

  return (
    <View style={styles.barCol}>
      {/* ml label above bar */}
      {day.totalMl > 0 && (
        <Text style={styles.barLabel}>
          {day.totalMl >= 1000 ? `${(day.totalMl / 1000).toFixed(1)}L` : `${day.totalMl}`}
        </Text>
      )}

      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.bar,
            barStyle,
            isToday && { shadowColor: color, shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
          ]}
        />
      </View>

      <Text style={[styles.dayLabel, isToday && { color: '#fff', fontWeight: '700' }]}>
        {dayName}
      </Text>
      {isToday && <View style={[styles.todayDot, { backgroundColor: color }]} />}
    </View>
  )
}

interface Props {
  data: DayData[]
}

export default function WeeklyChart({ data }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]
  const maxMl    = Math.max(...data.map(d => d.totalMl), 1)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week</Text>
        <Text style={styles.subtitle}>
          {data.filter(d => d.totalMl >= d.goalMl).length}/7 goals met
        </Text>
      </View>

      <View style={styles.chart}>
        {data.map((day, i) => (
          <Bar
            key={day.date}
            day={day}
            index={i}
            isToday={day.date === todayStr}
            maxMl={maxMl}
          />
        ))}
      </View>

      {/* Goal line */}
      <View style={styles.goalLine}>
        <View style={styles.goalDash} />
        <Text style={styles.goalText}>Daily goal</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SURFACE2,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: MAX_BAR_HEIGHT + 40,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '600',
  },
  barTrack: {
    width: '100%',
    height: MAX_BAR_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: TEXT_TERTIARY,
    fontWeight: '500',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    opacity: 0.4,
  },
  goalDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  goalText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
})
