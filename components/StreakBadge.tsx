/**
 * StreakBadge — Animated fire streak display with milestone celebration.
 */
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { SURFACE2, WARNING, BORDER } from '@/lib/theme'
import { STREAK_MILESTONES } from '@/lib/constants'

interface Props {
  streak: number
  compact?: boolean
}

export default function StreakBadge({ streak, compact = false }: Props) {
  const fireScale = useSharedValue(1)
  const fireOpacity = useSharedValue(1)
  const glowOpacity = useSharedValue(0.4)

  const isMilestone = STREAK_MILESTONES.includes(streak) && streak > 0
  const isActive    = streak > 0

  useEffect(() => {
    if (!isActive) return

    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.sine) }),
        withTiming(1.0,  { duration: 600, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      true
    )

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.2, { duration: 800 }),
      ),
      -1,
      true
    )
  }, [isActive])

  // Milestone burst
  useEffect(() => {
    if (isMilestone) {
      fireScale.value = withSequence(
        withSpring(1.5, { damping: 6, stiffness: 200 }),
        withSpring(1.0, { damping: 10 }),
      )
    }
  }, [streak])

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  if (compact) {
    return (
      <View style={styles.compact}>
        <Animated.Text style={[styles.fireCompact, fireStyle]}>🔥</Animated.Text>
        <Text style={styles.countCompact}>{streak}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.badge, isMilestone && styles.badgeMilestone]}>
      {/* Glow */}
      {isActive && (
        <Animated.View
          style={[styles.glow, glowStyle]}
          pointerEvents="none"
        />
      )}

      <Animated.Text style={[styles.fire, fireStyle]}>
        {isActive ? '🔥' : '💧'}
      </Animated.Text>

      <View>
        <Text style={[styles.count, isActive && { color: WARNING }]}>
          {streak}
        </Text>
        <Text style={styles.label}>day streak</Text>
      </View>

      {isMilestone && (
        <View style={styles.milestoneBadge}>
          <Text style={styles.milestoneText}>🏆 Milestone!</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SURFACE2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'visible',
  },
  badgeMilestone: {
    borderColor: WARNING,
    borderWidth: 1.5,
  },
  glow: {
    position: 'absolute',
    inset: -4,
    borderRadius: 20,
    backgroundColor: WARNING,
    zIndex: -1,
  } as any,
  fire: {
    fontSize: 28,
  },
  count: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.40)',
    fontWeight: '500',
  },
  milestoneBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: WARNING,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  // Compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fireCompact: {
    fontSize: 16,
  },
  countCompact: {
    fontSize: 15,
    fontWeight: '700',
    color: WARNING,
  },
})
