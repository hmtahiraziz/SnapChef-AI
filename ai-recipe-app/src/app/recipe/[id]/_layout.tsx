import { Stack } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RecipeDetailLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="cook"
        options={{
          presentation: isWide ? 'modal' : 'card',
        }}
      />
    </Stack>
  );
}
