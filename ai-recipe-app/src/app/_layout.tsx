import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack, useGlobalSearchParams, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { useEffect, useMemo, useRef, useState } from 'react';

import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/splash-overlay';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { ShoppingListProvider } from '@/context/ShoppingListContext';
import { Colors, Fonts } from '@/constants/theme';
import { ENV } from '@/constants/env';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getHasCompletedCountrySetup, getHasSeenOnboarding, subscribeCountrySetup } from '@/services/onboardingStorage';

import { tokenCache } from '@/utils/clerk-token-cache';
import '../../global.css';

SplashScreen.preventAutoHideAsync();

function normalizeInternalHref(href: string): string {
  const [rawPath, rawQuery] = href.split('?');
  const normalizedPathSegments = rawPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
    .filter((segment) => segment !== 'index');

  const normalizedPath = normalizedPathSegments.length === 0 ? '/' : `/${normalizedPathSegments.join('/')}`;
  if (!rawQuery || rawQuery.length === 0) return normalizedPath;
  return `${normalizedPath}?${rawQuery}`;
}

/**
 * Production-grade auth guard.
 * Single source of truth for auth-based navigation.
 */
function AuthGate() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();
  const lastRedirectAttempt = useRef<{ key: string; at: number } | null>(null);
  const segmentKey = useMemo(() => segments.join('/'), [segments]);
  const inAuthGroup = useMemo(() => segments[0] === '(auth)', [segments]);
  const isOnboarding = useMemo(() => segments[0] === 'onboarding', [segments]);
  const isSelectCountry = useMemo(() => segments[0] === 'select-country', [segments]);
  const isOAuthCallback = useMemo(() => segments[0] === 'oauth-callback', [segments]);
  /** Routes signed-out users may stay on while auth is completing. */
  const isPublicAuthSurface = inAuthGroup || isOnboarding || isOAuthCallback;
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);
  const [countrySetupDone, setCountrySetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getHasSeenOnboarding().then((seen) => {
      if (!cancelled) setSeenOnboarding(seen);
    });
    return () => {
      cancelled = true;
    };
  }, [segmentKey]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setCountrySetupDone(null);
      return;
    }
    void getHasCompletedCountrySetup(userId).then((done) => {
      if (!cancelled) setCountrySetupDone(done);
    });
    const unsubscribe = subscribeCountrySetup((id, done) => {
      if (id === userId) setCountrySetupDone(done);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId, segmentKey]);

  const returnTo = useMemo(() => {
    const raw = searchParams.returnTo;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value !== 'string' || value.length === 0) return null;

    if (!value.startsWith('/') || value.startsWith('//')) return null;

    const normalized = normalizeInternalHref(value);
    const [pathOnly] = normalized.split('?');
    const authPaths = new Set([
      '/sign-in',
      '/sign-up',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/select-country',
      '/onboarding',
    ]);
    if (authPaths.has(pathOnly)) return null;

    return normalized;
  }, [searchParams.returnTo]);

  const currentPathWithQuery = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'returnTo') continue;
      if (typeof value === 'undefined') continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item);
        }
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    const rawHref = query.length > 0 ? `${pathname}?${query}` : pathname;
    return normalizeInternalHref(rawHref);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isLoaded || seenOnboarding === null) return;

    const redirect = (target: string) => {
      const now = Date.now();
      if (
        lastRedirectAttempt.current?.key === target &&
        now - lastRedirectAttempt.current.at < 1500
      ) {
        return;
      }
      lastRedirectAttempt.current = { key: target, at: now };
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace(target as any);
    };

    if (isSignedIn) {
      if (countrySetupDone === null) return;

      if (!countrySetupDone) {
        if (!isSelectCountry) {
          redirect('/select-country');
        }
        return;
      }

      // Country done — leave auth / onboarding / oauth / country pickers for home.
      if (inAuthGroup || isOnboarding || isSelectCountry || isOAuthCallback) {
        redirect(returnTo ?? '/');
      }
      return;
    }

    // Signed out: never bounce oauth-callback mid-handshake.
    if (isOAuthCallback) return;

    if (isSelectCountry) {
      redirect(seenOnboarding ? '/sign-in' : '/onboarding');
      return;
    }

    if (!isPublicAuthSurface) {
      redirect(seenOnboarding ? '/sign-in' : '/onboarding');
    }
  }, [
    isSignedIn,
    isLoaded,
    inAuthGroup,
    isOnboarding,
    isSelectCountry,
    isOAuthCallback,
    isPublicAuthSurface,
    router,
    returnTo,
    currentPathWithQuery,
    segmentKey,
    pathname,
    segments,
    seenOnboarding,
    countrySetupDone,
  ]);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.tint,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: Fonts.display,
          color: colors.text,
        },
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="select-country" options={{ headerShown: false }} />
      <Stack.Screen name="oauth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="recipes" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
    </Stack>
  );
}

function RootNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <FavoritesProvider>
        <ShoppingListProvider>
          <AnimatedSplashOverlay />
          <ClerkLoaded>
            <AuthGate />
          </ClerkLoaded>
        </ShoppingListProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

import React, { Component, ErrorInfo, ReactNode } from 'react';

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught a crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errStyles.errorContainer}>
          <StatusBar barStyle="dark-content" />
          <Text style={errStyles.errorEmoji}>💥</Text>
          <Text style={errStyles.errorTitle}>App Startup Error</Text>
          <Text style={errStyles.errorMessage}>
            An unexpected error occurred during application initialization.
          </Text>
          <View style={errStyles.codeBlock}>
            <Text style={errStyles.codeText}>{this.state.error?.toString() || 'Unknown startup exception'}</Text>
          </View>
          <Text style={errStyles.errorSubMessage}>
            This crash could be caused by malformed environment variables, native module incompatibilities, or a local storage exception.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayoutContent() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Pre-validate the Clerk Publishable Key before passing it to ClerkProvider to prevent render crashes
  const isClerkKeyValid = useMemo(() => {
    const key = ENV.clerkPublishableKey;
    if (!key || typeof key !== 'string') return false;
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
    if (key.includes(' ')) return false;
    return true;
  }, []);

  // Native splash stays up until fonts load; branded AnimatedSplashOverlay then
  // takes over and calls SplashScreen.hideAsync() so there is no blank flash.

  if (!fontsLoaded) {
    return null;
  }

  // Gracefully handle missing or malformed Clerk Publishable Key (prevent instant crash of standalone APKs)
  if (!isClerkKeyValid) {
    return (
      <View style={errStyles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={errStyles.errorEmoji}>⚠️</Text>
        <Text style={errStyles.errorTitle}>Configuration Error</Text>
        <Text style={errStyles.errorMessage}>
          The Clerk Publishable Key is missing or invalid in the application environment variables.
        </Text>
        <Text style={errStyles.errorSubMessage}>
          Current Key Value: <Text style={{ fontWeight: 'bold', color: '#FF3B30' }}>{ENV.clerkPublishableKey ? `${ENV.clerkPublishableKey.substring(0, 15)}...` : 'empty'}</Text>
        </Text>
        <Text style={errStyles.errorSubMessage}>
          Please make sure you have created a <Text style={{ fontWeight: 'bold' }}>.env</Text> file in the root of the project with:
        </Text>
        <View style={errStyles.codeBlock}>
          <Text style={errStyles.codeText}>EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</Text>
        </View>
        <Text style={errStyles.errorSubMessage}>
          If you are building an APK with EAS, ensure that this environment variable is configured correctly without typos (e.g. trailing characters like &apos;$&apos;) in your EAS build profile or Secrets.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={ENV.clerkPublishableKey} tokenCache={tokenCache}>
      <PreferencesProvider>
        <RootNavigation />
      </PreferencesProvider>
    </ClerkProvider>
  );
}

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <RootLayoutContent />
    </RootErrorBoundary>
  );
}

const errStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? undefined : 'sans-serif-condensed',
    fontWeight: 'bold',
    color: '#0A0116',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B6575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorSubMessage: {
    fontSize: 14,
    color: '#6B6575',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#EDE7FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8CFFF',
    width: '100%',
    marginBottom: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#8966FA',
  },
});
