import { router, type Href } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/themed-text';
import { usePreferences } from '@/context/PreferencesContext';
import { useShoppingList } from '@/context/ShoppingListContext';
import { SettingsRow } from '@/features/settings';
import { Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const { country, theme: themePreference, resetToDefaults } = usePreferences();
  const { clearAll } = useShoppingList();

  const themeLabel =
    themePreference === 'system'
      ? 'System'
      : themePreference === 'dark'
        ? 'Dark'
        : 'Light';

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleClearLocalData = () => {
    Alert.alert(
      'Clear local data?',
      'This clears your shopping list and resets cuisine/theme preferences on this device. Favorites are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await clearAll();
              await resetToDefaults();
              Alert.alert('Done', 'Local preferences and shopping list were cleared.');
            })();
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <ThemedText type="small" themeColor="textSecondary">
        Prefer defaults that follow you across Home and recipe generation.
      </ThemedText>

      <GlassCard tint="lavender" padded={false}>
        <View style={styles.pad}>
          <SettingsRow
            label="Default cuisine"
            value={country}
            onPress={() => router.push('/preferences/cuisine' as Href)}
          />
          <SettingsRow
            label="Appearance"
            value={themeLabel}
            onPress={() => router.push('/preferences/appearance' as Href)}
          />
        </View>
      </GlassCard>

      <GlassCard tint="white" padded={false}>
        <View style={styles.pad}>
          <SettingsRow label="Clear local data" destructive onPress={handleClearLocalData} />
          <SettingsRow label="App version" value={appVersion} showChevron={false} />
        </View>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: Spacing.three,
  },
});
