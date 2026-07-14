import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import { BRAND_NAME } from '@/features/auth';

/**
 * Deep-link landing after OAuth browser returns.
 * Session activation usually happens in useGoogleAuth; AuthGate then routes
 * to select-country or home. Stay put if still signing in.
 */
export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    // Signed-in: AuthGate owns next hop (country vs home). Nothing to do here.
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    // Safety: if stuck signed-out on this screen > 8s, return to sign-in.
    if (!isLoaded || isSignedIn) return;
    const timeout = setTimeout(() => {
      router.replace('/sign-in');
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="flex-1 items-center justify-center bg-lavender gap-3">
      <ActivityIndicator color="#8966FA" size="large" />
      <Text className="text-ink font-semibold">Signing you into {BRAND_NAME}…</Text>
    </View>
  );
}
