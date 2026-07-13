import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/themed-text';
import { usePreferences } from '@/context/PreferencesContext';
import { CountryDropdown } from '@/features/settings';
import { Spacing } from '@/constants/theme';

export default function CuisineSettingsScreen() {
  const { country, setCountry } = usePreferences();

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <ThemedText type="small" themeColor="textSecondary">
        Recipes prioritize flavors and methods from this country. Home uses the same default.
      </ThemedText>

      <GlassCard tint="mint">
        <ThemedText type="smallBold">Selected: {country}</ThemedText>
        <CountryDropdown
          value={country}
          onChange={(next) => void setCountry(next)}
          maxListHeight={320}
        />
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: Spacing.one },
});
