import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { RecipeCardSkeleton } from '@/components/recipe-result-card';
import { Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STATUS_LINES = [
  'Matching flavors to your ingredients…',
  'Balancing spices and cook times…',
  'Writing clear cookable steps…',
  'Finishing your recipe cards…',
];

type RecipeGeneratingLoaderProps = {
  country?: string;
  ingredientCount?: number;
  skeletonCount?: number;
  wide?: boolean;
};

export function RecipeGeneratingLoader({
  country,
  ingredientCount = 0,
  skeletonCount = 2,
  wide = false,
}: RecipeGeneratingLoaderProps) {
  const theme = useTheme();
  const [statusIndex, setStatusIndex] = useState(0);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);
  const progress = useSharedValue(0.2);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    progress.value = withRepeat(
      withTiming(0.88, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [spin, pulse, progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_LINES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  const metaBits = [
    country?.trim() || null,
    ingredientCount > 0 ? `${ingredientCount} ingredient${ingredientCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.heroShadow}>
        <LinearGradient
          colors={['rgba(237,231,255,0.96)', 'rgba(255,255,255,0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: 'rgba(137,102,250,0.22)' }]}
        >
          <View style={styles.heroTop}>
            <View style={styles.orbWrap}>
              <Animated.View style={[styles.orbRing, ringStyle]} />
              <Animated.View style={[styles.orbCore, iconStyle]}>
                <Ionicons name="sparkles" size={22} color="#fff" />
              </Animated.View>
            </View>

            <View style={styles.copy}>
              <Text style={styles.kicker}>SNAPCHEF AI</Text>
              <Text style={[styles.title, { color: theme.text }]}>Crafting your recipes</Text>
              {metaBits.length > 0 ? (
                <Text style={[styles.meta, { color: theme.textSecondary }]}>
                  {metaBits.join(' · ')}
                </Text>
              ) : null}
            </View>
          </View>

          <Animated.View
            key={statusIndex}
            entering={FadeInDown.duration(220)}
            exiting={FadeOut.duration(160)}
            style={styles.statusRow}
          >
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {STATUS_LINES[statusIndex]}
            </Text>
          </Animated.View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFillWrap, progressStyle]}>
              <LinearGradient
                colors={[SnapChef.primary, '#603FEF']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.progressFill}
              />
            </Animated.View>
          </View>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Usually a few seconds — we’re keeping steps short and cookable.
          </Text>
        </LinearGradient>
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
  heroShadow: {
    borderRadius: Radii.card,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  heroCard: {
    borderRadius: Radii.card,
    borderWidth: 1.5,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  orbWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(137,102,250,0.25)',
    borderTopColor: SnapChef.primary,
    borderRightColor: 'rgba(137,102,250,0.55)',
  },
  orbCore: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: SnapChef.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 22,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: SnapChef.primary,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(137,102,250,0.12)',
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: '100%',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
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
});
