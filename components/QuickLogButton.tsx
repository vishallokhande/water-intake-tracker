/**
 * QuickLogButton — One-tap water logging with haptics and ripple animation.
 */
import React, { useCallback } from 'react'
import { Pressable, View, StyleSheet, Platform } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { ACCENT, ACCENT_DIM, ACCENT_GLOW, SURFACE2, BORDER, ACCENT_BORDER } from '@/lib/theme'
import type { BeverageType } from '@/lib/hydrationEngine'
import { BEVERAGE_ICONS } from '@/lib/hydrationEngine'

interface QuickLogButtonProps {
  ml: number
  beverageType: BeverageType
  onLog: (ml: number, type: BeverageType) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function QuickLogButton({ ml, beverageType, onLog, size = 'md' }: QuickLogButtonProps) {
  const scale    = useSharedValue(1)
  const opacity  = useSharedValue(1)
  const ripple   = useSharedValue(0)

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    scale.value = withSequence(
      withSpring(0.91, { damping: 10, stiffness: 300 }),
      withSpring(1.06, { damping: 8,  stiffness: 250 }),
      withSpring(1.0,  { damping: 12, stiffness: 200 }),
    )

    ripple.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 200 }),
    )

    onLog(ml, beverageType)
  }, [ml, beverageType, onLog])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: ripple.value * 0.4,
    transform: [{ scale: 0.5 + ripple.value * 0.5 }],
  }))

  const sizeMap = {
    sm: { width: 72, height: 72, fontSize: 13, subSize: 10, iconSize: 18 },
    md: { width: 90, height: 90, fontSize: 16, subSize: 11, iconSize: 22 },
    lg: { width: 110, height: 110, fontSize: 18, subSize: 13, iconSize: 26 },
  }
  const dim = sizeMap[size]

  return (
    <Animated.View style={[animStyle]}>
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        <View style={[styles.button, { width: dim.width, height: dim.height, borderRadius: dim.width / 2 }]}>
          {/* Ripple ring */}
          <Animated.View
            style={[
              styles.ripple,
              { width: dim.width + 30, height: dim.height + 30, borderRadius: (dim.width + 30) / 2 },
              rippleStyle,
            ]}
          />
          <Text style={{ fontSize: dim.iconSize }}>{BEVERAGE_ICONS[beverageType]}</Text>
          <Text style={[styles.ml, { fontSize: dim.fontSize }]}>{ml}</Text>
          <Text style={[styles.unit, { fontSize: dim.subSize }]}>ml</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: SURFACE2,
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'visible',
  } as any,
  ripple: {
    position: 'absolute',
    backgroundColor: ACCENT,
    zIndex: -1,
  },
  ml: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unit: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
})
