import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FrostedHeaderBackgroundProps = {
  /** Slightly stronger wash so title/controls stay readable over busy content. */
  intensity?: number;
};

/** Bottom corners only — shared by ScreenContainer + stack headers. */
export const HEADER_BOTTOM_RADIUS = Radii.card;

const webBackdropStyle = {
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
} as ViewStyle;

/**
 * Translucent blur layer for screen headers — content scrolling underneath shows through.
 */
export function FrostedHeaderBackground({ intensity = 64 }: FrostedHeaderBackgroundProps) {
  const theme = useTheme();
  const tint = theme.isDark ? 'dark' : 'light';
  const wash = theme.isDark ? 'rgba(11, 11, 15, 0.78)' : 'rgba(250, 250, 253, 0.82)';
  const edge = theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 1, 22, 0.06)';

  return (
    <View
      style={[styles.root, { borderBottomColor: edge }]}
      pointerEvents="none">
      {Platform.OS === 'web' ? (
        <View style={[StyleSheet.absoluteFillObject, webBackdropStyle, { backgroundColor: wash }]} />
      ) : (
        <>
          <BlurView
            intensity={intensity}
            tint={tint}
            style={StyleSheet.absoluteFillObject}
            {...(Platform.OS === 'android'
              ? { experimentalBlurMethod: 'dimezisBlurView' as const }
              : null)}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: wash }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
    borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
