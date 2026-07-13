import { Pressable, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemedText } from '@/components/themed-text';
import { usePreferences } from '@/context/PreferencesContext';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemePreference } from '@/services/preferencesStorage';

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match your device setting' },
  { value: 'light', label: 'Light', hint: 'Always use light appearance' },
  { value: 'dark', label: 'Dark', hint: 'Always use dark appearance' },
];

export default function AppearanceSettingsScreen() {
  const theme = useTheme();
  const { theme: themePreference, setTheme } = usePreferences();
  const isDark = theme.text === '#F5F2FF';

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
        Choose how SnapChef AI looks on this device.
      </ThemedText>

      <GlassCard tint="lavender">
        <View style={{ gap: Spacing.two }}>
          {OPTIONS.map((option) => {
            const selected = themePreference === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => void setTheme(option.value)}
                style={[
                  styles.option,
                  {
                    borderColor: selected ? theme.tint : theme.border,
                    backgroundColor: selected
                      ? theme.backgroundSelected
                      : isDark
                        ? 'rgba(28, 24, 38, 0.7)'
                        : 'rgba(255, 255, 255, 0.7)',
                  },
                ]}>
                <View style={styles.optionCopy}>
                  <ThemedText type="smallBold">{option.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {option.hint}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: theme.tint,
                      backgroundColor: selected ? theme.tint : 'transparent',
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    minHeight: 64,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
});
