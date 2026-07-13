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

import { AnimatedSplashOverlay } from '@/components/animated-icon';
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

      if (inAuthGroup || isOnboarding || isSelectCountry) {
        redirect(returnTo ?? '/');
      }
      return;
    }

    if (isSelectCountry) {
      redirect(seenOnboarding ? '/sign-in' : '/onboarding');
      return;
    }

    if (!isOnboarding && !inAuthGroup) {
      redirect(seenOnboarding ? '/sign-in' : '/onboarding');
    }
  }, [
    isSignedIn,
    isLoaded,
    inAuthGroup,
    isOnboarding,
    isSelectCountry,
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      if (!ENV.clerkPublishableKey) {
        void SplashScreen.hideAsync();
      }
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Gracefully handle missing Clerk Publishable Key (prevent instant crash of standalone APKs)
  if (!ENV.clerkPublishableKey) {
    return (
      <View style={errStyles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={errStyles.errorEmoji}>⚠️</Text>
        <Text style={errStyles.errorTitle}>Configuration Error</Text>
        <Text style={errStyles.errorMessage}>
          The Clerk Publishable Key is missing from the application environment variables.
        </Text>
        <Text style={errStyles.errorSubMessage}>
          Please make sure you have created a <Text style={{ fontWeight: 'bold' }}>.env</Text> file in the root of the project with:
        </Text>
        <View style={errStyles.codeBlock}>
          <Text style={errStyles.codeText}>EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</Text>
        </View>
        <Text style={errStyles.errorSubMessage}>
          If you are building an APK with EAS, ensure that this environment variable is configured in your EAS Secrets or built with the correct local environment settings.
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
    fontFamily: Platform.OS === 'ios' ? 'Fraunces_600SemiBold' : 'sans-serif-condensed',
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
