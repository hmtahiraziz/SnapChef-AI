import { hasApiBaseUrl } from '@/constants/env';
import { ApiKeyMissingError, RecipeGenerationError } from '@/services/errors';
import { backendFetch } from '@/services/backendClient';
import type { Recipe } from '@/types/recipe';
import { getRecipeImageUrl } from '@/utils/recipeImage';

interface GenerateRecipesResponse {
  recipes: Recipe[];
}

export type GenerateRecipesOptions = {
  maxRecipes?: number;
  excludeTitles?: string[];
};

function withRecipeImages(recipes: Recipe[]): Recipe[] {
  return recipes.map((recipe) => ({
    ...recipe,
    imageUrl: getRecipeImageUrl(recipe),
  }));
}

/**
 * Recipe generation service — turns ingredients into cookable recipes via the backend.
 */
export async function generateRecipesFromIngredients(
  ingredients: string[],
  country: string,
  options: GenerateRecipesOptions = {},
): Promise<Recipe[]> {
  if (!hasApiBaseUrl()) {
    throw new ApiKeyMissingError();
  }

  if (ingredients.length === 0) {
    throw new RecipeGenerationError('Add at least one ingredient to find recipes.');
  }

  if (!country.trim()) {
    throw new RecipeGenerationError('Select a country to generate regional recipes.');
  }

  const maxRecipes = options.maxRecipes ?? 1;
  const excludeTitles = options.excludeTitles ?? [];

  try {
    const response = await backendFetch<GenerateRecipesResponse>('/api/v1/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({
        ingredients,
        max_recipes: maxRecipes,
        country: country.trim(),
        exclude_titles: excludeTitles,
      }),
    });

    if (!Array.isArray(response.recipes)) {
      throw new RecipeGenerationError('Invalid recipe response from server.');
    }

    return withRecipeImages(response.recipes);
  } catch (error) {
    if (error instanceof RecipeGenerationError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new RecipeGenerationError(error.message || 'Failed to load recipes.');
    }
    throw new RecipeGenerationError('Failed to load recipes.');
  }
}
