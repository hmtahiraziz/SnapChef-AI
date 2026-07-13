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
  addIngredientsToShoppingList,
  addManualShoppingItem,
  clearCheckedShoppingItems,
  clearShoppingList,
  getShoppingList,
  removeShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
  type ShoppingListItem,
} from '@/services/shoppingListStorage';
import type { Ingredient } from '@/types/recipe';

type ShoppingListContextValue = {
  items: ShoppingListItem[];
  isLoading: boolean;
  uncheckedCount: number;
  addIngredients: (ingredients: Ingredient[], sourceRecipeTitle?: string) => Promise<number>;
  addManualItem: (name: string, quantity?: string, unit?: string) => Promise<void>;
  updateItem: (id: string, patch: Partial<Pick<ShoppingListItem, 'name' | 'quantity' | 'unit'>>) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
};

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = await getShoppingList();
    setItems(stored);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await getShoppingList();
        if (active) {
          setItems(stored);
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
  }, []);

  const addIngredients = useCallback(
    async (ingredients: Ingredient[], sourceRecipeTitle?: string) => {
      const before = items.length;
      const next = await addIngredientsToShoppingList(ingredients, sourceRecipeTitle);
      setItems(next);
      return Math.max(0, next.length - before);
    },
    [items.length],
  );

  const toggleItem = useCallback(async (id: string) => {
    const next = await toggleShoppingItem(id);
    setItems(next);
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const next = await removeShoppingItem(id);
    setItems(next);
  }, []);

  const clearChecked = useCallback(async () => {
    const next = await clearCheckedShoppingItems();
    setItems(next);
  }, []);

  const clearAll = useCallback(async () => {
    const next = await clearShoppingList();
    setItems(next);
  }, []);

  const addManualItem = useCallback(async (name: string, quantity?: string, unit?: string) => {
    const next = await addManualShoppingItem(name, quantity, unit);
    setItems(next);
  }, []);

  const updateItem = useCallback(
    async (id: string, patch: Partial<Pick<ShoppingListItem, 'name' | 'quantity' | 'unit'>>) => {
      const next = await updateShoppingItem(id, patch);
      setItems(next);
    },
    [],
  );

  const uncheckedCount = useMemo(() => items.filter((item) => !item.checked).length, [items]);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      uncheckedCount,
      addIngredients,
      addManualItem,
      updateItem,
      toggleItem,
      removeItem,
      clearChecked,
      clearAll,
      refresh,
    }),
    [
      items,
      isLoading,
      uncheckedCount,
      addIngredients,
      addManualItem,
      updateItem,
      toggleItem,
      removeItem,
      clearChecked,
      clearAll,
      refresh,
    ],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingListProvider');
  }
  return context;
}
