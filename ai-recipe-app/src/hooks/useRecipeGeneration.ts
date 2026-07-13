import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_COUNTRY } from '@/constants/countries';
import { generateRecipesFromIngredients } from '@/services/recipeApi';
import { setLastRecipeSearch, setSessionRecipes } from '@/services/recipeSession';
import type { Recipe } from '@/types/recipe';

export function parseIngredientParam(raw?: string | string[]): string[] {
  if (!raw) {
    return [];
  }

  const value = Array.isArray(raw) ? raw[0] : raw;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    // Fall back to comma-separated values from earlier phases.
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCountryParam(raw?: string | string[]): string {
  if (!raw) {
    return DEFAULT_COUNTRY;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed && trimmed.length >= 2 ? trimmed : DEFAULT_COUNTRY;
}

export function useRecipeGeneration(ingredientNames: string[], country: string, scanImage?: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingredientKey = useMemo(() => ingredientNames.join('|'), [ingredientNames]);
  const countryKey = country.trim() || DEFAULT_COUNTRY;

  const loadRecipes = useCallback(async () => {
    if (ingredientNames.length === 0) {
      setRecipes([]);
      setError('Add ingredients on the Home tab to find recipes.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generated = await generateRecipesFromIngredients(ingredientNames, countryKey);
      const withImage = generated.map((recipe) => ({
        ...recipe,
        imageUrl: recipe.imageUrl || scanImage || undefined,
      }));
      setLastRecipeSearch(ingredientNames, countryKey);
      setSessionRecipes(withImage);
      setRecipes(withImage);
    } catch (generationError) {
      const message =
        generationError instanceof Error
          ? generationError.message
          : 'Something went wrong while generating recipes.';
      setError(message);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [ingredientNames, countryKey, scanImage]);

  useEffect(() => {
    void loadRecipes();
  }, [ingredientKey, countryKey, scanImage, loadRecipes]);

  return {
    recipes,
    isLoading,
    error,
    retry: loadRecipes,
  };
}
