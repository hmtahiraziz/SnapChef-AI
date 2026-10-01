import { useAuth, useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View, Text } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPill } from '@/components/ui/glass-pill';
import { SettingsRow } from '@/features/settings';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clearShoppingList } from '@/services/shoppingListStorage';
import { writeFavorites } from '@/services/favoritesStorage';

export default function AccountScreen() {
  const theme = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const performDeleteAccount = async () => {
    if (!user || deleting) return;
    setDeleting(true);
    try {
      await user.delete();
      try {
        await writeFavorites([]);
        await clearShoppingList();
      } catch {
        // Local cleanup is best-effort after the Clerk account is gone.
      }
      try {
        await signOut();
      } catch {
        // Session may already be invalidated after delete.
      }
      router.replace('/sign-in' as never);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not delete your account. Please try again.';
      Alert.alert('Delete failed', message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your SnapChef AI account and cloud data tied to it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirm deletion', 'Are you sure you want to permanently delete your account?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes, delete',
                style: 'destructive',
                onPress: () => {
                  void performDeleteAccount();
                },
              },
            ]);
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <Text style={[styles.lead, { color: theme.textSecondary }]}>Manage how you sign in to SnapChef AI.</Text>

      <GlassCard tint="lavender">
        <Text style={styles.section}>Display name</Text>
        <View style={styles.nameStack}>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#6B6575"
              selectionColor="#8966FA"
              style={styles.input}
            />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#6B6575"
              selectionColor="#8966FA"
              style={styles.input}
            />
          </View>
        </View>
        <GlassPill
          label="Save name"
          variant="primary"
          labelColor="#0A0116"
          loading={saving}
          onPress={() => void saveName()}
        />
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
          <SettingsRow
            label="Privacy Policy"
            onPress={() => router.push('/legal/privacy' as Href)}
          />
        </View>
      </GlassCard>

      <GlassCard tint="peach" padded={false}>
        <View style={styles.pad}>
          <SettingsRow label="Sign out" destructive onPress={handleSignOut} />
          <SettingsRow
            label={deleting ? 'Deleting account…' : 'Delete account'}
            destructive
            onPress={deleting ? undefined : handleDeleteAccount}
            showChevron={!deleting}
          />
        </View>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, marginBottom: Spacing.one },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A0116',
    letterSpacing: 0.2,
  },
  nameStack: {
    gap: Spacing.three,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0116',
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F1F6',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4EF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 52,
    fontSize: 15,
    fontWeight: '500',
    color: '#0A0116',
  },
  pad: { paddingHorizontal: Spacing.three },
});
