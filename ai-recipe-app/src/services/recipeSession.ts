import type { Recipe } from '@/types/recipe';

let sessionRecipes: Recipe[] = [];

export type LastRecipeSearch = {
  ingredientsJson: string;
  country: string;
};

let lastSearch: LastRecipeSearch | null = null;

export function setSessionRecipes(recipes: Recipe[]): void {
  sessionRecipes = recipes;
}

export function getSessionRecipes(): Recipe[] {
  return sessionRecipes;
}

export function getSessionRecipe(id: string): Recipe | undefined {
  return sessionRecipes.find((recipe) => recipe.id === id);
}

export function clearSessionRecipes(): void {
  sessionRecipes = [];
}

export function setLastRecipeSearch(ingredients: string[], country: string): void {
  lastSearch = {
    ingredientsJson: JSON.stringify(ingredients),
    country,
  };
}

export function getLastRecipeSearch(): LastRecipeSearch | null {
  return lastSearch;
}
