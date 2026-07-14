import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { CountryDropdown } from '@/features/settings';
import { SnapChef, Spacing } from '@/constants/theme';
import { usePreferences } from '@/context/PreferencesContext';
import { DEFAULT_COUNTRY } from '@/constants/countries';
import { setHasCompletedCountrySetup } from '@/services/onboardingStorage';
import { BRAND_NAME } from '@/features/auth';

export default function SelectCountryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useAuth();
  const { country, setCountry } = usePreferences();
  const [selected, setSelected] = useState(country || DEFAULT_COUNTRY);
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!selected || saving) return;
    if (!userId) {
      // Session should exist; if not, AuthGate will send them to sign-in.
      router.replace('/sign-in');
      return;
    }
    setSaving(true);
    try {
      await setCountry(selected);
      await setHasCompletedCountrySetup(userId, true);
      // AuthGate also reacts to countrySetupDone; replace home for snappy UX.
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 16 },
      ]}>
      <LinearGradient
        colors={['#FAFAFD', '#EDE7FF']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.card}>
        <View style={styles.brandRow}>
          <BrandMark size={36} tone="light" />
          <Text style={styles.eyebrow}>{BRAND_NAME}</Text>
        </View>
        <Text style={styles.title}>Choose your cuisine</Text>
        <Text style={styles.body}>
          We&apos;ll prioritize recipes and flavors for this country. Pick Others if yours
          isn&apos;t listed — you can change this anytime in Settings.
        </Text>

        <Text style={styles.label}>Country / cuisine</Text>
        <CountryDropdown value={selected} onChange={setSelected} maxListHeight={280} />

        <Pressable
          onPress={() => void onContinue()}
          disabled={!selected || saving}
          accessibilityRole="button"
          accessibilityLabel="Continue to home"
          style={({ pressed }) => [
            styles.ctaWrap,
            (!selected || saving) && styles.ctaDisabled,
            pressed && selected && !saving && styles.ctaPressed,
          ]}>
          <LinearGradient
            colors={[SnapChef.primary, '#603FEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}>
            <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Continue'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    padding: 22,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: SnapChef.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: SnapChef.ink,
    lineHeight: 32,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: SnapChef.muted,
    lineHeight: 20,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: SnapChef.ink,
    opacity: 0.85,
    marginTop: 4,
  },
  ctaWrap: {
    marginTop: 12,
    borderRadius: 999,
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
    transform: [{ scale: 0.98 }],
  },
  cta: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
