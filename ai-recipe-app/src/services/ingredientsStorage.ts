import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ai_recipe_app/kitchen_ingredients';

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export async function getKitchenIngredients(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return normalizeList(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export async function saveKitchenIngredients(ingredients: string[]): Promise<string[]> {
  const next = normalizeList(ingredients);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function clearKitchenIngredients(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
