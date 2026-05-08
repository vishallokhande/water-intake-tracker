import React, { useState, useCallback } from 'react'
import {
  View, ScrollView, StyleSheet, Pressable, TextInput, Switch, Alert, Platform
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useHydration } from '@/contexts/HydrationContext'
import { getGoalFactors, calculateDailyGoal } from '@/lib/hydrationEngine'
import type { Gender, ActivityLevel, Climate } from '@/lib/hydrationEngine'
import {
  BG, SURFACE2, SURFACE3, BORDER, ACCENT, ACCENT_DIM, ACCENT_BORDER,
  TEXT_SECONDARY, TEXT_TERTIARY, SUCCESS, ERROR, WARNING,
} from '@/lib/theme'
import * as Haptics from 'expo-haptics'
import { useIntlayer } from 'react-native-intlayer'

// ── Types ─────────────────────────────────────────────────────────────────────
const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string; icon: string }[] = [
  { value: 'sedentary', label: 'Sedentary',  desc: 'Desk job, little exercise', icon: '🪑' },
  { value: 'light',     label: 'Light',      desc: '1-3 days/week exercise',    icon: '🚶' },
  { value: 'moderate',  label: 'Moderate',   desc: '3-5 days/week exercise',    icon: '🏃' },
  { value: 'active',    label: 'Active',     desc: 'Daily intense workouts',    icon: '💪' },
  { value: 'athlete',   label: 'Athlete',    desc: 'Pro training, twice daily', icon: '🏅' },
]

const CLIMATE_OPTIONS: { value: Climate; label: string; desc: string; icon: string }[] = [
  { value: 'arctic',    label: 'Cold',      desc: 'Below 10°C',       icon: '❄️' },
  { value: 'temperate', label: 'Temperate', desc: '10–25°C',           icon: '🌤️' },
  { value: 'warm',      label: 'Warm',      desc: '25–32°C',           icon: '☀️' },
  { value: 'hot',       label: 'Hot',       desc: '32–40°C',           icon: '🌡️' },
  { value: 'tropical',  label: 'Tropical',  desc: 'High humidity/heat', icon: '🌴' },
]

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male',   label: 'Male',   icon: '♂️' },
  { value: 'female', label: 'Female', icon: '♀️' },
  { value: 'other',  label: 'Other',  icon: '⚧' },
]

// ── Row component ─────────────────────────────────────────────────────────────
function SettingsRow({
  icon, label, right, onPress, danger,
}: { icon: string; label: string; right?: React.ReactNode; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && { color: ERROR }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />}
    </Pressable>
  )
}

