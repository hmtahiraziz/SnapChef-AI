import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassBackButton } from '@/components/glass-back-button';
import {
  RecipeResultCard,
  type RecipeCardTint,
} from '@/components/recipe-result-card';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassPill } from '@/components/ui/glass-pill';
import { RecipeGeneratingLoader } from '@/components/ui/recipe-generating-loader';
import { Radii, SnapChef, Spacing } from '@/constants/theme';
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

function formatIngredientChip(list: string[]): string {
  if (list.length === 0) return 'Add ingredients';
  const preview = list.slice(0, 3).join(', ');
  return list.length > 3 ? `${preview}…` : preview;
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
  const { recipes, isLoading, isLoadingMore, error, retry } = useRecipeGeneration(
    ingredientList,
    selectedCountry,
    scanImage,
  );

  const chipBg = theme.isDark ? theme.backgroundSelected : 'rgba(237, 231, 255, 0.95)';
  const chipBorder = theme.isDark ? theme.border : 'rgba(137, 102, 250, 0.18)';

  return (
    <View style={styles.root}>
      <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
        <View style={styles.topPad} />

        <View style={styles.headerBlock}>
          <View style={styles.kickerRow}>
            <Ionicons name="sparkles" size={12} color={SnapChef.primary} />
            <Text style={[styles.kicker, { color: theme.tint }]}>AI RESULTS</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Your recipes</Text>

          {ingredientList.length > 0 ? (
            <View style={styles.chipRow}>
              <Pressable
                onPress={() => router.push('/preferences/cuisine')}
                accessibilityRole="button"
                accessibilityLabel="Change cuisine"
                style={[styles.filterChip, { backgroundColor: chipBg, borderColor: chipBorder }]}
              >
                <Ionicons name="globe-outline" size={14} color={SnapChef.primary} />
                <Text style={[styles.filterChipText, { color: theme.text }]} numberOfLines={1}>
                  {selectedCountry}
                </Text>
              </Pressable>

              <Pressable
                onPress={goHome}
                accessibilityRole="button"
                accessibilityLabel="Edit ingredients"
                style={[
                  styles.filterChip,
                  styles.filterChipGrow,
                  { backgroundColor: chipBg, borderColor: chipBorder },
                ]}
              >
                <Ionicons name="leaf-outline" size={14} color={SnapChef.primary} />
                <Text style={[styles.filterChipText, { color: theme.text }]} numberOfLines={1}>
                  {formatIngredientChip(ingredientList)}
                </Text>
                <Ionicons name="pencil-outline" size={13} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Go back home and add ingredients to generate recipes.
            </Text>
          )}
        </View>

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
                colors={[SnapChef.primary, '#603FEF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.regenerateBtn}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.regenerateBtnText}>Regenerate</Text>
              </LinearGradient>
            </Pressable>
          ) : null}

          <Pressable
            onPress={goHome}
            accessibilityRole="button"
            accessibilityLabel="New search"
            style={({ pressed }) => [
              styles.newSearchBtn,
              {
                backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
                borderColor: chipBorder,
              },
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="options-outline" size={16} color={theme.text} />
            <Text style={[styles.newSearchText, { color: theme.text }]}>New search</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <RecipeGeneratingLoader
            country={selectedCountry}
            ingredientCount={ingredientList.length}
            skeletonCount={1}
            wide={isTablet}
          />
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
              const onHandCount = recipe.ingredients?.length ?? 0;
              const missingCount = recipe.missingIngredients?.length ?? 0;
              const saved = isFavorite(recipe.id);
              return (
                <Animated.View
                  key={recipe.id}
                  entering={FadeInDown.delay(index * 90).springify()}
                  style={isTablet ? styles.gridItem : undefined}
                >
                  <RecipeResultCard
                    title={recipe.title}
                    timeLabel={formatRecipeTime(recipe)}
                    servings={recipe.servings}
                    difficulty={recipe.difficulty}
                    meta={recipe.cuisine ?? recipe.country ?? selectedCountry}
                    tint={TINTS[index % TINTS.length]}
                    imageUrl={recipe.imageUrl}
                    recipeId={recipe.id}
                    cuisine={recipe.cuisine ?? recipe.country}
                    favorited={saved}
                    onHandCount={onHandCount}
                    missingCount={missingCount}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    onToggleFavorite={() => {
                      void toggleFavorite(recipe);
                    }}
                  />
                </Animated.View>
              );
            })}
        </View>

        {!isLoading && isLoadingMore ? (
          <RecipeGeneratingLoader compact country={selectedCountry} />
        ) : null}
      </ScreenContainer>

      <GlassBackButton onPress={() => smartBack('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topPad: { height: 52 },
  headerBlock: { gap: 8, marginBottom: 4 },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(137, 102, 250, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radii.chip,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
  },
  filterChipGrow: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
  },
  filterChipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginVertical: 14,
  },
  regenerateBtnWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    borderRadius: Radii.pill,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  regenerateBtn: {
    minHeight: 52,
    borderRadius: Radii.pill,
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
  newSearchBtn: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    minHeight: 52,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  newSearchText: {
    fontSize: 16,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  errorBox: { gap: 12 },
  errorText: { color: '#c62828', fontSize: 13 },
  list: { gap: 4 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  gridItem: { width: '48%', flexGrow: 1 },
});
