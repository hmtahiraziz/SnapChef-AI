import { backendFetch } from '@/services/backendClient';
import type { FavoriteRecipe, Recipe } from '@/types/recipe';

interface FavoritesResponse {
  favorites: FavoriteRecipe[];
}

export async function listFavorites(): Promise<FavoriteRecipe[]> {
  const response = await backendFetch<FavoritesResponse>('/api/v1/favorites', {
    method: 'GET',
  });
  return response.favorites;
}

export async function addFavorite(recipe: Recipe): Promise<FavoriteRecipe[]> {
  const response = await backendFetch<FavoritesResponse>('/api/v1/favorites', {
    method: 'POST',
    body: JSON.stringify({ recipe }),
  });
  return response.favorites;
}

export async function deleteFavorite(recipeId: string): Promise<void> {
  await backendFetch<void>(`/api/v1/favorites/${encodeURIComponent(recipeId)}`, {
    method: 'DELETE',
  });
}
