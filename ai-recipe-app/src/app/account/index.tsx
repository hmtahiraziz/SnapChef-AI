import { useAuth, useUser } from '@clerk/clerk-expo';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { AppDialog } from '@/components/ui/app-dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { SettingsRow } from '@/features/settings';
import { Fonts, Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clearShoppingList } from '@/services/shoppingListStorage';
import { writeFavorites } from '@/services/favoritesStorage';

type NoticeDialog = {
  title: string;
  message: string;
} | null;

type ConfirmDialog = 'signOut' | 'delete' | null;

export default function AccountScreen() {
  const theme = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [notice, setNotice] = useState<NoticeDialog>(null);
  const [confirm, setConfirm] = useState<ConfirmDialog>(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? 'Not available';

  const saveName = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setNotice({ title: 'Saved', message: 'Your display name has been updated.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update name.';
      setNotice({ title: 'Update failed', message });
    } finally {
      setSaving(false);
    }
  };

  const performSignOut = async () => {
    setConfirm(null);
    try {
      await signOut();
    } finally {
      router.replace('/sign-in' as never);
    }
  };

  const performDeleteAccount = async () => {
    if (!user || deleting) return;
    setConfirm(null);
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
      setNotice({ title: 'Delete failed', message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <Text style={[styles.lead, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
        Manage how you sign in to SnapChef AI.
      </Text>

      <GlassCard tint="white">
        <Text style={[styles.section, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
          Display name
        </Text>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, fontFamily: Fonts.bodyMedium }]}>
            First name
          </Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={theme.textSecondary}
            selectionColor={SnapChef.primary}
            autoCapitalize="words"
            style={[
              styles.input,
              {
                backgroundColor: theme.field,
                borderColor: theme.fieldBorder,
                color: theme.text,
                fontFamily: Fonts.bodyMedium,
              },
            ]}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, fontFamily: Fonts.bodyMedium }]}>
            Last name
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor={theme.textSecondary}
            selectionColor={SnapChef.primary}
            autoCapitalize="words"
            style={[
              styles.input,
              {
                backgroundColor: theme.field,
                borderColor: theme.fieldBorder,
                color: theme.text,
                fontFamily: Fonts.bodyMedium,
              },
            ]}
          />
        </View>

        <Pressable
          onPress={() => void saveName()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save name"
          style={({ pressed }) => [styles.saveWrap, (pressed || saving) && styles.savePressed]}>
          <View style={styles.saveBtn}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.saveLabel, { fontFamily: Fonts.bodyBold }]}>Save name</Text>
            )}
          </View>
        </Pressable>
      </GlassCard>

      <GlassCard tint="white" padded={false}>
        <SettingsRow
          icon="mail-outline"
          iconColor="#3B82F6"
          iconBg="rgba(59, 130, 246, 0.14)"
          label="Email"
          subtitle={email}
          showChevron={false}
        />
        <SettingsRow
          icon="document-text-outline"
          iconColor="#7B5CFA"
          iconBg="rgba(137, 102, 250, 0.14)"
          label="Privacy Policy"
          onPress={() => router.push('/legal/privacy' as Href)}
          showDivider={false}
        />
      </GlassCard>

      <GlassCard tint="peach" padded={false}>
        <SettingsRow
          icon="log-out-outline"
          iconColor="#c62828"
          iconBg="rgba(198, 40, 40, 0.12)"
          label="Sign out"
          destructive
          onPress={() => setConfirm('signOut')}
        />
        <SettingsRow
          icon="trash-outline"
          iconColor="#c62828"
          iconBg="rgba(198, 40, 40, 0.12)"
          label={deleting ? 'Deleting account…' : 'Delete account'}
          destructive
          onPress={deleting ? undefined : () => setConfirm('delete')}
          showChevron={!deleting}
          showDivider={false}
        />
      </GlassCard>

      <AppDialog
        visible={notice !== null}
        title={notice?.title ?? ''}
        message={notice?.message}
        confirmOnly
        confirmLabel="OK"
        onConfirm={() => setNotice(null)}
      />

      <AppDialog
        visible={confirm === 'signOut'}
        title="Sign out?"
        message="You can sign back in anytime."
        cancelLabel="Cancel"
        confirmLabel="Sign out"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={() => void performSignOut()}
      />

      <AppDialog
        visible={confirm === 'delete'}
        title="Delete account?"
        message="This permanently deletes your SnapChef AI account and cloud data. This cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setConfirm(null)}
        onConfirm={() => void performDeleteAccount()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.one,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldBlock: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 15,
  },
  saveWrap: {
    width: '100%',
  },
  savePressed: {
    opacity: 0.88,
  },
  saveBtn: {
    width: '100%',
    minHeight: 52,
    borderRadius: Radii.pill,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
