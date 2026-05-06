/**
 * LiquidRing — Animated progress ring with glowing cyan accent.
 * Shows hydration percentage with smooth spring animation.
 */
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { ACCENT, SCORE_LOW, SCORE_MID, SCORE_HIGH, SCORE_GREAT, TEXT_SECONDARY } from '@/lib/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface Props {
  percent: number     // 0–100
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export default function LiquidRing({
  percent,
  size = 220,
  strokeWidth = 14,
  label,
  sublabel,
}: Props) {
  const radius      = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const progress = useSharedValue(0)
  const glow     = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(percent / 100, {
      damping: 18,
      stiffness: 80,
      mass: 1.2,
    })
    glow.value = withTiming(percent > 0 ? 1 : 0, { duration: 600, easing: Easing.out(Easing.cubic) })
  }, [percent])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }))

  // Color based on percentage
  function getRingColor(pct: number): string {
    if (pct >= 90) return SCORE_GREAT
    if (pct >= 70) return SCORE_HIGH
    if (pct >= 40) return SCORE_MID
    return SCORE_LOW
  }

  const ringColor = getRingColor(percent)
  const center = size / 2

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow ring behind */}
      <View
        style={[
          styles.glowRing,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            borderColor: ringColor,
            opacity: Math.min(0.35, percent / 200),
          },
        ]}
      />

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ACCENT} stopOpacity="1" />
            <Stop offset="100%" stopColor="#0055ff" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.center}>
        <Text style={[styles.percent, { color: ringColor }]}>
          {Math.round(percent)}%
        </Text>
        {!!label && <Text style={styles.label}>{label}</Text>}
        {!!sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    marginTop: 2,
  },
  sublabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '400',
    marginTop: 2,
  },
})
