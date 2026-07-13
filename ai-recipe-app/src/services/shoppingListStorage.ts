import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Ingredient } from '@/types/recipe';

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
  sourceRecipeTitle?: string;
  /** Auto-tagged aisle category */
  category?: string;
  /** ISO timestamp when the item was added */
  addedAt?: string;
};

const STORAGE_KEY = '@ai_recipe_app/shopping_list';

function itemKey(name: string, quantity?: string, unit?: string): string {
  return `${name.trim().toLowerCase()}|${(quantity ?? '').trim()}|${(unit ?? '').trim()}`;
}

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is ShoppingListItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ShoppingListItem).id === 'string' &&
        typeof (item as ShoppingListItem).name === 'string',
    );
  } catch {
    return [];
  }
}

async function writeShoppingList(items: ShoppingListItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function addIngredientsToShoppingList(
  ingredients: Ingredient[],
  sourceRecipeTitle?: string,
): Promise<ShoppingListItem[]> {
  const existing = await getShoppingList();
  const keys = new Set(existing.map((item) => itemKey(item.name, item.quantity, item.unit)));
  const next = [...existing];

  for (const ingredient of ingredients) {
    const name = ingredient.name?.trim();
    if (!name) {
      continue;
    }
    const key = itemKey(name, ingredient.quantity, ingredient.unit);
    if (keys.has(key)) {
      continue;
    }
    keys.add(key);
    next.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      checked: false,
      sourceRecipeTitle,
    });
  }

  await writeShoppingList(next);
  return next;
}

export async function toggleShoppingItem(id: string): Promise<ShoppingListItem[]> {
  const existing = await getShoppingList();
  const next = existing.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
  await writeShoppingList(next);
  return next;
}

export async function clearCheckedShoppingItems(): Promise<ShoppingListItem[]> {
  const existing = await getShoppingList();
  const next = existing.filter((item) => !item.checked);
  await writeShoppingList(next);
  return next;
}

export async function clearShoppingList(): Promise<ShoppingListItem[]> {
  await writeShoppingList([]);
  return [];
}

export async function removeShoppingItem(id: string): Promise<ShoppingListItem[]> {
  const existing = await getShoppingList();
  const next = existing.filter((item) => item.id !== id);
  await writeShoppingList(next);
  return next;
}

export async function updateShoppingItem(
  id: string,
  patch: Partial<Pick<ShoppingListItem, 'name' | 'quantity' | 'unit' | 'category'>>,
): Promise<ShoppingListItem[]> {
  const existing = await getShoppingList();
  const next = existing.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  await writeShoppingList(next);
  return next;
}

export async function addManualShoppingItem(
  name: string,
  quantity?: string,
  unit?: string,
): Promise<ShoppingListItem[]> {
  const trimmed = name.trim();
  if (!trimmed) return getShoppingList();

  const existing = await getShoppingList();
  const key = itemKey(trimmed, quantity, unit);
  const alreadyExists = existing.some(
    (item) => itemKey(item.name, item.quantity, item.unit) === key,
  );
  if (alreadyExists) return existing;

  const next: ShoppingListItem[] = [
    ...existing,
    {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      quantity: quantity?.trim() || undefined,
      unit: unit?.trim() || undefined,
      checked: false,
      addedAt: new Date().toISOString(),
    },
  ];
  await writeShoppingList(next);
  return next;
}
