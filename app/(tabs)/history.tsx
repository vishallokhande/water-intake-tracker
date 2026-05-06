import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import WeeklyChart from '@/components/WeeklyChart'
import MonthCalendar from '@/components/MonthCalendar'
import StreakBadge from '@/components/StreakBadge'
import { useHydration } from '@/contexts/HydrationContext'
import { BG, SURFACE2, BORDER, ACCENT, WARNING, SUCCESS, TEXT_TERTIARY } from '@/lib/theme'
import { getScoreColor } from '@/lib/hydrationEngine'
import { LinearGradient } from 'expo-linear-gradient'

export default function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const { weekHistory, monthHistory, streak, dailyGoal, todayEffectiveTotal, hydrationScore } = useHydration()

  // Personal bests
  const allDays = monthHistory.filter(d => d.totalMl > 0)
  const bestDay = allDays.length > 0 ? allDays.reduce((a, b) => a.totalMl > b.totalMl ? a : b) : null
  const avgIntake = allDays.length > 0
    ? Math.round(allDays.reduce((s, d) => s + d.totalMl, 0) / allDays.length)
    : 0
  const goalsMetCount = monthHistory.filter(d => d.totalMl >= d.goalMl).length

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      {/* Header */}
      <LinearGradient
        colors={['#020c18', '#041830']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={styles.title}>Hydration History</Text>
        <Text style={styles.subtitle}>Track your wellness journey</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* ── Stats overview ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsGrid}>
          <StatTile label="30-Day Avg" value={`${avgIntake}ml`} icon="📊" color={ACCENT} />
          <StatTile label="Goals Met" value={`${goalsMetCount}`} icon="✅" color={SUCCESS} />
          <StatTile label="Hydra Score" value={`${hydrationScore}`} icon="⚡" color={getScoreColor(hydrationScore)} />
          <StatTile label="Best Day" value={bestDay ? `${bestDay.totalMl}ml` : '—'} icon="🏆" color={WARNING} />
        </Animated.View>

        {/* ── Streak section ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <StreakBadge streak={streak} />
        </Animated.View>

        {/* ── Weekly chart ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <WeeklyChart data={weekHistory} />
        </Animated.View>

        {/* ── Monthly calendar ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <MonthCalendar data={monthHistory} />
        </Animated.View>

        {/* ── Daily log breakdown ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Days</Text>
          {[...weekHistory].reverse().map(day => {
            const pct   = day.goalMl > 0 ? Math.min(1, day.totalMl / day.goalMl) : 0
            const color = getScoreColor(Math.round(pct * 100))
            const dateLabel = new Date(day.date + 'T12:00:00')
              .toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

            return (
              <View key={day.date} style={styles.dayRow}>
                <View style={[styles.dayDot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayDate}>{dateLabel}</Text>
                  <View style={styles.dayBarTrack}>
                    <View style={[styles.dayBar, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
                  </View>
                </View>
                <Text style={[styles.dayMl, { color }]}>
                  {day.totalMl > 0 ? `${day.totalMl}ml` : '—'}
                </Text>
              </View>
            )
          })}
        </Animated.View>
      </ScrollView>
    </View>
  )
}

function StatTile({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={[styles.statTile, { borderColor: `${color}30` }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  scroll: {
    padding: 20,
    gap: 0,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statIcon: { fontSize: 20 },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_TERTIARY,
    fontWeight: '500',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  dayDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  dayBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dayBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  dayMl: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
})
