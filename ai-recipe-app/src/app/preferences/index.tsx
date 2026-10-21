import { router, type Href } from 'expo-router';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/themed-text';
import { useIngredientsContext } from '@/context/IngredientsContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useShoppingList } from '@/context/ShoppingListContext';
import { SettingsRow } from '@/features/settings';

export default function PreferencesScreen() {
  const { country, resetToDefaults } = usePreferences();
  const { clearAll } = useShoppingList();
  const { clearIngredients } = useIngredientsContext();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleClearLocalData = () => {
    Alert.alert(
      'Clear local data?',
      'This clears your shopping list, kitchen ingredients, and resets cuisine preferences on this device. Favorites are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await clearAll();
              clearIngredients();
              await resetToDefaults();
              Alert.alert('Done', 'Local preferences, ingredients, and shopping list were cleared.');
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
        <SettingsRow
          label="Default cuisine"
          value={country}
          onPress={() => router.push('/preferences/cuisine' as Href)}
          showDivider={false}
        />
      </GlassCard>

      <GlassCard tint="white" padded={false}>
        <SettingsRow label="Clear local data" destructive onPress={handleClearLocalData} />
        <SettingsRow
          label="App version"
          value={appVersion}
          showChevron={false}
          showDivider={false}
        />
      </GlassCard>
    </ScreenContainer>
  );
}
