import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

type FavoriteButtonProps = {
  recipe: Recipe;
  /** Heart icon size inside the chip. */
  size?: number;
};

export function FavoriteButton({ recipe, size = 20 }: FavoriteButtonProps) {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);

  return (
    <Pressable
      accessibilityLabel={saved ? 'Remove from favorites' : 'Save to favorites'}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      onPress={() => void toggleFavorite(recipe)}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: saved
            ? theme.isDark
              ? 'rgba(244, 63, 94, 0.16)'
              : '#FFF1F2'
            : theme.backgroundElement,
          borderColor: saved
            ? theme.isDark
              ? 'rgba(244, 63, 94, 0.35)'
              : '#FECDD3'
            : theme.border,
          shadowColor: saved ? '#E11D48' : theme.tint,
        },
        pressed && styles.chipPressed,
      ]}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? '#E11D48' : theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
