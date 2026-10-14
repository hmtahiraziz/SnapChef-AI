import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { FrostedHeaderBackground } from '@/components/ui/frosted-header-background';
import { Fonts } from '@/constants/theme';

type FrostedStackColors = {
  tint: string;
  text: string;
  background: string;
};

/**
 * Shared translucent + blurred native stack header options.
 * Pair with ScreenContainer edges that omit `top` so content can scroll under the bar.
 */
export function frostedStackScreenOptions(
  colors: FrostedStackColors,
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    headerTransparent: true,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerTintColor: colors.tint,
    headerBackTitle: 'Back',
    headerTitleStyle: {
      fontFamily: Fonts.display,
      color: colors.text,
      fontSize: 17,
    },
    headerBackground: () => <FrostedHeaderBackground />,
    contentStyle: { backgroundColor: colors.background },
    animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
  };
}
