import Ionicons from '@expo/vector-icons/Ionicons';
import * as ExpoClipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPill } from '@/components/ui/glass-pill';
import { SnapChef, Spacing } from '@/constants/theme';
import { useShoppingList } from '@/context/ShoppingListContext';
import { useTheme } from '@/hooks/use-theme';
import type { ShoppingListItem } from '@/services/shoppingListStorage';
import {
  CATEGORY_META,
  categorizeIngredient,
  type IngredientCategory,
} from '@/utils/ingredientCategory';
import {
  formatShoppingListClipboard,
  formatShoppingListText,
} from '@/utils/formatShoppingList';
import { formatIngredientLine } from '@/utils/scaleRecipe';

/* ─── Types ─────────────────────────────────────────────── */
type SortMode = 'recipe' | 'category' | 'unchecked';

type Group = {
  key: string;
  title: string;
  emoji?: string;
  color?: string;
  items: ShoppingListItem[];
};

/* ─── Helpers ────────────────────────────────────────────── */
function buildGroups(items: ShoppingListItem[], mode: SortMode): Group[] {
  if (mode === 'recipe') {
    const map = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const k = item.sourceRecipeTitle ?? '__manual__';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    const groups: Group[] = [];
    for (const [k, its] of map.entries()) {
      groups.push({
        key: k,
        title: k === '__manual__' ? 'Other Items' : k,
        emoji: k === '__manual__' ? '📝' : '🍽️',
        color: SnapChef.primary,
        items: its,
      });
    }
    return groups;
  }

  if (mode === 'category') {
    const map = new Map<IngredientCategory, ShoppingListItem[]>();
    for (const item of items) {
      const cat = categorizeIngredient(item.name);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    const groups: Group[] = [];
    const order: IngredientCategory[] = [
      'produce', 'meat', 'dairy', 'pantry', 'spices', 'bakery', 'frozen', 'beverages', 'other',
    ];
    for (const cat of order) {
      if (!map.has(cat)) continue;
      const meta = CATEGORY_META[cat];
      groups.push({
        key: cat,
        title: meta.label,
        emoji: meta.emoji,
        color: meta.color,
        items: map.get(cat)!,
      });
    }
    return groups;
  }

  // unchecked first
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const all: Group[] = [];
  if (unchecked.length) all.push({ key: 'unchecked', title: 'Still needed', emoji: '🛒', color: '#10B981', items: unchecked });
  if (checked.length) all.push({ key: 'checked', title: 'Done', emoji: '✅', color: SnapChef.muted, items: checked });
  return all;
}

/* ─── Edit modal ─────────────────────────────────────────── */
function EditItemModal({
  item,
  visible,
  onClose,
  onSave,
}: {
  item: ShoppingListItem | null;
  visible: boolean;
  onClose: () => void;
  onSave: (qty: string, unit: string, name: string) => void;
}) {
  const [qty, setQty] = useState(item?.quantity ?? '');
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [name, setName] = useState(item?.name ?? '');
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  // sync when item changes
  const prevId = useRef<string | null>(null);
  if (item && item.id !== prevId.current) {
    prevId.current = item.id;
    setQty(item.quantity ?? '');
    setUnit(item.unit ?? '');
    setName(item.name ?? '');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable
          style={[
            modalStyles.sheet,
            {
              backgroundColor: isDark ? '#1C1826' : '#fff',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderTopWidth: isDark ? 1 : 0,
            },
          ]}
          onPress={() => {}}
        >
          <View style={[modalStyles.handle, { backgroundColor: isDark ? theme.border : '#E8E4EF' }]} />
          <Text style={[modalStyles.title, { color: theme.text }]}>Edit item</Text>
          <View style={modalStyles.row}>
            <TextInput
              style={[
                modalStyles.field,
                {
                  width: 70,
                  backgroundColor: isDark ? theme.background : '#F3F1F6',
                  borderColor: isDark ? theme.border : '#E8E4EF',
                  color: theme.text,
                },
              ]}
              placeholder="Qty"
              placeholderTextColor={theme.textSecondary}
              value={qty}
              onChangeText={setQty}
            />
            <TextInput
              style={[
                modalStyles.field,
                {
                  width: 90,
                  backgroundColor: isDark ? theme.background : '#F3F1F6',
                  borderColor: isDark ? theme.border : '#E8E4EF',
                  color: theme.text,
                },
              ]}
              placeholder="Unit"
              placeholderTextColor={theme.textSecondary}
              value={unit}
              onChangeText={setUnit}
            />
            <TextInput
              style={[
                modalStyles.field,
                {
                  flex: 1,
                  backgroundColor: isDark ? theme.background : '#F3F1F6',
                  borderColor: isDark ? theme.border : '#E8E4EF',
                  color: theme.text,
                },
              ]}
              placeholder="Name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={modalStyles.btnRow}>
            <Pressable
              onPress={onClose}
              style={[
                modalStyles.btn,
                modalStyles.cancelBtn,
                { backgroundColor: isDark ? '#2A2438' : '#F3F1F6' },
              ]}
            >
              <Text style={[modalStyles.cancelText, { color: theme.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => { if (name.trim()) onSave(qty, unit, name); }}
              style={[modalStyles.btn, modalStyles.saveBtn]}
            >
              <Text style={modalStyles.saveText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Main screen ────────────────────────────────────────── */
export default function ShoppingScreen() {
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  const inputRef = useRef<TextInput>(null);

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
      // user cancelled
    }
  }, [items]);

  const handleCopy = useCallback(async () => {
    const text = formatShoppingListClipboard(items);
    await ExpoClipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Unchecked items copied to clipboard.');
  }, [items]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear all items?',
      'This will remove every item from your shopping list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear all', style: 'destructive', onPress: () => void clearAll() },
      ],
    );
  }, [clearAll]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const groups = useMemo(() => buildGroups(filtered, sortMode), [filtered, sortMode]);

  const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
    { mode: 'recipe', label: '🍽️ Recipe' },
    { mode: 'category', label: '🏪 Aisle' },
    { mode: 'unchecked', label: '☑️ Status' },
  ];

  const totalCount = items.length;
  const checkedCount = totalCount - uncheckedCount;

  return (
    <ScreenContainer scroll gradient>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Shopping list</Text>
          {totalCount > 0 ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {checkedCount}/{totalCount} items done
            </Text>
          ) : (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Add items from recipes or type below.</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => { setShowSearch((v) => !v); }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.75)',
                borderColor: isDark ? theme.border : 'rgba(255,255,255,0.85)',
              },
            ]}
            accessibilityLabel="Search"
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={20} color={theme.text} />
          </Pressable>
          {items.length > 0 ? (
            <>
              <Pressable
                onPress={() => void handleCopy()}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.75)',
                    borderColor: isDark ? theme.border : 'rgba(255,255,255,0.85)',
                  },
                ]}
                accessibilityLabel="Copy list"
              >
                <Ionicons name="copy-outline" size={20} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={handleShare}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.75)',
                    borderColor: isDark ? theme.border : 'rgba(255,255,255,0.85)',
                  },
                ]}
                accessibilityLabel="Share list"
              >
                <Ionicons name="share-outline" size={20} color={theme.text} />
              </Pressable>
            </>
          ) : null}
        </View>
      </View>

      {/* Search bar */}
      {showSearch ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <View style={[styles.searchRow, { backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.85)', borderColor: isDark ? theme.border : 'rgba(255,255,255,0.6)' }]}>
            <Ionicons name="search" size={16} color={theme.textSecondary} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search items..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      {/* Add item input */}
      <View style={styles.addRow}>
        <TextInput
          style={[
            styles.addInput,
            {
              backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.85)',
              borderColor: isDark ? theme.border : 'rgba(255,255,255,0.6)',
              color: theme.text,
            },
          ]}
          placeholder="Add an item..."
          placeholderTextColor={theme.textSecondary}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => void handleAdd()}
          returnKeyType="done"
        />
        <Pressable
          onPress={() => void handleAdd()}
          disabled={!draft.trim()}
          style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
          accessibilityLabel="Add item"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Sort toggle */}
      {items.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map(({ mode, label }) => (
            <Pressable
              key={mode}
              onPress={() => setSortMode(mode)}
              style={[
                styles.sortChip,
                {
                  backgroundColor: isDark ? theme.backgroundElement : 'rgba(255,255,255,0.75)',
                  borderColor: isDark ? theme.border : 'rgba(255,255,255,0.85)',
                },
                sortMode === mode && styles.sortChipActive,
              ]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  { color: theme.text },
                  sortMode === mode && styles.sortChipTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={SnapChef.primary} />
          <Text style={[styles.mutedText, { color: theme.textSecondary }]}>Loading list...</Text>
        </View>
      ) : null}

      {/* Empty state */}
      {!isLoading && items.length === 0 ? (
        <GlassCard tint="lavender">
          <View style={styles.emptyInner}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Your list is empty</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Add items above, or open a recipe and tap &quot;Add Missing&quot; to fill your list.
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)')}
              style={styles.emptyBtn}
              accessibilityRole="button"
            >
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.emptyBtnText}>Browse recipes</Text>
            </Pressable>
          </View>
        </GlassCard>
      ) : null}

      {/* Grouped items */}
      {groups.map((group) => {
        const collapsed = collapsedGroups.has(group.key);
        const allChecked = group.items.every((i) => i.checked);
        return (
          <Animated.View key={group.key} layout={Layout.springify()}>
            {/* Group header */}
            <Pressable
              onPress={() => toggleGroup(group.key)}
              style={styles.groupHeader}
              accessibilityRole="button"
            >
              <View style={[styles.groupDot, { backgroundColor: group.color ?? SnapChef.primary }]} />
              <Text style={styles.groupEmoji}>{group.emoji}</Text>
              <Text style={[styles.groupTitle, { color: theme.text }, allChecked && styles.groupTitleDone]}>
                {group.title}
              </Text>
              <Text style={[styles.groupCount, { backgroundColor: isDark ? '#2A2438' : 'rgba(137,102,250,0.12)', color: theme.tint }]}>
                {group.items.length}
              </Text>
              <Ionicons
                name={collapsed ? 'chevron-forward' : 'chevron-down'}
                size={16}
                color={theme.textSecondary}
              />
            </Pressable>

            {/* Items */}
            {!collapsed &&
              group.items.map((item, idx) => (
                <Animated.View key={item.id} entering={FadeIn.duration(200)} layout={Layout.springify()}>
                    <GlassCard
                      tint={item.checked ? 'white' : idx % 2 === 0 ? 'lavender' : 'mint'}
                      padded={false}
                    >
                      <View style={styles.itemRow}>
                        {/* Left: checkbox tap = toggle */}
                        <Pressable
                          onPress={() => void toggleItem(item.id)}
                          style={styles.checkWrap}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: item.checked }}
                          accessibilityLabel={`Toggle ${item.name}`}
                          hitSlop={6}
                        >
                          <View style={[styles.check, item.checked && styles.checkOn]}>
                            {item.checked ? (
                              <Ionicons name="checkmark" size={13} color="#fff" />
                            ) : null}
                          </View>
                        </Pressable>

                        {/* Centre: text tap = toggle */}
                        <Pressable
                          onPress={() => void toggleItem(item.id)}
                          style={styles.itemTextCol}
                          accessibilityLabel={formatIngredientLine(item)}
                        >
                          <Text
                            style={[styles.itemText, { color: theme.text }, item.checked && styles.itemChecked]}
                            numberOfLines={2}
                          >
                            {formatIngredientLine(item)}
                          </Text>
                          {item.sourceRecipeTitle && sortMode !== 'recipe' ? (
                            <Text style={[styles.itemSource, { color: theme.textSecondary }]} numberOfLines={1}>
                              {item.sourceRecipeTitle}
                            </Text>
                          ) : null}
                        </Pressable>

                        {/* Trailing ⋮ overflow button */}
                        <Pressable
                          onPress={() => setMenuTarget(item)}
                          style={({ pressed }) => [
                            styles.overflowBtn,
                            pressed && styles.overflowBtnPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`More options for ${item.name}`}
                          hitSlop={4}
                        >
                          <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
                        </Pressable>
                      </View>
                    </GlassCard>
                </Animated.View>
              ))}
          </Animated.View>
        );
      })}

      {/* Bottom actions */}
      {items.length > 0 ? (
        <View style={styles.bottomActions}>
          {checkedCount > 0 ? (
            <GlassPill
              label={`Clear ${checkedCount} done`}
              variant="outline"
              icon={<Ionicons name="checkmark-done" size={16} color={theme.text} />}
              onPress={() => void clearChecked()}
              style={{ flex: 1 }}
            />
          ) : null}
          <GlassPill
            label="Clear all"
            variant="outline"
            icon={<Ionicons name="trash-outline" size={16} color="#EF4444" />}
            onPress={handleClearAll}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}

      <EditItemModal
        item={editTarget}
        visible={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSave={(qty, unit, name) => {
          if (editTarget) {
            void updateItem(editTarget.id, {
              name: name.trim(),
              quantity: qty.trim() || undefined,
              unit: unit.trim() || undefined,
            });
          }
          setEditTarget(null);
        }}
      />

      {/* ⋮ Overflow action sheet */}
      <Modal
        visible={menuTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuTarget(null)}
      >
        <Pressable style={menuStyles.overlay} onPress={() => setMenuTarget(null)}>
          <Pressable
            style={[
              menuStyles.sheet,
              {
                backgroundColor: isDark ? '#1C1826' : '#fff',
                borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderTopWidth: isDark ? 1 : 0,
              },
            ]}
            onPress={() => {}}
          >
            <View style={[menuStyles.handle, { backgroundColor: isDark ? theme.border : '#E8E4EF' }]} />

            {/* Item name preview */}
            <Text style={[menuStyles.itemName, { color: theme.textSecondary }]} numberOfLines={1}>
              {menuTarget ? formatIngredientLine(menuTarget) : ''}
            </Text>

            {/* Edit action */}
            <Pressable
              style={({ pressed }) => [
                menuStyles.actionRow,
                pressed && { backgroundColor: isDark ? '#2A2438' : '#F7F5FF' },
              ]}
              onPress={() => {
                const target = menuTarget;
                setMenuTarget(null);
                // small delay so sheet closes before edit sheet opens
                setTimeout(() => setEditTarget(target), 180);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit item"
            >
              <View style={[menuStyles.actionIconWrap, { backgroundColor: 'rgba(91,95,239,0.12)' }]}>
                <Ionicons name="create-outline" size={20} color="#5B5FEF" />
              </View>
              <View style={menuStyles.actionTextCol}>
                <Text style={[menuStyles.actionTitle, { color: theme.text }]}>Edit item</Text>
                <Text style={[menuStyles.actionDesc, { color: theme.textSecondary }]}>Change name, quantity or unit</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </Pressable>

            <View style={[menuStyles.separator, { backgroundColor: theme.border }]} />

            {/* Delete action */}
            <Pressable
              style={({ pressed }) => [
                menuStyles.actionRow,
                pressed && { backgroundColor: isDark ? '#2A2438' : '#F7F5FF' },
              ]}
              onPress={() => {
                const target = menuTarget;
                setMenuTarget(null);
                if (target) void removeItem(target.id);
              }}
              accessibilityRole="button"
              accessibilityLabel="Delete item"
            >
              <View style={[menuStyles.actionIconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <View style={menuStyles.actionTextCol}>
                <Text style={[menuStyles.actionTitle, { color: '#EF4444' }]}>Delete item</Text>
                <Text style={[menuStyles.actionDesc, { color: theme.textSecondary }]}>Remove from your list</Text>
              </View>
            </Pressable>

            {/* Cancel */}
            <Pressable
              style={[menuStyles.cancelRow, { borderTopColor: theme.border }]}
              onPress={() => setMenuTarget(null)}
              accessibilityRole="button"
            >
              <Text style={menuStyles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: SnapChef.ink },
  subtitle: { fontSize: 13, color: SnapChef.muted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    minHeight: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: SnapChef.ink },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: SnapChef.ink,
    minHeight: 48,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnDisabled: { opacity: 0.4 },
  sortScroll: { flexGrow: 0 },
  sortRow: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  sortChipActive: {
    backgroundColor: SnapChef.primary,
    borderColor: SnapChef.primary,
  },
  sortChipText: { fontSize: 13, fontWeight: '600', color: SnapChef.ink },
  sortChipTextActive: { color: '#fff' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mutedText: { color: SnapChef.muted, fontSize: 13 },
  emptyInner: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: SnapChef.ink },
  emptyDesc: {
    fontSize: 13,
    color: SnapChef.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SnapChef.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupEmoji: { fontSize: 15 },
  groupTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: SnapChef.ink },
  groupTitleDone: { color: SnapChef.muted, textDecorationLine: 'line-through' },
  groupCount: {
    fontSize: 12,
    fontWeight: '700',
    color: SnapChef.muted,
    backgroundColor: 'rgba(137,102,250,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.three,
    paddingRight: 8,
    paddingVertical: 12,
    minHeight: 56,
    gap: 0,
  },
  checkWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemTextCol: { flex: 1, paddingVertical: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: SnapChef.primary, borderColor: SnapChef.primary },
  itemText: { fontSize: 15, fontWeight: '600', color: SnapChef.ink },
  itemChecked: { textDecorationLine: 'line-through', color: SnapChef.muted },
  itemSource: { fontSize: 11, color: SnapChef.muted, marginTop: 2 },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  overflowBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 2,
  },
  overflowBtnPressed: {
    backgroundColor: 'rgba(107,101,117,0.1)',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,1,22,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E4EF',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: SnapChef.ink },
  row: { flexDirection: 'row', gap: 10 },
  field: {
    backgroundColor: '#F3F1F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: SnapChef.ink,
    borderWidth: 1,
    borderColor: '#E8E4EF',
  },
  btnRow: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#F3F1F6' },
  saveBtn: { backgroundColor: SnapChef.primary },
  cancelText: { fontSize: 15, fontWeight: '700', color: SnapChef.ink },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,1,22,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E4EF',
    alignSelf: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: SnapChef.muted,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 16,
    minHeight: 56,
  },
  actionRowPressed: {
    backgroundColor: '#F7F5FF',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: { flex: 1 },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SnapChef.ink,
  },
  actionDesc: {
    fontSize: 12,
    color: SnapChef.muted,
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F1F6',
    marginVertical: 2,
  },
  cancelRow: {
    marginTop: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F1F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: SnapChef.primary,
  },
});

