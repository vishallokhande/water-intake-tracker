/**
 * HydroFlow — Multi-step onboarding flow.
 * 5 steps: Welcome → Gender → Weight → Activity → Climate + Goal Preview
 */
import React, { useState, useRef } from 'react'
import {
  View, ScrollView, StyleSheet, Pressable, TextInput,
  Dimensions, FlatList, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeInDown, FadeInUp, FadeInRight, FadeOutLeft,
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import { Text } from '@/components/ui/Text'
import { useHydration } from '@/contexts/HydrationContext'
import { calculateDailyGoal } from '@/lib/hydrationEngine'
import type { Gender, ActivityLevel, Climate } from '@/lib/hydrationEngine'
import {
  ACCENT, ACCENT_DIM, ACCENT_BORDER,
  BG, SURFACE2, SURFACE3, BORDER, TEXT_TERTIARY,
} from '@/lib/theme'

const { width: SW } = Dimensions.get('window')

// ── Option chip for selections ─────────────────────────────────────────────────

function OptionCard<T extends string>({
  value, label, desc, icon, selected, onSelect,
}: { value: T; label: string; desc?: string; icon: string; selected: boolean; onSelect: (v: T) => void }) {
  const scale = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  function handlePress() {
    if (Platform.OS !== 'web') Haptics.selectionAsync()
    scale.value = withSpring(0.94, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 10 })
    })
    onSelect(value)
  }

  return (
    <Animated.View style={style}>
      <Pressable onPress={handlePress}>
        <View style={[styles.optCard, selected && { borderColor: ACCENT, backgroundColor: 'rgba(0,212,255,0.10)' }]}>
          <Text style={styles.optIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optLabel, selected && { color: '#fff' }]}>{label}</Text>
            {desc && <Text style={styles.optDesc}>{desc}</Text>}
          </View>
          <View style={[styles.radio, selected && { borderColor: ACCENT, backgroundColor: ACCENT }]}>
            {selected && <View style={styles.radioDot} />}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// ── Steps ──────────────────────────────────────────────────────────────────────

const GENDERS: { value: Gender; label: string; desc: string; icon: string }[] = [
  { value: 'male',   label: 'Male',   desc: 'Biological males need ~10% more',     icon: '♂️' },
  { value: 'female', label: 'Female', desc: 'Biological females need ~10% less',    icon: '♀️' },
  { value: 'other',  label: 'Other',  desc: 'We\'ll use a balanced baseline',        icon: '⚧' },
]

const ACTIVITIES: { value: ActivityLevel; label: string; desc: string; icon: string }[] = [
  { value: 'sedentary', label: 'Sedentary',  desc: 'Mostly sitting, desk job',        icon: '🪑' },
  { value: 'light',     label: 'Light',      desc: '1–3 days of light exercise/week', icon: '🚶' },
  { value: 'moderate',  label: 'Moderate',   desc: '3–5 days of moderate exercise',   icon: '🏃' },
  { value: 'active',    label: 'Very Active', desc: 'Daily intense workouts',          icon: '💪' },
  { value: 'athlete',   label: 'Athlete',    desc: 'Professional / twice daily',      icon: '🏅' },
]

const CLIMATES: { value: Climate; label: string; desc: string; icon: string }[] = [
  { value: 'arctic',    label: 'Cold',      desc: 'Below 10°C / 50°F',              icon: '❄️' },
  { value: 'temperate', label: 'Temperate', desc: '10–25°C / 50–77°F',              icon: '🌤️' },
  { value: 'warm',      label: 'Warm',      desc: '25–32°C / 77–90°F',              icon: '☀️' },
  { value: 'hot',       label: 'Hot',       desc: '32–40°C / 90–104°F',             icon: '🌡️' },
  { value: 'tropical',  label: 'Tropical',  desc: 'Hot + high humidity',             icon: '🌴' },
]

