/**
 * HydroFlow — Multi-step onboarding flow.
 * 5 steps: Welcome → Gender → Weight → Activity → Climate + Goal Preview
 */
import React, { useState } from 'react'
import {
  View, ScrollView, StyleSheet, Pressable, TextInput,
  Dimensions, Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeInDown, withSpring, useSharedValue, useAnimatedStyle
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useIntlayer } from 'react-intlayer'
import { Text } from '@/components/ui/Text'
import { useHydration } from '@/contexts/HydrationContext'
import { calculateDailyGoal } from '@/lib/hydrationEngine'
import type { Gender, ActivityLevel, Climate } from '@/lib/hydrationEngine'
import {
  ACCENT, ACCENT_DIM, ACCENT_BORDER,
  BG, BORDER,
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

export default function OnboardingScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { setProfile } = useHydration()
  const content = useIntlayer('onboarding')

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
      <Text style={styles.stepTitle}>{content.steps.welcome.title}</Text>
      <Text style={styles.stepSub}>{content.steps.welcome.subtitle}</Text>
      <View style={styles.featureList}>
        {Array.isArray(content.steps.welcome.features) && content.steps.welcome.features.map((f: string, i: number) => (
          <View key={i} style={styles.featureItem}>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </Animated.View>,

    // Step 1 — Gender
    <Animated.View key="gender" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>{content.steps.gender.title}</Text>
      <Text style={styles.stepSub}>{content.steps.gender.subtitle}</Text>
      <View style={styles.optList}>
        {[
          { value: 'male',   ...content.steps.gender.options.male,   icon: '♂️' },
          { value: 'female', ...content.steps.gender.options.female, icon: '♀️' },
          { value: 'other',  ...content.steps.gender.options.other,  icon: '⚧' },
        ].map(g => (
          <OptionCard key={g.value} {...g as any} selected={gender === g.value} onSelect={setGender} />
        ))}
      </View>
    </Animated.View>,

    // Step 2 — Weight
    <Animated.View key="weight" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>{content.steps.weight.title}</Text>
      <Text style={styles.stepSub}>{content.steps.weight.subtitle}</Text>
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
          <Text style={styles.weightBigUnit}>{content.steps.weight.unit}</Text>
        </View>
        <Text style={styles.weightHint}>{content.steps.weight.hint}</Text>
      </View>
      <View style={styles.weightPresets}>
        {[50, 60, 70, 80, 90, 100].map(w => (
          <Pressable
            key={w}
            style={[styles.wPreset, weightText === String(w) && { borderColor: ACCENT, backgroundColor: ACCENT_DIM }]}
            onPress={() => setWeight(String(w))}
          >
            <Text style={[styles.wPresetText, weightText === String(w) && { color: ACCENT }]}>{w}{content.steps.weight.unit}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>,

    // Step 3 — Activity
    <Animated.View key="activity" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>{content.steps.activity.title}</Text>
      <Text style={styles.stepSub}>{content.steps.activity.subtitle}</Text>
      <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
        <View style={styles.optList}>
          {[
            { value: 'sedentary', ...content.steps.activity.options.sedentary, icon: '🪑' },
            { value: 'light',     ...content.steps.activity.options.light,     icon: '🚶' },
            { value: 'moderate',  ...content.steps.activity.options.moderate,  icon: '🏃' },
            { value: 'active',    ...content.steps.activity.options.active,    icon: '💪' },
            { value: 'athlete',   ...content.steps.activity.options.athlete,   icon: '🏅' },
          ].map(a => (
            <OptionCard key={a.value} {...a as any} selected={activity === a.value} onSelect={setActivity} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>,

    // Step 4 — Climate + Goal preview
    <Animated.View key="climate" entering={FadeInDown.springify()} style={styles.stepContent}>
      <Text style={styles.stepTitle}>{content.steps.climate.title}</Text>
      <Text style={styles.stepSub}>{content.steps.climate.subtitle}</Text>
      <View style={styles.optList}>
        {[
          { value: 'arctic',    ...content.steps.climate.options.arctic,    icon: '❄️' },
          { value: 'temperate', ...content.steps.climate.options.temperate, icon: '🌤️' },
          { value: 'warm',      ...content.steps.climate.options.warm,      icon: '☀️' },
          { value: 'hot',       ...content.steps.climate.options.hot,       icon: '🌡️' },
          { value: 'tropical',  ...content.steps.climate.options.tropical,  icon: '🌴' },
        ].map(c => (
          <OptionCard key={c.value} {...c as any} selected={climate === c.value} onSelect={setClimate} />
        ))}
      </View>

      {/* Live goal preview */}
      <View style={styles.goalCard}>
        <LinearGradient
          colors={['rgba(0,212,255,0.15)', 'rgba(0,119,204,0.08)']}
          style={styles.goalCardGrad}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={styles.goalCardTitle}>{content.steps.goalPreview.title}</Text>
          <Text style={styles.goalCardValue}>{previewGoal}ml</Text>
          <Text style={styles.goalCardSub}>
            {content.steps.goalPreview.subtitle.render({ count: Math.round(previewGoal / 250) })}
          </Text>
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
        <Text style={styles.stepNum}>
          {content.navigation.stepLabel.render({ current: step + 1, total: totalSteps })}
        </Text>
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
            <Text style={styles.backBtnText}>{content.navigation.back}</Text>
          </Pressable>
        ) : <View style={{ flex: 1 }} />}

        <Pressable
          style={{ flex: 2 }}
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
              {step < totalSteps - 1 ? content.navigation.continue : content.navigation.finish}
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
