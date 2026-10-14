import { useIngredientsContext } from '@/context/IngredientsContext';

/** Kitchen ingredients list — persisted across generate, edits, and app restarts. */
export function useIngredients() {
  return useIngredientsContext();
}
