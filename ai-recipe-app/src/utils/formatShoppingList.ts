/**
 * Formats the shopping list as shareable plain text.
 */
import type { ShoppingListItem } from '@/services/shoppingListStorage';

export function formatShoppingListText(items: ShoppingListItem[]): string {
  if (items.length === 0) return '🛒 Shopping list is empty.';

  // Group by source recipe
  const groups = new Map<string, ShoppingListItem[]>();
  for (const item of items) {
    const key = item.sourceRecipeTitle ?? '__manual__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const lines: string[] = ['🛒 Shopping List (SnapChef AI)', ''];

  for (const [key, groupItems] of groups.entries()) {
    const title = key === '__manual__' ? 'Other Items' : key;
    lines.push(`${title}:`);
    for (const item of groupItems) {
      const qty = [item.quantity, item.unit].filter(Boolean).join(' ');
      const text = qty ? `${qty} ${item.name}` : item.name;
      lines.push(`  ${item.checked ? '✓' : '□'} ${text}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function formatShoppingListClipboard(items: ShoppingListItem[]): string {
  const unchecked = items.filter((i) => !i.checked);
  if (unchecked.length === 0) return 'Nothing left to buy!';
  return unchecked
    .map((item) => {
      const qty = [item.quantity, item.unit].filter(Boolean).join(' ');
      return qty ? `${qty} ${item.name}` : item.name;
    })
    .join('\n');
}
