import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Stack, useNavigationContainerRef, usePathname } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import * as Sentry from '@sentry/react-native'

const routingInstrumentation = Sentry.reactNavigationIntegration()

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  integrations: [routingInstrumentation],
  tracesSampleRate: 0,
})

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter'
import { ThemeProvider, DarkTheme } from '@react-navigation/native'

import { HydrationProvider } from '@/contexts/HydrationContext'
import { ToastProvider } from '@/contexts/ToastContext'
import OfflineBanner from '@/components/OfflineBanner'
import { Text } from '@/components/ui/Text'
import { BG } from '@/lib/theme'
import { IntlayerProvider } from 'react-native-intlayer'

// ─── Error boundary ───────────────────────────────────────────────────────────

function ErrorFallback() {
  return (
    <View style={eb.container}>
      <Text style={eb.title}>Something went wrong</Text>
      <Text style={eb.subtitle}>Please close and reopen the app.</Text>
    </View>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info)
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}

const eb = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
})

// ─── Theme ────────────────────────────────────────────────────────────────────

const customDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: BG },
}

// ─── Screen tracker ───────────────────────────────────────────────────────────

function ScreenTracker() {
  const pathname = usePathname()
  useEffect(() => {
    console.log('[Screen]', pathname)
  }, [pathname])
  return null
}

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  const navigationRef = useNavigationContainerRef()
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  useEffect(() => {
    if (navigationRef.current) {
      routingInstrumentation.registerNavigationContainer(navigationRef)
    }
  }, [navigationRef])

  // Show blank dark screen while fonts load
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: BG }} />
  }

  return (
    <ErrorBoundary>
      <IntlayerProvider>
        <QueryClientProvider client={queryClient}>
          <HydrationProvider>
            <ToastProvider>
              <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
                <BottomSheetModalProvider>
                  <StatusBar
                    style="light"
                    translucent={Platform.OS === 'android'}
                    backgroundColor={Platform.OS === 'android' ? BG : undefined}
                  />
                  <ThemeProvider value={customDarkTheme}>
                    <View style={{ flex: 1, backgroundColor: BG }}>
                      <Stack
                        ref={navigationRef}
                        screenOptions={{
                          headerShown: false,
                          animation: 'fade',
                          contentStyle: { backgroundColor: BG },
                        }}
                      >
                        {/* Landing page — always visible */}
                        <Stack.Screen name="index" />

                        {/* Onboarding — no auth needed, goes straight to app */}
                        <Stack.Screen name="(onboarding)" />

                        {/* Main app tabs */}
                        <Stack.Screen name="(tabs)" />

                        {/* Static screens */}
                        <Stack.Screen name="privacy" />
                        <Stack.Screen name="terms" />
                        <Stack.Screen name="upgrade" />
                        <Stack.Screen name="support" />
                        <Stack.Screen name="settings" />
                      </Stack>
                      <ScreenTracker />
                      <OfflineBanner />
                    </View>
                  </ThemeProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ToastProvider>
        </HydrationProvider>
      </QueryClientProvider>
      </IntlayerProvider>
    </ErrorBoundary>
  )
}

export default Sentry.wrap(RootLayout)
