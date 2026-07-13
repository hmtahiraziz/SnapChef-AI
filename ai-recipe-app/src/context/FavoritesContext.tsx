import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useUser } from '@clerk/clerk-expo';

import {
  getFavorites,
  removeFavorite as removeFavoriteFromStorage,
  saveFavorite,
  writeFavorites,
} from '@/services/favoritesStorage';
import { addFavorite, deleteFavorite, listFavorites } from '@/services/favoritesApi';
import type { FavoriteRecipe, Recipe } from '@/types/recipe';

type FavoritesContextValue = {
  favorites: FavoriteRecipe[];
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (recipe: Recipe) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn } = useUser();

  const refresh = useCallback(async () => {
    const stored = await getFavorites();
    setFavorites(stored);
  }, []);

  useEffect(() => {
    let active = true;

    const mergeFavorites = (local: FavoriteRecipe[], remote: FavoriteRecipe[]) => {
      const merged = new Map<string, FavoriteRecipe>();
      const items = [...local, ...remote].sort((left, right) =>
        new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
      );
      for (const item of items) {
        if (!merged.has(item.id)) {
          merged.set(item.id, item);
        }
      }
      return Array.from(merged.values());
    };

    void (async () => {
      try {
        const stored = await getFavorites();
        if (active) {
          setFavorites(stored);
        }

        if (isSignedIn) {
          try {
            const remoteFavorites = await listFavorites();
            const merged = mergeFavorites(stored, remoteFavorites);
            if (active) {
              setFavorites(merged);
              await writeFavorites(merged);
            }
          } catch (error) {
            console.error('Favorite sync failed:', error);
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isSignedIn]);

  const favoriteIds = useMemo(() => new Set(favorites.map((recipe) => recipe.id)), [favorites]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (recipe: Recipe) => {
      const isAlreadyFav = favoriteIds.has(recipe.id);
      const previousFavorites = [...favorites];

      if (isAlreadyFav) {
        setFavorites((current) => current.filter((item) => item.id !== recipe.id));
        try {
          await removeFavoriteFromStorage(recipe.id);
          if (isSignedIn) {
            await deleteFavorite(recipe.id);
          }
        } catch (error) {
          setFavorites(previousFavorites);
          console.error('Failed to remove favorite:', error);
        }
      } else {
        const newFavorite: FavoriteRecipe = {
          ...recipe,
          savedAt: new Date().toISOString(),
        };
        setFavorites((current) => [newFavorite, ...current]);
        try {
          await saveFavorite(recipe);
          if (isSignedIn) {
            await addFavorite(recipe);
          }
        } catch (error) {
          setFavorites(previousFavorites);
          console.error('Failed to save favorite:', error);
        }
      }
    },
    [favoriteIds, favorites, isSignedIn],
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      const previousFavorites = [...favorites];
      setFavorites((current) => current.filter((item) => item.id !== id));
      try {
        await removeFavoriteFromStorage(id);
        if (isSignedIn) {
          await deleteFavorite(id);
        }
      } catch (error) {
        setFavorites(previousFavorites);
        console.error('Failed to remove favorite:', error);
      }
    },
    [favorites, isSignedIn],
  );

  const value = useMemo(
    () => ({
      favorites,
      isLoading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      refresh,
    }),
    [favorites, isLoading, isFavorite, toggleFavorite, removeFavorite, refresh],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
