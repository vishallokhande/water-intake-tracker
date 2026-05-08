import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { Text } from '@/components/ui/Text'
import LiquidRing from '@/components/LiquidRing'
import QuickLogButton from '@/components/QuickLogButton'
import BeverageSelector from '@/components/BeverageSelector'
import StreakBadge from '@/components/StreakBadge'
import { useIntlayer } from 'react-intlayer'

import { useHydration } from '@/contexts/HydrationContext'
import { getMotivationMessage, getMilestoneMessage, type BeverageType } from '@/lib/hydrationEngine'
import { QUICK_LOG_PRESETS } from '@/lib/constants'
import {
  ACCENT, ACCENT_DIM, ACCENT_GLOW, BG, SURFACE, SURFACE2, SURFACE3,
  BORDER, TEXT_SECONDARY, TEXT_TERTIARY, SUCCESS, WARNING, ERROR, ACCENT_BORDER,
} from '@/lib/theme'

const { width: SW, height: SH } = Dimensions.get('window')

// ── Custom amount modal ────────────────────────────────────────────────────────

function CustomAmountModal({
  visible,
  beverageType,
  onLog,
  onClose,
}: {
  visible: boolean
  beverageType: BeverageType
  onLog: (ml: number, type: BeverageType) => void
  onClose: () => void
}) {
  const [value, setValue] = useState('300')
  const { customModal } = useIntlayer('dashboard')

  function handleSubmit() {
    const ml = parseInt(value, 10)
    if (ml > 0 && ml <= 2000) {
      onLog(ml, beverageType)
      onClose()
      setValue('300')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View />
      </Pressable>
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>{customModal.title}</Text>
        <Text style={styles.modalSub}>{customModal.subtitle}</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.mlInput}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            selectTextOnFocus
            placeholderTextColor="rgba(255,255,255,0.3)"
            placeholder="250"
          />
          <Text style={styles.mlUnit}>{customModal.unit}</Text>
        </View>

        {/* Quick presets */}
        <View style={styles.presetRow}>
          {[100, 200, 300, 400, 500, 750].map(ml => (
            <Pressable key={ml} style={[styles.preset, value === String(ml) && styles.presetActive]} onPress={() => setValue(String(ml))}>
              <Text style={[styles.presetText, value === String(ml) && { color: ACCENT }]}>{ml}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logBtn} onPress={handleSubmit}>
          <LinearGradient colors={[ACCENT, '#0077ff']} style={styles.logBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.logBtnText}>{customModal.logButton.render({ value: value || '0' })}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Modal>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const {
    todayTotal, todayEffectiveTotal, dailyGoal,
    progressPercent, hydrationScore, streak,
    logs, logIntake, undoLast, lastLogAnimation,
  } = useHydration()
  const { header, greetings, stats, sections, buttons, toasts, motivation, milestones, beverages } = useIntlayer('dashboard')

  const [selectedBeverage, setSelectedBeverage] = useState<BeverageType>('water')
  const [showCustom, setShowCustom]             = useState(false)
  const [showUndo, setShowUndo]                 = useState(false)
  const [milestoneMsg, setMilestoneMsg]         = useState<string | null>(null)

  const undoTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const ringBounce   = useSharedValue(1)
  const scoreScale   = useSharedValue(1)
  const milestoneAnim = useSharedValue(0)

  // Bounce ring on new log
  useEffect(() => {
    if (!lastLogAnimation) return
    ringBounce.value = withSequence(
      withSpring(1.06, { damping: 6, stiffness: 250 }),
      withSpring(1.0,  { damping: 10 }),
    )
    scoreScale.value = withSequence(
      withSpring(1.12, { damping: 8 }),
      withSpring(1.0,  { damping: 12 }),
    )

    // Show undo toast
    setShowUndo(true)
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setShowUndo(false), 4000)

    // Milestone check
    const msg = (() => {
      if (streak === 3)   return milestones.ms3
      if (streak === 7)   return milestones.ms7
      if (streak === 14)  return milestones.ms14
      if (streak === 30)  return milestones.ms30
      if (streak === 60)  return milestones.ms60
      if (streak === 100) return milestones.ms100
      if (streak === 365) return milestones.ms365
      return null
    })()

    if (msg) {
      setMilestoneMsg(msg)
      milestoneAnim.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 400 }),
      )
      setTimeout(() => setMilestoneMsg(null), 3000)
    }
  }, [lastLogAnimation, streak, milestones])

  const ringStyle  = useAnimatedStyle(() => ({ transform: [{ scale: ringBounce.value }] }))
  const scoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: scoreScale.value }] }))
  const milestoneStyle = useAnimatedStyle(() => ({
    opacity: milestoneAnim.value,
    transform: [{ translateY: (1 - milestoneAnim.value) * -20 }],
  }))

  const handleLog = useCallback(async (ml: number, type: BeverageType) => {
    await logIntake(ml, type)
  }, [logIntake])

  const handleUndo = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    await undoLast()
    setShowUndo(false)
  }, [undoLast])
  const motivationText = (() => {
    if (progressPercent === 0)   return motivation.m0
    if (progressPercent < 15)    return motivation.m15
    if (progressPercent < 30)    return motivation.m30
    if (progressPercent < 50)    return motivation.m50
    if (progressPercent < 70)    return motivation.m70
    if (progressPercent < 85)    return motivation.m85
    if (progressPercent < 100)   return motivation.m100
    return motivation.mDone
  })()

  const timeGreeting   = (() => {
    const h = new Date().getHours()
    if (h < 12) return greetings.morning
    if (h < 17) return greetings.afternoon
    return greetings.evening
  })()

  const lastLog = logs[logs.length - 1]

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      {/* Ocean gradient background */}
      <LinearGradient
        colors={['#020c18', '#041830', '#020c18']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.greeting}>{timeGreeting}</Text>
          <Text style={styles.headerTitle}>{header.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Animated.View style={scoreStyle}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreNum}>{hydrationScore}</Text>
              <Text style={styles.scoreLabel}>{header.scoreLabel}</Text>
            </View>
          </Animated.View>
          {streak > 0 && <StreakBadge streak={streak} compact />}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
      >
        {/* ── Progress ring ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.ringSection, ringStyle]}>
          {/* Glow backdrop */}
          <View style={styles.ringGlow} />
          <LiquidRing
            percent={progressPercent}
            size={230}
            strokeWidth={16}
            label={`${todayEffectiveTotal} / ${dailyGoal} ml`}
            sublabel={`${todayTotal !== todayEffectiveTotal ? `(${todayTotal}ml logged)` : ''}`}
          />
        </Animated.View>

        {/* Motivation text */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.motivationBlock}>
          <Text style={styles.motivationText}>{motivationText}</Text>
        </Animated.View>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.statsRow}>
          <StatCard label={stats.today} value={`${todayEffectiveTotal}ml`} icon="💧" highlight />
          <StatCard label={stats.goal} value={`${dailyGoal}ml`} icon="🎯" />
          <StatCard label={stats.remaining} value={`${Math.max(0, dailyGoal - todayEffectiveTotal)}ml`} icon="⏳" />
        </Animated.View>

        {/* ── Beverage selector ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).springify()}>
          <Text style={styles.sectionLabel}>{sections.beverageType}</Text>
          <BeverageSelector selected={selectedBeverage} onSelect={setSelectedBeverage} />
        </Animated.View>

        {/* ── Quick log buttons ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(440).springify()} style={styles.quickLogSection}>
          <Text style={styles.sectionLabel}>{sections.quickLog}</Text>
          <View style={styles.quickLogRow}>
            {QUICK_LOG_PRESETS.map(ml => (
              <QuickLogButton
                key={ml}
                ml={ml}
                beverageType={selectedBeverage}
                onLog={handleLog}
                size="md"
              />
            ))}
            {/* Custom button */}
            <Pressable onPress={() => setShowCustom(true)}>
              <View style={styles.customBtn}>
                <Ionicons name="add" size={22} color={ACCENT} />
                <Text style={styles.customBtnText}>{buttons.custom}</Text>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Today's log list ──────────────────────────────────────────────── */}
        {logs.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.logsSection}>
            <Text style={styles.sectionLabel}>{sections.todaysLog}</Text>
            <View style={styles.logList}>
              {[...logs].reverse().slice(0, 8).map((log, i) => {
                const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                return (
                  <View key={log.id} style={[styles.logItem, i === 0 && styles.logItemFirst]}>
                    <Text style={styles.logIcon}>
                      {log.beverageType === 'water' ? '💧'
                        : log.beverageType === 'coffee' ? '☕'
                        : log.beverageType === 'tea' ? '🍵'
                        : log.beverageType === 'juice' ? '🍊'
                        : log.beverageType === 'sports' ? '⚡' : '🥛'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logBev}>{log.beverageType.charAt(0).toUpperCase() + log.beverageType.slice(1)}</Text>
                      <Text style={styles.logTime}>{time}</Text>
                    </View>
                    <Text style={styles.logMl}>{log.ml}ml</Text>
                    {log.effectiveMl !== log.ml ? (
                      <Text style={styles.logEff}>≈{log.effectiveMl}ml</Text>
                    ) : null}
                  </View>
                )
              })}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* ── Milestone toast ───────────────────────────────────────────────────── */}
      {milestoneMsg && (
        <Animated.View style={[styles.milestoneToast, milestoneStyle]}>
          <LinearGradient colors={[WARNING, '#ff8c00']} style={styles.milestoneGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.milestoneText}>{milestoneMsg}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* ── Undo toast ────────────────────────────────────────────────────────── */}
      {showUndo && (
        <View style={[styles.undoToast, { bottom: insets.bottom + 110 }]}>
          <Text style={styles.undoMsg}>
            {lastLog ? toasts.amountLogged.render({ ml: lastLog.ml }) : toasts.logged}
          </Text>
          <Pressable onPress={handleUndo} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>{buttons.undo}</Text>
          </Pressable>
        </View>
      )}

      {/* Custom modal */}
      <CustomAmountModal
        visible={showCustom}
        beverageType={selectedBeverage}
        onLog={handleLog}
        onClose={() => setShowCustom(false)}
      />
    </View>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <View style={[styles.statCard, highlight && { borderColor: ACCENT_BORDER, backgroundColor: ACCENT_DIM }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, highlight && { color: ACCENT }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────


const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 8,
    zIndex: 10,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBadge: {
    backgroundColor: SURFACE2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
  },
  scoreNum: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
  },
  scoreLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 0,
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  ringGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,212,255,0.06)',
  },
  motivationBlock: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  motivationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE2,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statIcon: { fontSize: 18 },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_TERTIARY,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  quickLogSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  quickLogRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  customBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: SURFACE2,
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  customBtnText: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
  },
  logsSection: {
    marginBottom: 16,
  },
  logList: {
    backgroundColor: SURFACE2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },
  logItemFirst: {
    borderTopWidth: 0,
  },
  logIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  logBev: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  logTime: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    fontWeight: '500',
  },
  logMl: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT,
  },
  logEff: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  // Milestone toast
  milestoneToast: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  milestoneGrad: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  // Undo toast
  undoToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: SURFACE3,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  undoMsg: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  undoBtn: {
    backgroundColor: ERROR,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  undoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  // Custom modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: SURFACE2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    color: TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  mlInput: {
    fontSize: 48,
    fontWeight: '800',
    color: ACCENT,
    textAlign: 'center',
    minWidth: 120,
  },
  mlUnit: {
    fontSize: 22,
    color: TEXT_TERTIARY,
    fontWeight: '600',
    alignSelf: 'flex-end',
    paddingBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: SURFACE3,
    borderWidth: 1,
    borderColor: BORDER,
  },
  presetActive: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_DIM,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.60)',
  },
  logBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
})