// ── Chip row ──────────────────────────────────────────────────────────────────
function ChipRow<T extends string>({
  options, selected, onSelect,
}: { options: { value: T; label: string; icon: string; desc?: string }[]; selected: T; onSelect: (v: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
      {options.map(opt => {
        const active = selected === opt.value
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync()
              onSelect(opt.value)
            }}
            style={[
              styles.chip,
              active && { borderColor: ACCENT, backgroundColor: ACCENT_DIM },
            ]}
          >
            <Text style={styles.chipIcon}>{opt.icon}</Text>
            <Text style={[styles.chipLabel, active && { color: '#fff' }]}>{opt.label}</Text>
            {opt.desc && <Text style={styles.chipDesc}>{opt.desc}</Text>}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

// ── Main Settings screen ──────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { profile, dailyGoal, streak, setProfile } = useHydration()
  const { title, subtitle, profileSection, goalCalculator, recommendation, preferences, about, version: versionText } = useIntlayer('settings')

  const [weightText, setWeightText] = useState(String(profile.weightKg))

  // Compute live preview goal as profile changes
  const previewGoal = calculateDailyGoal(profile)
  const factors     = getGoalFactors(profile)

  function handleWeightChange(text: string) {
    setWeightText(text)
    const kg = parseFloat(text)
    if (!isNaN(kg) && kg > 10 && kg < 500) {
      setProfile({ weightKg: kg })
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <LinearGradient
        colors={['#020c18', '#041830']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* ── Profile card ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(0,212,255,0.15)', 'rgba(0,119,204,0.08)']}
            style={styles.profileGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 32 }}>💧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profileSection.name}</Text>
              <Text style={styles.profileStat}>🔥 {profileSection.streak.render({ streak })} • ⚡ {profileSection.goal.render({ goal: dailyGoal })}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Goal calculator ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>{goalCalculator.title}</Text>
          <Text style={styles.sectionSub}>{goalCalculator.description}</Text>

          {/* Weight */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{goalCalculator.weight}</Text>
            <View style={styles.weightRow}>
              <TextInput
                value={weightText}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                style={styles.weightInput}
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{goalCalculator.gender}</Text>
            <ChipRow
              options={GENDER_OPTIONS}
              selected={profile.gender}
              onSelect={g => setProfile({ gender: g })}
            />
          </View>

          {/* Activity */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{goalCalculator.activity}</Text>
            <ChipRow
              options={ACTIVITY_OPTIONS}
              selected={profile.activityLevel}
              onSelect={a => setProfile({ activityLevel: a })}
            />
          </View>

          {/* Climate */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{goalCalculator.climate}</Text>
            <ChipRow
              options={CLIMATE_OPTIONS}
              selected={profile.climate}
              onSelect={c => setProfile({ climate: c })}
            />
          </View>

          {/* Live preview */}
          <View style={styles.goalPreview}>
            <LinearGradient
              colors={['rgba(0,212,255,0.12)', 'rgba(0,119,204,0.06)']}
              style={styles.goalPreviewGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.goalPreviewTitle}>{recommendation.title}</Text>
              <Text style={styles.goalPreviewValue}>{previewGoal}{recommendation.unit}</Text>
              <Text style={styles.goalPreviewSub}>{recommendation.glasses.render({ count: Math.round(previewGoal / 250) })}</Text>

              <View style={styles.factorsRow}>
                {factors.map(f => (
                  <View key={f.label} style={styles.factor}>
                    <Text style={styles.factorLabel}>{f.label}</Text>
                    <Text style={styles.factorValue}>{f.value}</Text>
                    <Text style={styles.factorContrib}>
                      {f.contribution > 0 ? `+${f.contribution}` : f.contribution}ml
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ── App preferences ──────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>{preferences.title}</Text>
          <View style={styles.card}>
            <SettingsRow icon="🔔" label={preferences.reminders} right={<Switch value={true} onValueChange={() => {}} thumbColor={ACCENT} trackColor={{ true: ACCENT_DIM, false: 'rgba(255,255,255,0.1)' }} />} />
            <SettingsRow icon="📳" label={preferences.haptics} right={<Switch value={true} onValueChange={() => {}} thumbColor={ACCENT} trackColor={{ true: ACCENT_DIM, false: 'rgba(255,255,255,0.1)' }} />} />
            <SettingsRow icon="🌙" label={preferences.darkMode} right={<Switch value={true} onValueChange={() => {}} thumbColor={ACCENT} trackColor={{ true: ACCENT_DIM, false: 'rgba(255,255,255,0.1)' }} />} />
          </View>
        </Animated.View>

        {/* ── About ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>{about.title}</Text>
          <View style={styles.card}>
            <SettingsRow icon="📄" label={about.privacy} />
            <SettingsRow icon="📋" label={about.terms} />
            <SettingsRow icon="💬" label={about.support} />
            <SettingsRow icon="⭐" label={about.rate} />
          </View>
        </Animated.View>

        {/* Version */}
        <Text style={styles.version}>{versionText}</Text>
      </ScrollView>
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
  },
  // Profile card
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
  },
  profileGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,212,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileStat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '500',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 19,
  },
  card: {
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  // Fields
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    backgroundColor: 'rgba(7,22,40,0.9)',
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '800',
    color: ACCENT,
    minWidth: 100,
    textAlign: 'center',
  },
  weightUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '600',
  },
  // Chip
  chip: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(7,22,40,0.8)',
    minWidth: 80,
  },
  chipIcon: { fontSize: 20 },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  chipDesc: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.30)',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Goal preview
  goalPreview: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
  },
  goalPreviewGrad: {
    padding: 20,
    alignItems: 'center',
  },
  goalPreviewTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  goalPreviewValue: {
    fontSize: 42,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -1,
    marginBottom: 4,
  },
  goalPreviewSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '500',
    marginBottom: 16,
  },
  factorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  factor: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  factorLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  factorValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  factorContrib: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '700',
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  rowIcon: { fontSize: 18, width: 24 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 24,
  },
})
