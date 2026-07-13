import { useCallback, useState } from 'react';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<string[]>([]);

  const addIngredient = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIngredients((current) => {
      const exists = current.some((item) => item.toLowerCase() === trimmed.toLowerCase());
      return exists ? current : [...current, trimmed];
    });
  }, []);

  const mergeIngredients = useCallback((names: string[]) => {
    setIngredients((current) => {
      const merged = [...current];

      for (const name of names) {
        const trimmed = name.trim();
        if (!trimmed) continue;

        const exists = merged.some((item) => item.toLowerCase() === trimmed.toLowerCase());
        if (!exists) {
          merged.push(trimmed);
        }
      }

      return merged;
    });
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setIngredients((current) => current.filter((item) => item !== name));
  }, []);

  const setFromList = useCallback((list: string[]) => {
    setIngredients(list);
  }, []);

  const clearIngredients = useCallback(() => {
    setIngredients([]);
  }, []);

  return {
    ingredients,
    addIngredient,
    mergeIngredients,
    removeIngredient,
    setFromList,
    clearIngredients,
  };
}
