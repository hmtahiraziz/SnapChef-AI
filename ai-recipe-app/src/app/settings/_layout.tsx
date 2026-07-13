import { Stack } from 'expo-router';

/**
 * Legacy `/settings/*` routes — nested prefs moved to `/preferences`.
 * Keep thin redirects so old links and stale editor buffers stay valid.
 */
export default function LegacySettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
