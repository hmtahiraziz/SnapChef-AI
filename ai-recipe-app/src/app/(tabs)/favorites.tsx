import { router } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { RecipeGlassCard } from '@/components/ui/recipe-glass-card';
import { type GlassTint } from '@/components/ui/glass-card';
import { SnapChef, Spacing } from '@/constants/theme';
import { useFavorites } from '@/context/FavoritesContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { FavoriteRecipe } from '@/types/recipe';

import { useTheme } from '@/hooks/use-theme';

const TINTS: GlassTint[] = ['lavender', 'mint', 'cream', 'peach'];

function formatTime(recipe: FavoriteRecipe): string {
  const total = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  return total > 0 ? `${total} minutes` : 'Time varies';
}

export default function FavoritesScreen() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { isTablet } = useResponsiveLayout();
  const theme = useTheme();

  const confirmRemove = (recipe: FavoriteRecipe) => {
    Alert.alert('Remove favorite?', `Remove "${recipe.title}" from your favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => void removeFavorite(recipe.id),
      },
    ]);
  };

  return (
    <ScreenContainer scroll gradient>
      <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your saved recipes, ready when you are.</Text>

      {isLoading ? <ActivityIndicator color={SnapChef.primary} style={styles.loader} /> : null}

      {!isLoading && favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Tap the heart on a recipe to save it for later."
        />
      ) : null}

      <View style={[styles.grid, isTablet && styles.gridWide]}>
        {favorites.map((recipe, index) => (
          <View key={recipe.id} style={isTablet ? styles.gridItem : undefined}>
            <RecipeGlassCard
              title={recipe.title}
              timeLabel={formatTime(recipe)}
              meta={`${recipe.servings} servings · ${recipe.cuisine ?? recipe.country ?? 'SnapChef'}`}
              tint={TINTS[index % TINTS.length]}
              imageUrl={recipe.imageUrl}
              recipeId={recipe.id}
              cuisine={recipe.cuisine ?? recipe.country}
              favorited
              onPress={() => router.push(`/recipe/${recipe.id}`)}
              onToggleFavorite={() => confirmRemove(recipe)}
            />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: Spacing.two },
  loader: { marginVertical: Spacing.three },
  grid: { gap: 0 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  gridItem: { width: '48%', flexGrow: 1 },
});
