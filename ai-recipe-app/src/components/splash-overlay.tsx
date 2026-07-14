import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Fonts, SnapChef } from '@/constants/theme';

/** Total target ≈ 1.2–1.4s (enter + hold + exit) — under 1.5s production bar. */
const ENTER_MS = 320;
const HOLD_MS = 280;
const EXIT_MS = 260;
const TITLE_DELAY_MS = 60;
const TITLE_MS = 260;

/**
 * Production branded splash — shown once JS is ready.
 * Uses RN Animated only (no Reanimated Keyframes) for release-APK stability.
 */
export function AnimatedSplashOverlay() {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(10)).current;

  const logoSize = Math.min(148, Math.round(Math.min(width, height) * 0.34));

  useEffect(() => {
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (cancelled) return;

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(TITLE_DELAY_MS),
          Animated.parallel([
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: TITLE_MS,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(titleTranslate, {
              toValue: 0,
              duration: TITLE_MS,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(({ finished }) => {
        if (!finished || cancelled) return;

        holdTimer = setTimeout(() => {
          if (cancelled) return;
          Animated.timing(opacity, {
            toValue: 0,
            duration: EXIT_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }).start(({ finished: exitDone }) => {
            if (exitDone && !cancelled) setVisible(false);
          });
        }, HOLD_MS);
      });
    };

    void run();

    return () => {
      cancelled = true;
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [logoOpacity, logoScale, opacity, titleOpacity, titleTranslate]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { opacity }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <LinearGradient
        colors={['#2A1F4A', SnapChef.primary, '#6B4FD8']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize * 0.28,
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={{ width: logoSize, height: logoSize, borderRadius: logoSize * 0.28 }}
            contentFit="cover"
            transition={0}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
            alignItems: 'center',
            marginTop: Math.max(16, Math.round(height * 0.022)),
            paddingHorizontal: 24,
          }}>
          <Text style={styles.brand}>SnapChef AI</Text>
          <Text style={styles.tagline}>Recipes from what’s in your kitchen</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    overflow: 'hidden',
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
    color: SnapChef.white,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
    maxWidth: 280,
  },
});
