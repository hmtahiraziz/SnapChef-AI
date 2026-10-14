import * as ExpoClipboard from 'expo-clipboard';
import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';

import { SnapChef } from '@/constants/theme';
import { useShoppingList } from '@/context/ShoppingListContext';
import type { ShoppingListItem } from '@/services/shoppingListStorage';
import {
  formatShoppingListClipboard,
  formatShoppingListText,
} from '@/utils/formatShoppingList';
import {
  CATEGORY_META,
  categorizeIngredient,
  type IngredientCategory,
} from '@/utils/ingredientCategory';

export type SortMode = 'recipe' | 'category' | 'unchecked';

export type ShoppingGroup = {
  key: string;
  title: string;
  emoji?: string;
  color?: string;
  items: ShoppingListItem[];
};

export const SORT_OPTIONS: {
  mode: SortMode;
  label: string;
  icon: 'restaurant-outline' | 'storefront-outline' | 'checkbox-outline';
}[] = [
  { mode: 'recipe', label: 'Recipe', icon: 'restaurant-outline' },
  { mode: 'category', label: 'Aisle', icon: 'storefront-outline' },
  { mode: 'unchecked', label: 'Status', icon: 'checkbox-outline' },
];

function buildGroups(items: ShoppingListItem[], mode: SortMode): ShoppingGroup[] {
  if (mode === 'recipe') {
    const map = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const k = item.sourceRecipeTitle ?? '__manual__';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return [...map.entries()].map(([k, its]) => ({
      key: k,
      title: k === '__manual__' ? 'Other Items' : k,
      emoji: k === '__manual__' ? '📝' : '🍽️',
      color: SnapChef.primary,
      items: its,
    }));
  }

  if (mode === 'category') {
    const map = new Map<IngredientCategory, ShoppingListItem[]>();
    for (const item of items) {
      const cat = categorizeIngredient(item.name);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    const order: IngredientCategory[] = [
      'produce',
      'meat',
      'dairy',
      'pantry',
      'spices',
      'bakery',
      'frozen',
      'beverages',
      'other',
    ];
    return order
      .filter((cat) => map.has(cat))
      .map((cat) => {
        const meta = CATEGORY_META[cat];
        return {
          key: cat,
          title: meta.label,
          emoji: meta.emoji,
          color: meta.color,
          items: map.get(cat)!,
        };
      });
  }

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const all: ShoppingGroup[] = [];
  if (unchecked.length) {
    all.push({
      key: 'unchecked',
      title: 'Still needed',
      emoji: '🛒',
      color: '#10B981',
      items: unchecked,
    });
  }
  if (checked.length) {
    all.push({
      key: 'checked',
      title: 'Done',
      emoji: '✅',
      color: SnapChef.muted,
      items: checked,
    });
  }
  return all;
}

export function useShoppingListScreen() {
  const {
    items,
    isLoading,
    uncheckedCount,
    toggleItem,
    removeItem,
    clearChecked,
    clearAll,
    addManualItem,
    updateItem,
  } = useShoppingList();

  const [draft, setDraft] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recipe');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editTarget, setEditTarget] = useState<ShoppingListItem | null>(null);
  const [menuTarget, setMenuTarget] = useState<ShoppingListItem | null>(null);
  const [clearConfirm, setClearConfirm] = useState<'all' | 'done' | null>(null);
  const [copiedOpen, setCopiedOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const totalCount = items.length;
  const checkedCount = totalCount - uncheckedCount;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const handleAdd = useCallback(async () => {
    const val = draft.trim();
    if (!val) return;
    await addManualItem(val);
    setDraft('');
  }, [draft, addManualItem]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: formatShoppingListText(items) });
    } catch {
      /* cancelled */
    }
  }, [items]);

  const handleCopy = useCallback(async () => {
    await ExpoClipboard.setStringAsync(formatShoppingListClipboard(items));
    setCopiedOpen(true);
  }, [items]);

  const closeCopied = useCallback(() => {
    setCopiedOpen(false);
  }, []);

  const requestDelete = useCallback((id: string) => {
    setDeleteTargetId(id);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteTargetId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    const id = deleteTargetId;
    setDeleteTargetId(null);
    if (id) void removeItem(id);
  }, [deleteTargetId, removeItem]);

  const handleClearAll = useCallback(() => {
    setClearConfirm('all');
  }, []);

  const handleClearChecked = useCallback(() => {
    if (checkedCount === 0) return;
    setClearConfirm('done');
  }, [checkedCount]);

  const closeClearConfirm = useCallback(() => {
    setClearConfirm(null);
  }, []);

  const confirmClear = useCallback(() => {
    const kind = clearConfirm;
    setClearConfirm(null);
    if (kind === 'all') void clearAll();
    else if (kind === 'done') void clearChecked();
  }, [clearConfirm, clearAll, clearChecked]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch((v) => {
      if (v) setSearch('');
      return !v;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const groups = useMemo(() => buildGroups(filtered, sortMode), [filtered, sortMode]);

  return {
    items,
    isLoading,
    totalCount,
    checkedCount,
    progress,
    draft,
    setDraft,
    sortMode,
    setSortMode,
    search,
    setSearch,
    showSearch,
    toggleSearch,
    editTarget,
    setEditTarget,
    menuTarget,
    setMenuTarget,
    clearConfirm,
    collapsedGroups,
    toggleGroup,
    groups,
    handleAdd,
    handleShare,
    handleCopy,
    copiedOpen,
    closeCopied,
    deleteTargetId,
    requestDelete,
    closeDeleteConfirm,
    confirmDelete,
    handleClearAll,
    handleClearChecked,
    closeClearConfirm,
    confirmClear,
    toggleItem,
    removeItem,
    updateItem,
  };
}
