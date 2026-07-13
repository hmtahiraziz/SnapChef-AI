import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FavoriteRecipe, Ingredient, Recipe } from '@/types/recipe';
import { getRecipeImageUrl } from '@/utils/recipeImage';

const FAVORITES_KEY = '@recipe_app/favorites';

function isIngredient(value: unknown): value is Ingredient {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Ingredient).name === 'string'
  );
}

function isFavoriteRecipe(value: unknown): value is FavoriteRecipe {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const recipe = value as FavoriteRecipe;
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.title === 'string' &&
    typeof recipe.servings === 'number' &&
    typeof recipe.savedAt === 'string' &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.every(isIngredient) &&
    Array.isArray(recipe.steps) &&
    recipe.steps.every((step) => typeof step === 'string')
  );
}

async function readFavorites(): Promise<FavoriteRecipe[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isFavoriteRecipe);
  } catch {
    return [];
  }
}

export async function getFavorites(): Promise<FavoriteRecipe[]> {
  const favorites = await readFavorites();
  return favorites.sort(
    (left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
  );
}

export async function getFavoriteById(id: string): Promise<FavoriteRecipe | undefined> {
  const favorites = await readFavorites();
  return favorites.find((recipe) => recipe.id === id);
}

export async function saveFavorite(recipe: Recipe): Promise<void> {
  const favorites = await readFavorites();
  const favorite: FavoriteRecipe = {
    ...recipe,
    imageUrl: getRecipeImageUrl(recipe),
    savedAt: new Date().toISOString(),
  };

  const existingIndex = favorites.findIndex((item) => item.id === recipe.id);
  if (existingIndex >= 0) {
    favorites[existingIndex] = favorite;
  } else {
    favorites.unshift(favorite);
  }

  await writeFavorites(favorites);
}

export async function removeFavorite(id: string): Promise<void> {
  const favorites = await readFavorites();
  await writeFavorites(favorites.filter((recipe) => recipe.id !== id));
}

export async function isFavorite(id: string): Promise<boolean> {
  const favorites = await readFavorites();
  return favorites.some((recipe) => recipe.id === id);
}

export async function writeFavorites(favorites: FavoriteRecipe[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export { FAVORITES_KEY };
