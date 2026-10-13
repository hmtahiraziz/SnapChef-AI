import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { RecipeCardSkeleton } from '@/components/recipe-result-card';
import { Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STATUS_BY_ELAPSED = [
  { afterMs: 0, text: 'Matching your ingredients…' },
  { afterMs: 2500, text: 'Writing a cookable recipe…' },
  { afterMs: 7000, text: 'Almost ready…' },
  { afterMs: 12000, text: 'Still working — thanks for waiting…' },
] as const;

type RecipeGeneratingLoaderProps = {
  country?: string;
  ingredientCount?: number;
  skeletonCount?: number;
  wide?: boolean;
  /** Compact row used while a second recipe loads in the background. */
  compact?: boolean;
};

export function RecipeGeneratingLoader({
  country,
  ingredientCount = 0,
  skeletonCount = 2,
  wide = false,
  compact = false,
}: RecipeGeneratingLoaderProps) {
  const theme = useTheme();
  const [status, setStatus] = useState<string>(STATUS_BY_ELAPSED[0].text);
  const progress = useSharedValue(0.12);

  useEffect(() => {
    const started = Date.now();
    // Ease toward ~90% — never reverse. Jump to 100% happens when the screen unmounts this loader.
    progress.value = withTiming(0.9, {
      duration: 14000,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      let next: string = STATUS_BY_ELAPSED[0].text;
      for (const line of STATUS_BY_ELAPSED) {
        if (elapsed >= line.afterMs) next = line.text;
      }
      setStatus(next);
    }, 400);

    return () => clearInterval(timer);
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  const metaBits = [
    country?.trim() || null,
    ingredientCount > 0
      ? `${ingredientCount} ingredient${ingredientCount === 1 ? '' : 's'}`
      : null,
  ].filter(Boolean);

  if (compact) {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.compactRow}>
        <View style={[styles.compactTrack, { backgroundColor: 'rgba(137,102,250,0.12)' }]}>
          <Animated.View style={[styles.compactFill, progressStyle]} />
        </View>
        <Text style={[styles.compactText, { color: theme.textSecondary }]}>{status}</Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View
        entering={FadeIn.duration(220)}
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
            borderColor: theme.isDark ? theme.border : 'rgba(137,102,250,0.14)',
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>Crafting recipes</Text>
        {metaBits.length > 0 ? (
          <Text style={[styles.meta, { color: theme.textSecondary }]}>{metaBits.join(' · ')}</Text>
        ) : null}
        <Text style={[styles.status, { color: theme.text }]}>{status}</Text>
        <View style={[styles.track, { backgroundColor: 'rgba(137,102,250,0.12)' }]}>
          <Animated.View style={[styles.fillWrap, progressStyle]}>
            <View style={styles.fill} />
          </Animated.View>
        </View>
      </Animated.View>

      <View style={wide ? styles.gridWide : styles.list}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <View key={`skeleton-${index}`} style={wide ? styles.gridItem : undefined}>
            <RecipeCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  statusCard: {
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  track: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  fillWrap: {
    height: '100%',
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: SnapChef.primary,
  },
  list: {
    gap: 16,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridItem: {
    width: '48%',
    flexGrow: 1,
  },
  compactRow: {
    gap: 8,
    paddingVertical: 4,
  },
  compactTrack: {
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  compactFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SnapChef.primary,
  },
  compactText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
