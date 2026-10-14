import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { usePreferences } from '@/context/PreferencesContext';
import { CountryDropdown } from '@/features/settings';
import { getCountryFlag } from '@/constants/countries';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function CuisineSettingsScreen() {
  const theme = useTheme();
  const { country, setCountry } = usePreferences();

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <Text style={[styles.lead, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
        Recipes prioritize flavors and methods from this country. Home uses the same default.
      </Text>

      <GlassCard tint="white">
        <View style={styles.selectedBlock}>
          <Text style={[styles.selectedLabel, { color: theme.textSecondary, fontFamily: Fonts.bodyMedium }]}>
            Selected cuisine
          </Text>
          <Text style={[styles.selectedValue, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
            {getCountryFlag(country)}  {country}
          </Text>
        </View>

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
  lead: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.one,
  },
  selectedBlock: {
    width: '100%',
    gap: 4,
    marginBottom: Spacing.two,
  },
  selectedLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  selectedValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
});
