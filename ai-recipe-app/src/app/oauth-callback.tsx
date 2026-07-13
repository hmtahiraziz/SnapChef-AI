import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { BRAND_NAME } from '@/features/auth';

export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    }, 0);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-lavender gap-3">
      <ActivityIndicator color="#8966FA" size="large" />
      <Text className="text-ink font-semibold">Signing you into {BRAND_NAME}…</Text>
    </View>
  );
}
