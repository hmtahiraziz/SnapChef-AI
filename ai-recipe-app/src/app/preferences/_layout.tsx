import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.tint,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: Fonts.display,
          color: colors.text,
        },
        contentStyle: { backgroundColor: colors.background },
        animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
      }}>
      <Stack.Screen name="index" options={{ title: 'Preferences' }} />
      <Stack.Screen name="cuisine" options={{ title: 'Cuisine' }} />
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
    </Stack>
  );
}
