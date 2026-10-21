import { useUser } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { Fonts, Spacing } from '@/constants/theme';
import { getCountryFlag } from '@/constants/countries';
import { usePreferences } from '@/context/PreferencesContext';
import { ProfileHeader } from '@/features/profile';
import { SectionLabel, SettingsRow } from '@/features/settings';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { user } = useUser();
  const { country } = usePreferences();
  const theme = useTheme();

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.fullName?.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'Chef';
  const email = user?.primaryEmailAddress?.emailAddress ?? 'Signed in';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString() ??
    null;
  const versionLabel = buildNumber
    ? `SnapChef AI • Version ${appVersion} (Build ${buildNumber})`
    : `SnapChef AI • Version ${appVersion}`;

  const cuisineSubtitle = `${country} ${getCountryFlag(country)}`.trim();

  return (
    <ScreenContainer
      scroll
      gradient
      header={
        <View>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.bodyBold }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
            Account and preferences.
          </Text>
        </View>
      }>
      <ProfileHeader
        displayName={displayName}
        email={email}
        imageUrl={user?.imageUrl}
        greeting="Hello"
      />

      <View style={styles.section}>
        <SectionLabel>CULINARY PREFERENCES</SectionLabel>
        <GlassCard tint="white" padded={false} style={styles.card}>
          <SettingsRow
            icon="book-outline"
            iconColor="#7B5CFA"
            iconBg="rgba(137, 102, 250, 0.14)"
            label="Cuisine"
            subtitle={cuisineSubtitle}
            onPress={() => router.push('/preferences/cuisine' as Href)}
            showDivider={false}
          />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <SectionLabel>ACCOUNT</SectionLabel>
        <GlassCard tint="white" padded={false} style={styles.card}>
          <SettingsRow
            icon="person-outline"
            iconColor="#3B82F6"
            iconBg="rgba(59, 130, 246, 0.14)"
            label="Account Security"
            onPress={() => router.push('/account' as Href)}
            showDivider={false}
          />
        </GlassCard>
      </View>

      <Text style={[styles.version, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
        {versionLabel}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  section: { width: '100%' },
  card: { width: '100%' },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
});
