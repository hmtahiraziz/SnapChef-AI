import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  clearKitchenIngredients,
  getKitchenIngredients,
  saveKitchenIngredients,
} from '@/services/ingredientsStorage';

type IngredientsContextValue = {
  ingredients: string[];
  isReady: boolean;
  addIngredient: (name: string) => void;
  mergeIngredients: (names: string[]) => void;
  removeIngredient: (name: string) => void;
  renameIngredient: (from: string, to: string) => void;
  setFromList: (list: string[]) => void;
  clearIngredients: () => void;
};

const IngredientsContext = createContext<IngredientsContextValue | null>(null);

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await getKitchenIngredients();
        if (active) setIngredients(stored);
      } finally {
        if (active) setIsReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback((updater: (current: string[]) => string[]) => {
    setIngredients((current) => {
      const next = updater(current);
      void saveKitchenIngredients(next);
      return next;
    });
  }, []);

  const addIngredient = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      commit((current) => {
        const exists = current.some((item) => item.toLowerCase() === trimmed.toLowerCase());
        return exists ? current : [...current, trimmed];
      });
    },
    [commit],
  );

  const mergeIngredients = useCallback(
    (names: string[]) => {
      commit((current) => {
        const merged = [...current];
        for (const name of names) {
          const trimmed = name.trim();
          if (!trimmed) continue;
          const exists = merged.some((item) => item.toLowerCase() === trimmed.toLowerCase());
          if (!exists) merged.push(trimmed);
        }
        return merged;
      });
    },
    [commit],
  );

  const removeIngredient = useCallback(
    (name: string) => {
      commit((current) => current.filter((item) => item !== name));
    },
    [commit],
  );

  const renameIngredient = useCallback(
    (from: string, to: string) => {
      const nextName = to.trim();
      if (!from || !nextName || from === nextName) return;

      commit((current) => {
        const fromIndex = current.findIndex((item) => item === from);
        if (fromIndex < 0) return current;

        const duplicate = current.some(
          (item, index) => index !== fromIndex && item.toLowerCase() === nextName.toLowerCase(),
        );
        if (duplicate) {
          // Drop the renamed slot if the target name already exists.
          return current.filter((_, index) => index !== fromIndex);
        }

        const next = [...current];
        next[fromIndex] = nextName;
        return next;
      });
    },
    [commit],
  );

  const setFromList = useCallback(
    (list: string[]) => {
      commit(() => list);
    },
    [commit],
  );

  const clearIngredients = useCallback(() => {
    setIngredients([]);
    void clearKitchenIngredients();
  }, []);

  const value = useMemo(
    () => ({
      ingredients,
      isReady,
      addIngredient,
      mergeIngredients,
      removeIngredient,
      renameIngredient,
      setFromList,
      clearIngredients,
    }),
    [
      ingredients,
      isReady,
      addIngredient,
      mergeIngredients,
      removeIngredient,
      renameIngredient,
      setFromList,
      clearIngredients,
    ],
  );

  return <IngredientsContext.Provider value={value}>{children}</IngredientsContext.Provider>;
}

export function useIngredientsContext(): IngredientsContextValue {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error('useIngredientsContext must be used within IngredientsProvider');
  }
  return context;
}
