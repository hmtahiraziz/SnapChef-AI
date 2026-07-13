import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassBackButton } from '@/components/glass-back-button';
import {
  RecipeCardSkeleton,
  RecipeResultCard,
  type RecipeCardTint,
} from '@/components/recipe-result-card';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassPill } from '@/components/ui/glass-pill';
import { SnapChef, Spacing } from '@/constants/theme';
import {
  parseCountryParam,
  parseIngredientParam,
  useRecipeGeneration,
} from '@/hooks/useRecipeGeneration';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';
import { goHome, smartBack } from '@/utils/navigation';

const TINTS: RecipeCardTint[] = ['purple', 'yellow', 'green', 'coral'];

function formatRecipeTime(recipe: Recipe): string {
  const total = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  if (total <= 0) return 'Time varies';
  return `${total} min`;
}

export default function RecipesScreen() {
  const { isTablet } = useResponsiveLayout();
  const { toggleFavorite, isFavorite } = useFavorites();
  const theme = useTheme();
  const { ingredients, country, scanImage } = useLocalSearchParams<{
    ingredients?: string;
    country?: string;
    scanImage?: string;
  }>();
  const ingredientList = parseIngredientParam(ingredients);
  const selectedCountry = parseCountryParam(country);
  const { recipes, isLoading, error, retry } = useRecipeGeneration(
    ingredientList,
    selectedCountry,
    scanImage
  );

  return (
    <View style={styles.root}>
      <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
        <View style={styles.topPad} />

        <View style={styles.headerBlock}>
          <Text style={[styles.kicker, { color: theme.tint }]}>AI RESULTS</Text>
          <Text style={[styles.title, { color: theme.text }]}>Your recipes</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={2}>
            {ingredientList.length > 0
              ? `${selectedCountry} · ${ingredientList.slice(0, 4).join(', ')}${
                  ingredientList.length > 4 ? '…' : ''
                }`
              : 'Go back home and add ingredients to generate recipes.'}
          </Text>
        </View>

        {!isLoading && !error && scanImage ? (
          <Animated.View
            entering={FadeInDown.delay(50).springify()}
            style={[styles.scanBannerShadow, { shadowColor: theme.tint }]}
          >
            <View style={[styles.scanBanner, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
              <Image source={{ uri: scanImage }} style={styles.scanBannerImage} contentFit="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10,1,22,0.92)']}
                style={styles.scanBannerGradient}
              />
              <View style={styles.scanBannerContent}>
                <View style={styles.scanBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFF" />
                  <Text style={styles.scanBadgeText}>Matched from scan</Text>
                </View>
                <Text style={styles.scanBannerTitle}>Your kitchen treasures</Text>
                <View style={styles.scanIngredientsList}>
                  {ingredientList.slice(0, 6).map((ing, idx) => (
                    <View key={`${ing}-${idx}`} style={styles.scanIngChip}>
                      <Text style={styles.scanIngChipText}>{ing}</Text>
                    </View>
                  ))}
                  {ingredientList.length > 6 ? (
                    <View style={[styles.scanIngChip, { backgroundColor: 'rgba(137, 102, 250, 0.35)' }]}>
                      <Text style={styles.scanIngChipText}>+{ingredientList.length - 6} more</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.actions}>
          {!isLoading && ingredientList.length > 0 ? (
            <Pressable
              onPress={() => void retry()}
              accessibilityRole="button"
              accessibilityLabel="Regenerate recipes"
              style={({ pressed }) => [
                styles.regenerateBtnWrap,
                pressed && styles.btnPressed,
              ]}
            >
              <LinearGradient
                colors={['#8966FA', '#603FEF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.regenerateBtn}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.regenerateBtnText}>Regenerate</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
          <GlassPill
            label="Cuisine"
            variant="outline"
            onPress={() => router.push('/preferences/cuisine')}
            style={{ flexGrow: 1, flexShrink: 1, minWidth: 120 }}
          />
          <GlassPill 
            label="New search" 
            variant="glass" 
            onPress={goHome} 
            style={{ flexGrow: 1, flexShrink: 1, minWidth: 120 }}
          />
        </View>

        {isLoading ? (
          <View style={isTablet ? styles.gridWide : styles.list}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={isTablet ? styles.gridItem : undefined}>
                <RecipeCardSkeleton />
              </View>
            ))}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            {ingredientList.length > 0 ? (
              <GlassPill label="Try again" variant="primary" onPress={() => void retry()} />
            ) : null}
          </View>
        ) : null}

        {!isLoading && !error && recipes.length === 0 ? (
          <EmptyState
            title="No recipes found"
            description="Try adding a few more main ingredients."
          />
        ) : null}

        <View style={[styles.list, isTablet && styles.gridWide]}>
          {!isLoading &&
            !error &&
            recipes.map((recipe, index) => {
              const missingCount = recipe.missingIngredients?.length ?? 0;
              const saved = isFavorite(recipe.id);
              return (
                <Animated.View
                  key={recipe.id}
                  entering={FadeInDown.delay(index * 90).springify()}
                  style={isTablet ? styles.gridItem : undefined}>
                  <RecipeResultCard
                    title={recipe.title}
                    timeLabel={formatRecipeTime(recipe)}
                    servings={recipe.servings}
                    difficulty={recipe.difficulty}
                    meta={[
                      recipe.cuisine ?? recipe.country ?? selectedCountry,
                      missingCount > 0 ? `${missingCount} missing` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    tint={TINTS[index % TINTS.length]}
                    imageUrl={recipe.imageUrl}
                    recipeId={recipe.id}
                    cuisine={recipe.cuisine ?? recipe.country}
                    favorited={saved}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    onToggleFavorite={() => {
                      void toggleFavorite(recipe);
                    }}
                  />
                </Animated.View>
              );
            })}
        </View>
      </ScreenContainer>

      <GlassBackButton onPress={() => smartBack('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topPad: { height: 52 },
  headerBlock: { gap: 6, marginBottom: 4 },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  actions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    width: '100%',
    marginVertical: 12,
  },
  regenerateBtnWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  regenerateBtn: {
    minHeight: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  regenerateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  scanBannerShadow: {
    borderRadius: 24,
    marginVertical: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  scanBanner: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  scanBannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scanBannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scanBannerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'flex-end',
    gap: 6,
  },
  scanBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8966FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  scanBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scanBannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  scanIngredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scanIngChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scanIngChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBox: { gap: 12 },
  errorText: { color: '#c62828', fontSize: 13 },
  list: { gap: 16 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  gridItem: { width: '48%', flexGrow: 1 },
});
