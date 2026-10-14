import { Stack } from 'expo-router';

import { frostedStackScreenOptions } from '@/components/navigation/frosted-stack-options';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack screenOptions={frostedStackScreenOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Preferences' }} />
      <Stack.Screen name="cuisine" options={{ title: 'Cuisine' }} />
      <Stack.Screen name="appearance" options={{ title: 'Preferences' }} />
    </Stack>
  );
}
