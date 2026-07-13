import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="flex-1 items-center justify-center bg-[#0f0f0f] px-6">
      <Text className="text-2xl font-semibold text-white">Page not found</Text>
      <Text className="mt-3 text-center text-[15px] text-[#888]">
        The requested page could not be found.
      </Text>
      <Pressable
        className="mt-6 rounded-xl bg-[#ff6b35] px-5 py-3"
        onPress={() => router.replace(isSignedIn ? '/' : '/sign-in')}
      >
        <Text className="font-semibold text-white">{isSignedIn ? 'Go home' : 'Back to sign in'}</Text>
      </Pressable>
    </View>
  );
}
