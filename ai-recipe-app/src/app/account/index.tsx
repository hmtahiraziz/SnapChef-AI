import { useAuth, useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View, Text } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPill } from '@/components/ui/glass-pill';
import { SettingsRow } from '@/features/settings';
import { SnapChef, Spacing } from '@/constants/theme';

export default function AccountScreen() {
  const theme = SnapChef;
  const { user } = useUser();
  const { signOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  const email = user?.primaryEmailAddress?.emailAddress ?? 'Not available';
  const hasPassword = Boolean(user?.passwordEnabled);

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

    setUploading(true);
    try {
      const response = await fetch(result.assets[0].uri);
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

  const saveName = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      Alert.alert('Saved', 'Your display name has been updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update name.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordHelp = () => {
    Alert.alert(
      'Password help',
      hasPassword
        ? 'To reset your password, sign out, then use Forgot password on the sign-in screen.'
        : 'This account signs in with a provider (for example Google), so password is managed there.',
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await signOut();
            } finally {
              router.replace('/sign-in' as never);
            }
          })();
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <Text style={styles.lead}>Manage how you sign in to SnapChef AI.</Text>

      <GlassCard tint="lavender">
        <Text style={styles.section}>Display name</Text>
        <View style={styles.nameRow}>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={theme.muted}
            style={styles.input}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor={theme.muted}
            style={styles.input}
          />
        </View>
        <GlassPill label="Save name" variant="primary" loading={saving} onPress={() => void saveName()} />
        <GlassPill
          label="Change photo"
          variant="outline"
          loading={uploading}
          onPress={() => void uploadAvatar()}
        />
      </GlassCard>

      <GlassCard tint="white" padded={false}>
        <View style={styles.pad}>
          <SettingsRow label="Email" value={email} showChevron={false} />
          <SettingsRow
            label="Password"
            value={hasPassword ? 'Enabled' : 'Managed by sign-in provider'}
            onPress={handlePasswordHelp}
          />
        </View>
      </GlassCard>

      <GlassCard tint="peach" padded={false}>
        <View style={styles.pad}>
          <SettingsRow label="Sign out" destructive onPress={handleSignOut} />
        </View>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, color: SnapChef.muted, marginBottom: Spacing.one },
  section: { fontSize: 13, fontWeight: '700', color: SnapChef.ink },
  nameRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SnapChef.fieldBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    color: SnapChef.ink,
    fontSize: 15,
  },
  pad: { paddingHorizontal: Spacing.three },
});
