import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe, RecipeDifficulty } from '@/types/recipe';
import { getRecipeImageUrl } from '@/utils/recipeImage';

type FavoriteRecipeCardProps = {
  recipe: Recipe;
  /** Total minutes label from real prep/cook data. */
  timeLabel?: string;
  favorited?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
};

type OverlayBadge = {
  label: string;
  backgroundColor: string;
};

type TagTone = { bg: string; text: string };

const CUISINE_TONES: TagTone[] = [
  { bg: '#ECE6FD', text: '#6432E4' },
  { bg: '#D1FAE5', text: '#047857' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0E7FF', text: '#4338CA' },
  { bg: '#FFEDD5', text: '#C2410C' },
];

function totalMinutes(recipe: Recipe): number {
  return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
}

function difficultyLabel(difficulty: RecipeDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy Prep';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Advanced';
  }
}

function cuisineTone(label: string): TagTone {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) hash = (hash + label.charCodeAt(i) * (i + 1)) % 997;
  return CUISINE_TONES[hash % CUISINE_TONES.length];
}

/** Overlay only from real fields — never invent match % / ratings. */
function resolveOverlayBadge(recipe: Recipe): OverlayBadge | null {
  const mins = totalMinutes(recipe);
  if (mins > 0 && mins <= 15) {
    return { label: 'Quick', backgroundColor: '#059669' };
  }
  if (recipe.difficulty === 'hard') {
    return { label: 'Advanced', backgroundColor: '#E11D48' };
  }
  if (recipe.difficulty === 'medium') {
    return { label: 'Medium', backgroundColor: SnapChef.primary };
  }
  if (recipe.difficulty === 'easy') {
    return { label: 'Easy', backgroundColor: '#D97706' };
  }
  return null;
}

export function FavoriteRecipeCard({
  recipe,
  timeLabel,
  favorited = false,
  onPress,
  onToggleFavorite,
}: FavoriteRecipeCardProps) {
  const theme = useTheme();
  const heroUri = getRecipeImageUrl({
    id: recipe.id,
    title: recipe.title,
    cuisine: recipe.cuisine ?? recipe.country,
    imageUrl: recipe.imageUrl,
  });
  const cuisine = recipe.cuisine ?? recipe.country;
  const mins = totalMinutes(recipe);
  const timeText =
    timeLabel && timeLabel !== 'Time varies'
      ? timeLabel
      : mins > 0
        ? `${mins} min`
        : null;
  const overlayBadge = resolveOverlayBadge(recipe);
  const difficulty = recipe.difficulty ? difficultyLabel(recipe.difficulty) : null;
  const tone = cuisine ? cuisineTone(cuisine) : CUISINE_TONES[0];
  const metaColor = theme.isDark ? theme.textSecondary : '#605872';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={recipe.title}
      style={({ pressed }) => [styles.pressable, pressed && styles.cardPressed]}>
      {/* Inner View paints background — Pressable often skips bg on Android */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
            borderColor: theme.isDark ? theme.border : '#E8E4EF',
          },
          Platform.select({
            ios: {
              shadowColor: theme.isDark ? '#000' : '#7546F5',
              shadowOpacity: theme.isDark ? 0.3 : 0.07,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 2 },
            default: {},
          }),
        ]}>
        <View style={styles.row}>
          <View style={[styles.thumbWrap, { backgroundColor: theme.backgroundSelected }]}>
            <Image source={{ uri: heroUri }} style={styles.thumb} contentFit="cover" transition={200} />
            {overlayBadge ? (
              <View style={[styles.overlayBadge, { backgroundColor: overlayBadge.backgroundColor }]}>
                <Text style={styles.overlayBadgeText}>{overlayBadge.label}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.content}>
            <View style={styles.tagsRow}>
              <View style={styles.tagsLeft}>
                {cuisine ? (
                  <View style={[styles.tag, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.tagText, { color: tone.text }]} numberOfLines={1}>
                      {cuisine.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                {difficulty ? (
                  <View style={[styles.tag, styles.tagDiff]}>
                    <Text style={styles.tagDiffText} numberOfLines={1}>
                      {difficulty}
                    </Text>
                  </View>
                ) : null}
              </View>
              {onToggleFavorite ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onToggleFavorite();
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={favorited ? 'Remove from favorites' : 'Save to favorites'}
                  style={({ pressed }) => [
                    styles.heartChip,
                    {
                      backgroundColor: favorited
                        ? theme.isDark
                          ? 'rgba(244, 63, 94, 0.16)'
                          : '#FFF1F2'
                        : theme.isDark
                          ? theme.backgroundSelected
                          : '#F8F6FE',
                      borderColor: favorited
                        ? theme.isDark
                          ? 'rgba(244, 63, 94, 0.35)'
                          : '#FECDD3'
                        : theme.isDark
                          ? theme.border
                          : '#E8E4EF',
                    },
                    pressed && styles.heartPressed,
                  ]}>
                  <Ionicons
                    name={favorited ? 'heart' : 'heart-outline'}
                    size={15}
                    color={favorited ? '#E11D48' : theme.textSecondary}
                  />
                </Pressable>
              ) : null}
            </View>

            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {recipe.title}
            </Text>

            {recipe.description ? (
              <Text style={[styles.snippet, { color: theme.textSecondary }]} numberOfLines={2}>
                {recipe.description}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              {timeText ? (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color={SnapChef.primary} />
                  <Text style={[styles.metaText, { color: metaColor }]}>{timeText}</Text>
                </View>
              ) : null}
              {timeText && recipe.servings > 0 ? (
                <Text style={styles.metaDot}>•</Text>
              ) : null}
              {recipe.servings > 0 ? (
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color={SnapChef.primary} />
                  <Text style={[styles.metaText, { color: metaColor }]}>
                    {recipe.servings} serv
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8E4EF',
    padding: 12,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.97,
    transform: [{ scale: 0.995 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbWrap: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    flexGrow: 0,
    flexShrink: 0,
  },
  thumb: {
    width: 96,
    height: 96,
  },
  overlayBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: '90%',
  },
  overlayBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tagsLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tagDiff: {
    backgroundColor: '#FEF3C7',
  },
  tagDiffText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  snippet: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  heartChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heartPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.94 }],
  },
});
