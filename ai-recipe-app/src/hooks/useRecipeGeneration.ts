import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function mergeUniqueRecipes(existing: Recipe[], incoming: Recipe[]): Recipe[] {
  const seen = new Set(existing.map((recipe) => recipe.id.toLowerCase()));
  const seenTitles = new Set(existing.map((recipe) => recipe.title.trim().toLowerCase()));
  const merged = [...existing];

  for (const recipe of incoming) {
    const idKey = recipe.id.toLowerCase();
    const titleKey = recipe.title.trim().toLowerCase();
    if (seen.has(idKey) || seenTitles.has(titleKey)) continue;
    seen.add(idKey);
    seenTitles.add(titleKey);
    merged.push(recipe);
  }

  return merged;
}

export function useRecipeGeneration(ingredientNames: string[], country: string, scanImage?: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const ingredientKey = useMemo(() => ingredientNames.join('|'), [ingredientNames]);
  const countryKey = country.trim() || DEFAULT_COUNTRY;

  const attachScanImage = useCallback(
    (items: Recipe[]) =>
      items.map((recipe) => ({
        ...recipe,
        imageUrl: recipe.imageUrl || scanImage || undefined,
      })),
    [scanImage],
  );

  const loadRecipes = useCallback(async () => {
    if (ingredientNames.length === 0) {
      setRecipes([]);
      setError('Add ingredients on the Home tab to find recipes.');
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setRecipes([]);

    try {
      // Phase 1 — first recipe as fast as possible.
      const firstBatch = attachScanImage(
        await generateRecipesFromIngredients(ingredientNames, countryKey, { maxRecipes: 1 }),
      );

      if (requestId !== requestIdRef.current) return;

      setLastRecipeSearch(ingredientNames, countryKey);
      setSessionRecipes(firstBatch);
      setRecipes(firstBatch);
      setIsLoading(false);

      // Phase 2 — second distinct recipe in the background.
      setIsLoadingMore(true);
      try {
        const moreBatch = attachScanImage(
          await generateRecipesFromIngredients(ingredientNames, countryKey, {
            maxRecipes: 1,
            excludeTitles: firstBatch.map((recipe) => recipe.title),
          }),
        );

        if (requestId !== requestIdRef.current) return;

        const merged = mergeUniqueRecipes(firstBatch, moreBatch);
        setSessionRecipes(merged);
        setRecipes(merged);
      } catch {
        // Keep the first recipe even if the follow-up fails.
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingMore(false);
        }
      }
    } catch (generationError) {
      if (requestId !== requestIdRef.current) return;
      const message =
        generationError instanceof Error
          ? generationError.message
          : 'Something went wrong while generating recipes.';
      setError(message);
      setRecipes([]);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [ingredientNames, countryKey, attachScanImage]);

  useEffect(() => {
    void loadRecipes();
  }, [ingredientKey, countryKey, scanImage, loadRecipes]);

  return {
    recipes,
    isLoading,
    isLoadingMore,
    error,
    retry: loadRecipes,
  };
}
