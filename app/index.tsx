import { useEffect } from 'react'
import { View, Pressable, StyleSheet, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useIntlayer } from 'react-intlayer'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/Text'
import { ACCENT, ACCENT_DIM, ACCENT_BORDER, BG, BORDER, SURFACE2 } from '@/lib/theme'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'

const { width: SW, height: SH } = Dimensions.get('window')

export default function LandingScreen() {
  const insets = useSafeAreaInsets()
  const { header, hero, features, footer } = useIntlayer('landing')

  const headerY       = useSharedValue(-20)
  const headerOpacity = useSharedValue(0)
  const heroScale     = useSharedValue(0.88)
  const heroOpacity   = useSharedValue(0)
  const featuresY     = useSharedValue(30)
  const featuresOp    = useSharedValue(0)
  const footerOp      = useSharedValue(0)
  const orbOneY       = useSharedValue(0)
  const orbTwoY       = useSharedValue(0)
  const dropScale     = useSharedValue(0.7)
  const dropOpacity   = useSharedValue(0)
  const glowPulse     = useSharedValue(0.4)

  useEffect(() => {
    headerY.value       = withSpring(0, { damping: 16, stiffness: 120 })
    headerOpacity.value = withTiming(1, { duration: 500 })

    dropScale.value     = withDelay(100, withSpring(1, { damping: 12, stiffness: 80 }))
    dropOpacity.value   = withDelay(100, withTiming(1, { duration: 500 }))

    heroScale.value     = withDelay(250, withSpring(1, { damping: 14, stiffness: 100 }))
    heroOpacity.value   = withDelay(250, withTiming(1, { duration: 550 }))

    featuresY.value     = withDelay(450, withSpring(0, { damping: 16, stiffness: 110 }))
    featuresOp.value    = withDelay(450, withTiming(1, { duration: 480 }))

    footerOp.value      = withDelay(650, withTiming(1, { duration: 500 }))

    orbOneY.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 3600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0,   { duration: 3600, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    )
    orbTwoY.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 2900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0,  { duration: 2900, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    )

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    )
  }, [])

  const headerStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: headerY.value }], opacity: headerOpacity.value }))
  const heroStyle     = useAnimatedStyle(() => ({ transform: [{ scale: heroScale.value }], opacity: heroOpacity.value }))
  const featuresStyle = useAnimatedStyle(() => ({ transform: [{ translateY: featuresY.value }], opacity: featuresOp.value }))
  const footerStyle   = useAnimatedStyle(() => ({ opacity: footerOp.value }))
  const orbOneStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: orbOneY.value }] }))
  const orbTwoStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: orbTwoY.value }] }))
  const dropStyle     = useAnimatedStyle(() => ({ transform: [{ scale: dropScale.value }], opacity: dropOpacity.value }))
  const glowStyle     = useAnimatedStyle(() => ({ opacity: glowPulse.value }))

  return (
    <View style={s.root}>
      {/* Ocean gradient bg */}
      <LinearGradient
        colors={['#020c18', '#041830', '#020c18']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating orbs */}
      <Animated.View pointerEvents="none" style={[s.orbOne, orbOneStyle]} />
      <Animated.View pointerEvents="none" style={[s.orbTwo, orbTwoStyle]} />

      {/* ── Header bar ── */}
      <Animated.View style={[s.headerOuter, { marginTop: insets.top + 10 }, headerStyle]}>
        <View style={s.headerBar}>
          <View style={s.headerLeft}>
            <LinearGradient colors={[ACCENT, '#0077ff']} style={s.headerLogo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={s.headerLogoText}>💧</Text>
            </LinearGradient>
            <Text style={s.headerAppName}>{APP_NAME}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(onboarding)')}
            style={({ pressed }) => [s.headerCta, pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] }]}
          >
            <LinearGradient colors={[ACCENT, '#0077ff']} style={s.headerCtaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.headerCtaText}>{header.getStarted.render()}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Hero: giant water drop ── */}
      <Animated.View style={[s.heroWrap, heroStyle]}>
        {/* Glow behind drop */}
        <Animated.View style={[s.dropGlow, glowStyle]} />
        <Animated.View style={[s.dropWrap, dropStyle]}>
          <Text style={s.dropEmoji}>💧</Text>
        </Animated.View>
        <Text style={s.heroTitle}>{APP_NAME}</Text>
        <Text style={s.heroTagline}>{hero.tagline.render()}</Text>
        <Text style={s.heroDesc}>
          {hero.description.render()}
        </Text>
      </Animated.View>

      {/* ── Features grid ── */}
      <Animated.View style={[s.featuresWrap, featuresStyle]}>
        {Array.isArray(features) && features.map((feat: any, i: number) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIconWrap}>
              <Text style={{ fontSize: 18 }}>{feat.icon}</Text>
            </View>
            <View style={s.featureTextWrap}>
              <Text style={s.featureTitle}>{feat.title.render()}</Text>
              <Text style={s.featureDesc}>{feat.desc.render()}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* ── Footer CTA ── */}
      <Animated.View style={[s.footer, footerStyle, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          style={({ pressed }) => [s.mainCta, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push('/(onboarding)')}
        >
          <LinearGradient colors={[ACCENT, '#0077ff']} style={s.mainCtaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={s.mainCtaText}>{footer.cta.render()}</Text>
          </LinearGradient>
        </Pressable>
        <Text style={s.legal}>{footer.legal.render()}</Text>
      </Animated.View>
    </View>
  )
}


const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Orbs
  orbOne: {
    position: 'absolute', right: -SW * 0.25, top: SH * 0.06,
    width: SW * 0.72, height: SW * 0.72, borderRadius: 999,
    backgroundColor: 'rgba(0,212,255,0.07)',
  },
  orbTwo: {
    position: 'absolute', left: -SW * 0.32, bottom: SH * 0.18,
    width: SW * 0.66, height: SW * 0.66, borderRadius: 999,
    backgroundColor: 'rgba(0,119,204,0.06)',
  },

  // Header
  headerOuter: { alignItems: 'center', paddingHorizontal: 20 },
  headerBar: {
    width: '95%', height: 56, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingLeft: 6, paddingRight: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerLogo: { width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  headerLogoText: { fontSize: 16 },
  headerAppName: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.1 },
  headerCta: { borderRadius: 999, overflow: 'hidden' },
  headerCtaGrad: { paddingHorizontal: 18, paddingVertical: 9 },
  headerCtaText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },

  // Hero
  heroWrap: { paddingHorizontal: 24, paddingTop: 32, gap: 10, alignItems: 'flex-start' },
  dropGlow: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(0,212,255,0.20)',
    position: 'absolute', top: 20, left: SW / 2 - 80,
    alignSelf: 'center',
  },
  dropWrap: { alignSelf: 'center', marginBottom: 8 },
  dropEmoji: { fontSize: 72, textAlign: 'center' },
  heroTitle: {
    color: '#fff', fontSize: 38, fontWeight: '800', letterSpacing: -1, lineHeight: 44,
  },
  heroTagline: { color: ACCENT, fontSize: 16, fontWeight: '600', letterSpacing: 0.1 },
  heroDesc: {
    color: 'rgba(255,255,255,0.50)', fontSize: 14, lineHeight: 22, maxWidth: 340, marginTop: 4,
  },

  // Features
  featuresWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 10 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(7,22,40,0.8)',
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
  },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center',
  },
  featureTextWrap: { flex: 1, gap: 2 },
  featureTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  featureDesc: { color: 'rgba(255,255,255,0.40)', fontSize: 12 },

  // Footer
  footer: { paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  mainCta: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  mainCtaGrad: { paddingVertical: 18, alignItems: 'center' },
  mainCtaText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  legal: { color: 'rgba(255,255,255,0.28)', fontSize: 12, textAlign: 'center' },
})
