import { Redirect } from 'expo-router';

export default function LegacyAppearanceRedirect() {
  return <Redirect href="/preferences/appearance" />;
}
