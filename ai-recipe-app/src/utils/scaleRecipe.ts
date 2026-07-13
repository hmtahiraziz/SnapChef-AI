import type { Ingredient } from '@/types/recipe';

const FRACTIONS: Array<[number, string]> = [
  [0.25, '1/4'],
  [0.33, '1/3'],
  [0.5, '1/2'],
  [0.67, '2/3'],
  [0.75, '3/4'],
];

function parseQuantity(quantity: string): number | null {
  const trimmed = quantity.trim();
  const fractionMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);

  if (fractionMatch) {
    return Number(fractionMatch[1]) / Number(fractionMatch[2]);
  }

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    return Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);
  }

  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

function formatQuantity(value: number): string {
  if (value <= 0) {
    return '0';
  }

  const whole = Math.floor(value);
  const fraction = value - whole;

  for (const [amount, label] of FRACTIONS) {
    if (Math.abs(fraction - amount) < 0.08) {
      return whole > 0 ? `${whole} ${label}` : label;
    }
  }

  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toFixed(1).replace(/\.0$/, '');
}

export function scaleIngredientQuantity(
  quantity: string | undefined,
  baseServings: number,
  targetServings: number,
): string | undefined {
  if (!quantity || baseServings <= 0 || targetServings <= 0) {
    return quantity;
  }

  const parsed = parseQuantity(quantity);
  if (parsed === null) {
    return quantity;
  }

  const scaled = (parsed / baseServings) * targetServings;
  return formatQuantity(scaled);
}

export function getScaledIngredients(
  ingredients: Ingredient[],
  baseServings: number,
  targetServings: number,
): Ingredient[] {
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: scaleIngredientQuantity(ingredient.quantity, baseServings, targetServings),
  }));
}

export function formatIngredientLine(ingredient: Ingredient): string {
  const quantityUnit = [ingredient.quantity, ingredient.unit].filter(Boolean).join(' ');
  return quantityUnit ? `${quantityUnit} ${ingredient.name}` : ingredient.name;
}
