import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

import { CARD_MIN_HEIGHT, SLRadii, SLSpacing } from '../theme';

export function LoadingSkeleton() {
  const theme = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 700 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const bar = theme.isDark ? theme.backgroundSelected : '#EDE9F6';

  return (
    <View style={styles.root} accessibilityLabel="Loading shopping list">
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[styles.row, pulse, { backgroundColor: bar }]}>
          <View style={[styles.circle, { backgroundColor: theme.isDark ? theme.border : '#E0DCEC' }]} />
          <View style={styles.lines}>
            <View style={[styles.line, { backgroundColor: theme.isDark ? theme.border : '#E0DCEC', width: '72%' }]} />
            <View style={[styles.lineSm, { backgroundColor: theme.isDark ? theme.border : '#E0DCEC', width: '38%' }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: SLSpacing.sm },
  row: {
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: SLRadii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SLSpacing.md,
    gap: SLSpacing.sm,
  },
  circle: { width: 22, height: 22, borderRadius: 11 },
  lines: { flex: 1, gap: 8 },
  line: { height: 11, borderRadius: 6 },
  lineSm: { height: 8, borderRadius: 4 },
});
