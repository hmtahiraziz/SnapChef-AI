import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { useFavorites } from '@/context/FavoritesContext';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

type FavoriteButtonProps = {
  recipe: Recipe;
  size?: number;
};

export function FavoriteButton({ recipe, size = 28 }: FavoriteButtonProps) {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);

  return (
    <Pressable
      accessibilityLabel={saved ? 'Remove from favorites' : 'Save to favorites'}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      onPress={() => void toggleFavorite(recipe)}
      style={styles.button}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? '#e53935' : theme.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.two,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
