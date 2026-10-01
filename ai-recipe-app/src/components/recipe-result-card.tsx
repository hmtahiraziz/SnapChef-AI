import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GlassIconButton } from '@/components/glass-icon-button';
import { getRecipeImageUrl } from '@/utils/recipeImage';

import { useTheme } from '@/hooks/use-theme';

const PRIMARY = '#8966FA';

export type RecipeCardTint = 'purple' | 'yellow' | 'green' | 'coral';

const TINT_BORDER: Record<RecipeCardTint, string> = {
  purple: 'rgba(137,102,250,0.18)',
  yellow: 'rgba(137,102,250,0.18)',
  green: 'rgba(137,102,250,0.18)',
  coral: 'rgba(137,102,250,0.18)',
};

type RecipeResultCardProps = {
  title: string;
  timeLabel: string;
  servings: number;
  difficulty?: string | null;
  meta?: string;
  tint: RecipeCardTint;
  imageUrl?: string | null;
  recipeId?: string;
  cuisine?: string | null;
  favorited?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

export function RecipeResultCard({
  title,
  timeLabel,
  servings,
  difficulty,
  meta,
  tint,
  imageUrl,
  recipeId,
  cuisine,
  favorited,
  onPress,
  onToggleFavorite,
}: RecipeResultCardProps) {
  const heroUri = getRecipeImageUrl({ id: recipeId, title, cuisine, imageUrl });
  const theme = useTheme();
  const { isDark } = theme;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.shadow, pressed && styles.pressed]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? theme.backgroundElement : '#fff',
            borderColor: isDark ? theme.border : TINT_BORDER[tint],
          },
        ]}
      >
        <View style={styles.hero}>
          <Image
            source={{ uri: heroUri }}
            style={styles.heroImage}
            contentFit="cover"
            transition={220}
          />
          <LinearGradient
            colors={['rgba(10,1,22,0.05)', 'rgba(10,1,22,0.78)']}
            style={styles.heroOverlay}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {title}
            </Text>
            {meta ? (
              <Text style={styles.heroMeta} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </LinearGradient>
          {onToggleFavorite ? (
            <View style={styles.heartWrap}>
              <GlassIconButton
                icon={favorited ? 'heart' : 'heart-outline'}
                color={favorited ? '#E11D48' : theme.text}
                accessibilityLabel={favorited ? 'Remove favorite' : 'Save favorite'}
                onPress={onToggleFavorite}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: isDark ? theme.backgroundSelected : 'rgba(137,102,250,0.1)' }]}>
              <Ionicons name="people-outline" size={13} color={PRIMARY} />
              <Text style={[styles.badgeText, { color: theme.text }]}>{servings} servings</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: isDark ? theme.backgroundSelected : 'rgba(137,102,250,0.1)' }]}>
              <Ionicons name="time-outline" size={13} color={PRIMARY} />
              <Text style={[styles.badgeText, { color: theme.text }]}>{timeLabel}</Text>
            </View>
            {difficulty ? (
              <View style={[styles.badge, styles.badgeAccent, { backgroundColor: isDark ? theme.field : 'rgba(137,102,250,0.18)' }]}>
                <Ionicons name="flame-outline" size={13} color={theme.text} />
                <Text style={[styles.badgeText, { color: theme.text }]}>{difficulty}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.seeRecipe, { color: theme.tint }]}>See recipe</Text>
            <View style={[styles.arrowChip, { backgroundColor: isDark ? theme.backgroundSelected : 'rgba(137,102,250,0.12)' }]}>
              <Ionicons name="arrow-forward" size={16} color={theme.tint} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function RecipeCardSkeleton() {
  const theme = useTheme();
  const opacity = useSharedValue(0.45);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.shadow, anim]}>
      <View
        style={[
          styles.card,
          styles.skeleton,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : '#EDE7FF',
            borderColor: theme.isDark ? theme.border : 'rgba(137,102,250,0.2)',
          },
        ]}
      >
        <View style={[styles.skelHero, { backgroundColor: theme.isDark ? theme.backgroundSelected : 'rgba(137,102,250,0.14)' }]} />
        <View style={styles.skelBody}>
          <View style={[styles.skelLine, { backgroundColor: theme.isDark ? theme.field : 'rgba(137,102,250,0.15)' }]} />
          <View style={[styles.skelLine, { width: '55%', backgroundColor: theme.isDark ? theme.field : 'rgba(137,102,250,0.15)' }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  pressed: { opacity: 0.96, transform: [{ scale: 0.985 }] },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  hero: {
    height: 190,
    backgroundColor: '#EDE7FF',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  heartWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(137,102,250,0.1)',
  },
  badgeAccent: {
    backgroundColor: 'rgba(137,102,250,0.18)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeRecipe: {
    fontSize: 15,
    fontWeight: '800',
  },
  arrowChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    overflow: 'hidden',
  },
  skelHero: {
    height: 170,
  },
  skelBody: {
    padding: 16,
    gap: 10,
  },
  skelLine: {
    height: 12,
    borderRadius: 8,
    width: '72%',
  },
});
