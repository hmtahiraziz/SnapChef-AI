import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard, type GlassTint } from '@/components/ui/glass-card';
import { getRecipeImageUrl } from '@/utils/recipeImage';
import { useTheme } from '@/hooks/use-theme';

type RecipeGlassCardProps = {
  title: string;
  timeLabel: string;
  meta?: string;
  tint?: GlassTint;
  favorited?: boolean;
  imageUrl?: string | null;
  recipeId?: string;
  cuisine?: string | null;
  onPress: () => void;
  onToggleFavorite?: () => void;
  actionLabel?: string;
};

export function RecipeGlassCard({
  title,
  timeLabel,
  meta,
  tint = 'lavender',
  imageUrl,
  recipeId,
  cuisine,
  onPress,
}: RecipeGlassCardProps) {
  const theme = useTheme();
  const heroUri = getRecipeImageUrl({ id: recipeId, title, cuisine, imageUrl });

  return (
    <GlassCard tint={tint} padded={false} style={styles.wrap}>
      <Pressable onPress={onPress} style={styles.pressable} accessibilityRole="button">
        <View style={styles.cardContent}>
          {/* Circular food plate image */}
          <View style={[styles.imageContainer, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
            <Image source={{ uri: heroUri }} style={styles.foodImage} contentFit="cover" transition={200} />
          </View>

          {/* Details (Title and specs) */}
          <View style={styles.details}>
            <Text style={[styles.foodTitle, { color: theme.text }]} numberOfLines={1}>
              {title}
            </Text>
            
            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={styles.specEmoji}>🔥</Text>
                <Text style={[styles.specText, { color: theme.textSecondary }]} numberOfLines={1}>{cuisine ?? 'Recipe'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specEmoji}>⏱️</Text>
                <Text style={[styles.specText, { color: theme.textSecondary }]} numberOfLines={1}>{timeLabel}</Text>
              </View>
              {meta ? (
                <View style={styles.specItem}>
                  <Text style={styles.specEmoji}>👥</Text>
                  <Text style={[styles.specText, { color: theme.textSecondary }]} numberOfLines={1}>{meta}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Right Chevron arrow */}
          <View style={styles.arrowWrap}>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={{ opacity: 0.6 }} />
          </View>
        </View>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    marginBottom: 12, 
    overflow: 'hidden',
  },
  pressable: { 
    padding: 14, 
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
  },
  imageContainer: { 
    width: 68, 
    height: 68, 
    borderRadius: 34, 
    overflow: 'hidden', 
    borderWidth: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  foodImage: { 
    width: '100%', 
    height: '100%', 
  },
  details: { 
    flex: 1, 
    gap: 6, 
    justifyContent: 'center',
  },
  foodTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
  },
  specsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flexWrap: 'wrap',
    gap: 10, 
  },
  specItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3, 
  },
  specEmoji: { 
    fontSize: 12, 
  },
  specText: { 
    fontSize: 11, 
    fontWeight: '600', 
  },
  arrowWrap: { 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
});
