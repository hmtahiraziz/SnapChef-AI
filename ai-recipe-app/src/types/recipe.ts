export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  country?: string;
  cuisine?: string;
  description?: string;
  difficulty?: RecipeDifficulty;
  missingIngredients?: Ingredient[];
  optionalIngredients?: Ingredient[];
  /** Optional hero image URL (enriched client-side if missing) */
  imageUrl?: string;
}

export interface FavoriteRecipe extends Recipe {
  savedAt: string;
}
