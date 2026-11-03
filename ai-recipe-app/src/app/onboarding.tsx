import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BrandMark } from '@/components/brand-mark';
import { AUTH_COPY, BRAND_NAME, GetStartedButton } from '@/features/auth';
import { setHasSeenOnboarding } from '@/services/onboardingStorage';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isShort = height < 720;
  const isNarrow = width < 360;

  const heroHeight = isTablet
    ? Math.min(420, height * 0.42)
    : isShort
      ? Math.min(220, height * 0.3)
      : Math.min(300, height * 0.36);

  const headingSize = isTablet ? 44 : isNarrow ? 30 : isShort ? 32 : 38;
  const decoW = isTablet ? 148 : Math.min(120, width * 0.3);
  const decoH = isTablet ? 116 : Math.min(96, width * 0.24);

  // Clear Android 3-button / gesture nav: inset + extra breathing room.
  const bottomPad = Math.max(insets.bottom, 12) + 20;

  const finishOnboarding = useCallback(
    async (mode: 'sign-in' | 'sign-up') => {
      await setHasSeenOnboarding(true);
      router.replace({
        pathname: '/sign-in',
        params: mode === 'sign-up' ? { mode: 'sign-up' } : undefined,
      });
    },
    [router]
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BrandMark size={isTablet ? 40 : 32} tone="light" />
          <Text style={styles.brand}>{BRAND_NAME}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPad },
            isShort && styles.scrollContentShort,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.hero, { height: heroHeight }]}>
            <Image
              source={require('@/assets/images/onboarding-chef.png')}
              style={styles.heroImage}
              resizeMode="contain"
              accessibilityLabel={`${BRAND_NAME} chef illustration`}
            />
          </View>

          <View style={styles.copyBlock}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  { fontSize: headingSize, lineHeight: headingSize + 4 },
                ]}>
                {AUTH_COPY.onboardingTitle}
                <Text style={{ fontSize: headingSize - 6 }}>🔥</Text>
              </Text>

              <View
                style={[
                  styles.deco,
                  {
                    width: decoW,
                    height: decoH,
                  },
                ]}>
                <Image
                  source={require('@/assets/images/food-card-deco.png')}
                  style={styles.decoImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <Text style={[styles.body, isShort && styles.bodyShort]}>
              {AUTH_COPY.onboardingBody}
            </Text>
            <Text style={styles.brandAccent}>{BRAND_NAME}</Text>
            <Text style={styles.tagline}>{AUTH_COPY.tagline}</Text>
          </View>

          <View style={styles.ctaBlock}>
            <GetStartedButton
              onPress={() => void finishOnboarding('sign-up')}
              accessibilityLabel={`Get Started with ${BRAND_NAME}`}
            />

            <TouchableOpacity
              onPress={() => void finishOnboarding('sign-in')}
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Log In"
              style={styles.loginLink}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginBold}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E8E4EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A0116',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  scrollContentShort: {
    justifyContent: 'flex-start',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  copyBlock: {
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontWeight: '800',
    color: '#0A0116',
  },
  deco: {
    overflow: 'hidden',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#8966FA',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  decoImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6575',
    maxWidth: '94%',
  },
  bodyShort: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
  },
  brandAccent: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#8966FA',
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B6575',
  },
  ctaBlock: {
    marginTop: 28,
    gap: 14,
    paddingTop: 4,
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B6575',
    textAlign: 'center',
  },
  loginBold: {
    fontWeight: '800',
    color: '#0A0116',
  },
});
