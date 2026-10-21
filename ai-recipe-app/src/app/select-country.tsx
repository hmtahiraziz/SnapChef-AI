import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

import { BrandMark } from '@/components/brand-mark';
import { CountryDropdown } from '@/features/settings';
import { Fonts, Radii, SnapChef, Spacing } from '@/constants/theme';
import { usePreferences } from '@/context/PreferencesContext';
import { DEFAULT_COUNTRY } from '@/constants/countries';
import { setHasCompletedCountrySetup } from '@/services/onboardingStorage';
import { BRAND_NAME } from '@/features/auth';

const GRADIENT = ['#FAFAFD', '#EDE7FF'] as const;

export default function SelectCountryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useAuth();
  const { country, setCountry } = usePreferences();
  const [selected, setSelected] = useState(country || DEFAULT_COUNTRY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(GRADIENT[0]).catch(() => {});
  }, []);

  const onContinue = async () => {
    if (!selected || saving) return;
    if (!userId) {
      router.replace('/sign-in');
      return;
    }
    setSaving(true);
    try {
      await setCountry(selected);
      await setHasCompletedCountrySetup(userId, true);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  const bottomPad = Math.max(insets.bottom, 16) + 12;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.2, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <BrandMark size={40} tone="light" />
          </View>

          <Text style={styles.title}>Choose your cuisine</Text>
          <Text style={styles.body}>
            We&apos;ll prioritize recipes and flavors for this country. Pick Others if yours
            isn&apos;t listed — you can change this anytime in Settings.
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Country / cuisine</Text>
          <CountryDropdown value={selected} onChange={setSelected} />
        </View>

        <View style={styles.spacer} />
      </View>

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <Pressable
          onPress={() => void onContinue()}
          disabled={!selected || saving}
          accessibilityRole="button"
          accessibilityLabel="Continue to home"
          style={({ pressed }) => [
            styles.ctaWrap,
            (!selected || saving) && styles.ctaDisabled,
            pressed && selected && !saving && styles.ctaPressed,
          ]}
        >
          <LinearGradient
            colors={[SnapChef.primary, '#603FEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            {saving ? (
              <ActivityIndicator color={SnapChef.white} />
            ) : (
              <Text style={styles.ctaText}>Continue</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GRADIENT[0],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    fontWeight: '800',
    color: SnapChef.primary,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontFamily: Fonts.display,
    fontWeight: '800',
    color: SnapChef.ink,
    lineHeight: 36,
  },
  body: {
    fontSize: 15,
    fontFamily: Fonts.body,
    fontWeight: '500',
    color: SnapChef.muted,
    lineHeight: 22,
    maxWidth: 340,
  },
  fieldBlock: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.bodyBold,
    fontWeight: '700',
    color: SnapChef.ink,
    opacity: 0.88,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.four,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  ctaWrap: {
    borderRadius: Radii.pill,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  cta: {
    minHeight: 56,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: SnapChef.white,
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
    fontWeight: '800',
  },
});
