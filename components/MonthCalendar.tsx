/**
 * MonthCalendar — 30-day hydration heatmap calendar.
 * Color-coded cells by hydration achievement level.
 */
import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Text } from '@/components/ui/Text'
import { SURFACE2, BORDER, TEXT_TERTIARY } from '@/lib/theme'
import { getScoreColor } from '@/lib/hydrationEngine'
import type { DayData } from '@/contexts/HydrationContext'

const { width: SW } = Dimensions.get('window')
const CELL_SIZE = Math.floor((SW - 56 - 48) / 7) // 7 cols, padding accounted

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props {
  data: DayData[]
}

export default function MonthCalendar({ data }: Props) {
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 30 Days</Text>

      {/* Day header */}
      <View style={styles.dayHeader}>
        {DAY_LABELS.map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.dayLabel, { width: CELL_SIZE }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {data.map(day => {
          const pct     = day.goalMl > 0 ? Math.min(1, day.totalMl / day.goalMl) : 0
          const color   = day.totalMl === 0 ? 'rgba(255,255,255,0.05)' : getScoreColor(Math.round(pct * 100))
          const isToday = day.date === todayStr
          const dateNum = new Date(day.date + 'T12:00:00').getDate()
          const opacity = day.totalMl === 0 ? 1 : 0.2 + pct * 0.8

          return (
            <View
              key={day.date}
              style={[
                styles.cell,
                { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: color, opacity, borderRadius: 6 },
                isToday && { borderWidth: 1.5, borderColor: '#fff', opacity: 1 },
              ]}
            >
              <Text style={[styles.cellText, isToday && { color: '#fff', fontWeight: '700' }]}>
                {dateNum}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[0, 40, 70, 90, 100].map(pct => (
          <View key={pct} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getScoreColor(pct === 0 ? 0 : pct) }]} />
            <Text style={styles.legendText}>{pct === 0 ? 'None' : `${pct}%+`}</Text>
          </View>
        ))}
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  dayLabel: {
    fontSize: 10,
    color: TEXT_TERTIARY,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  cellText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: TEXT_TERTIARY,
    fontWeight: '500',
  },
})
