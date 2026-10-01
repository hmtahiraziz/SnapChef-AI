import { Redirect } from 'expo-router';

/** Appearance / dark mode is not offered — app is light-only. */
export default function AppearanceSettingsScreen() {
  return <Redirect href="/preferences" />;
}
