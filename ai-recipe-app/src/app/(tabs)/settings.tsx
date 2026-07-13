import { useAuth, useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { SnapChef, Spacing } from '@/constants/theme';
import { usePreferences } from '@/context/PreferencesContext';
import { ProfileHeader } from '@/features/profile';
import { SettingsRow } from '@/features/settings';

import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { country, theme: themePreference } = usePreferences();
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.fullName?.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'Chef';
  const email = user?.primaryEmailAddress?.emailAddress ?? 'Signed in';

  const themeLabel =
    themePreference === 'system'
      ? 'System'
      : themePreference === 'dark'
        ? 'Dark'
        : 'Light';

  const uploadAvatar = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      await user.setProfileImage({ file: blob as unknown as File });
      Alert.alert('Updated', 'Your profile photo has been updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update profile photo.';
      Alert.alert('Upload failed', message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await signOut();
            router.replace('/sign-in');
          })();
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll gradient>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Account, preferences, and sign out.</Text>

      <ProfileHeader
        displayName={displayName}
        email={email}
        imageUrl={user?.imageUrl}
        greeting="Hello"
        onPressAvatar={() => void uploadAvatar()}
        uploading={uploading}
      />

      <GlassCard tint="white" padded={false}>
        <View style={styles.settingsPad}>
          <SettingsRow
            label="Cuisine"
            value={country}
            onPress={() => router.push('/preferences/cuisine' as Href)}
          />
          <SettingsRow
            label="Appearance"
            value={themeLabel}
            onPress={() => router.push('/preferences/appearance' as Href)}
          />
          <SettingsRow label="Account" onPress={() => router.push('/account' as Href)} />
        </View>
      </GlassCard>

      <Pressable
        onPress={handleSignOut}
        style={[
          styles.signOut,
          {
            backgroundColor: isDark ? 'rgba(198,40,40,0.08)' : 'rgba(255,255,255,0.7)',
            borderColor: isDark ? 'rgba(198,40,40,0.45)' : 'rgba(198,40,40,0.35)',
          },
        ]}
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: Spacing.one },
  settingsPad: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  signOut: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  signOutText: { color: '#c62828', fontWeight: '700', fontSize: 15 },
});
