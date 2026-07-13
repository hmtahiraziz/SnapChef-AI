import { useRouter } from 'expo-router';
import {
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_COPY, BRAND_NAME, GetStartedButton } from '@/features/auth';
import { setHasSeenOnboarding } from '@/services/onboardingStorage';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isShort = height < 700;
  const heroFlex = isShort ? 0.44 : 0.54;
  const headingSize = isTablet ? 48 : width < 360 ? 34 : 40;

  const finishOnboarding = async (target: '/sign-in' | '/sign-up') => {
    await setHasSeenOnboarding(true);
    router.replace(target);
  };

  return (
    <View
      className="flex-1 bg-lavender"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <View className="px-3 items-center justify-center" style={{ flex: heroFlex }}>
        <Image
          source={require('@/assets/images/onboarding-chef.png')}
          style={{
            width: isTablet ? 480 : width * 0.92,
            height: '100%',
          }}
          resizeMode="contain"
          accessibilityLabel={`${BRAND_NAME} chef illustration`}
        />
      </View>

      <View className="px-6 justify-between" style={{ flex: 1 - heroFlex }}>
        <View>
          <View className="flex-row items-end justify-between gap-3">
            <Text
              className="flex-1 font-extrabold text-ink"
              style={{ fontSize: headingSize, lineHeight: headingSize + 4 }}>
              {AUTH_COPY.onboardingTitle}
              <Text style={{ fontSize: headingSize - 6 }}>🔥</Text>
            </Text>

            <View
              className="overflow-hidden"
              style={{
                width: isTablet ? 168 : Math.min(140, width * 0.34),
                height: isTablet ? 132 : Math.min(112, width * 0.28),
                borderTopLeftRadius: 40,
                borderTopRightRadius: 18,
                borderBottomRightRadius: 18,
                borderBottomLeftRadius: 40,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.85)',
                backgroundColor: 'rgba(255,255,255,0.55)',
                shadowColor: '#8966FA',
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              }}>
              <Image
                source={require('@/assets/images/food-card-deco.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="text-body text-muted mt-4 max-w-[92%] leading-5">
            {AUTH_COPY.onboardingBody}
          </Text>
          <Text className="text-xs text-primary font-bold mt-2 tracking-wide">{BRAND_NAME}</Text>
          <Text className="text-xs text-muted mt-1">{AUTH_COPY.tagline}</Text>
        </View>

        <View className="mt-6 gap-3">
          <GetStartedButton
            onPress={() => void finishOnboarding('/sign-up')}
            accessibilityLabel={`Get Started with ${BRAND_NAME}`}
          />
          <TouchableOpacity
            onPress={() => void finishOnboarding('/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Log In"
            className="self-center py-2"
            hitSlop={8}>
            <Text className="text-sm text-muted">
              Already have an account?{' '}
              <Text className="font-bold text-ink">Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
