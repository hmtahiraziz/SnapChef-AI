import { Stack } from 'expo-router';

import { frostedStackScreenOptions } from '@/components/navigation/frosted-stack-options';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AccountLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Stack screenOptions={frostedStackScreenOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Account' }} />
    </Stack>
  );
}