// ── Main onboarding component ──────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setProfile } = useHydration()

  const [step, setStep]           = useState(0)
  const [gender, setGender]       = useState<Gender>('other')
  const [weightText, setWeight]   = useState('70')
  const [activity, setActivity]   = useState<ActivityLevel>('moderate')
  const [climate, setClimate]     = useState<Climate>('temperate')

  const totalSteps = 5
  const weightKg   = parseFloat(weightText) || 70

  const previewGoal = calculateDailyGoal({
    weightKg, gender, activityLevel: activity, climate,
  })

  async function handleFinish() {
    await setProfile({ weightKg, gender, activityLevel: activity, climate })
    router.replace('/(tabs)')
  }

  const steps = [
    // Step 0 — Welcome
    <Animated.View key="welcome" entering={FadeInDown.springify()} style={styles.stepContent}>
      <View style={styles.heroEmoji}>
        <Text style={{ fontSize: 80 }}>💧</Text>
      </View>
      <Text style={styles.stepTitle}>Welcome to{'\n'}HydroFlow</Text>
      <Text style={styles.stepSub}>
        Your personal hydration OS. We'll calculate a science-backed daily water goal just for you in 60 seconds.
      </Text>
      <View style={styles.featureList}>
        {['🎯 Personalized daily goal', '📊 Weekly & monthly heatmap', '🔥 Streak tracking', '💧 Multi-beverage support'].map(f => (
          <View key={f} style={styles.featureItem}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </Animated.View>,

    // Step 1 — Gender
    <Animated.View key="gender" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your{'\n'}biological sex?</Text>
      <Text style={styles.stepSub}>This helps us calculate your baseline hydration need.</Text>
      <View style={styles.optList}>
        {GENDERS.map(g => (
          <OptionCard key={g.value} {...g} selected={gender === g.value} onSelect={setGender} />
        ))}
      </View>
    </Animated.View>,

    // Step 2 — Weight
    <Animated.View key="weight" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your{'\n'}body weight?</Text>
      <Text style={styles.stepSub}>The most accurate factor in calculating your daily water needs.</Text>
      <View style={styles.weightCenter}>
        <View style={styles.weightInputBox}>
          <TextInput
            value={weightText}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={styles.weightBigInput}
            placeholderTextColor="rgba(255,255,255,0.3)"
            placeholder="70"
            selectTextOnFocus
          />
          <Text style={styles.weightBigUnit}>kg</Text>
        </View>
        <Text style={styles.weightHint}>Tap the number to edit</Text>
      </View>
      <View style={styles.weightPresets}>
        {[50, 60, 70, 80, 90, 100].map(w => (
          <Pressable
            key={w}
            style={[styles.wPreset, weightText === String(w) && { borderColor: ACCENT, backgroundColor: ACCENT_DIM }]}
            onPress={() => setWeight(String(w))}
          >
            <Text style={[styles.wPresetText, weightText === String(w) && { color: ACCENT }]}>{w}kg</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>,

    // Step 3 — Activity
    <Animated.View key="activity" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>How active{'\n'}are you?</Text>
      <Text style={styles.stepSub}>Active people need significantly more water.</Text>
      <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
        <View style={styles.optList}>
          {ACTIVITIES.map(a => (
            <OptionCard key={a.value} {...a} selected={activity === a.value} onSelect={setActivity} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>,

    // Step 4 — Climate + Goal preview
    <Animated.View key="climate" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your{'\n'}climate like?</Text>
      <Text style={styles.stepSub}>Hot environments significantly increase water loss.</Text>
      <View style={styles.optList}>
        {CLIMATES.map(c => (
          <OptionCard key={c.value} {...c} selected={climate === c.value} onSelect={setClimate} />
        ))}
      </View>

      {/* Live goal preview */}
      <View style={styles.goalCard}>
        <LinearGradient
          colors={['rgba(0,212,255,0.15)', 'rgba(0,119,204,0.08)']}
          style={styles.goalCardGrad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.goalCardTitle}>Your Daily Goal</Text>
          <Text style={styles.goalCardValue}>{previewGoal}ml</Text>
          <Text style={styles.goalCardSub}>≈ {Math.round(previewGoal / 250)} glasses of water</Text>
        </LinearGradient>
      </View>
    </Animated.View>,
  ]

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <LinearGradient
        colors={['#020c18', '#041830', '#020c18']}
        style={StyleSheet.absoluteFill}
      />

      {/* Progress bar */}
      <View style={[styles.progressBar, { marginTop: insets.top + 12 }]}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.progDot, i <= step && { backgroundColor: ACCENT, flex: i < step ? 2 : 3 }]}
          />
        ))}
      </View>

      <View style={styles.stepLabel}>
        <Text style={styles.stepNum}>Step {step + 1} of {totalSteps}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
      >
        {steps[step]}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navRow, { paddingBottom: insets.bottom + 20 }]}>
        {step > 0 ? (
          <Pressable style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        ) : <View style={{ flex: 1 }} />}

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            if (step < totalSteps - 1) setStep(s => s + 1)
            else handleFinish()
          }}
        >
          <LinearGradient
            colors={[ACCENT, '#0077ff']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextBtnText}>
              {step < totalSteps - 1 ? 'Continue →' : '🚀 Start HydroFlow'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  root: { flex: 1 },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 6,
    marginBottom: 8,
  },
  progDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepLabel: {
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  stepNum: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    paddingTop: 24,
  },
  heroEmoji: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 12,
  },
  stepSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 28,
  },
  // Feature list
  featureList: {
    gap: 10,
    marginTop: 8,
  },
  featureItem: {
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Option cards
  optList: { gap: 10 },
  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  optIcon: { fontSize: 26, width: 32, textAlign: 'center' },
  optLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 2,
  },
  optDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  // Weight step
  weightCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weightInputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  weightBigInput: {
    fontSize: 72,
    fontWeight: '800',
    color: ACCENT,
    textAlign: 'center',
    minWidth: 150,
    letterSpacing: -2,
  },
  weightBigUnit: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '600',
    paddingBottom: 14,
  },
  weightHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.30)',
    fontWeight: '500',
  },
  weightPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  wPreset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  wPresetText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
  },
  // Goal preview card
  goalCard: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
  },
  goalCardGrad: {
    padding: 20,
    alignItems: 'center',
  },
  goalCardTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  goalCardValue: {
    fontSize: 48,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -1,
    marginBottom: 4,
  },
  goalCardSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '500',
  },
  // Nav row
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: 'rgba(2,12,24,0.95)',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  nextBtn: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
})
