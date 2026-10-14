import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useTheme } from '@/hooks/use-theme';
import type { ShoppingListItem } from '@/services/shoppingListStorage';
import { CATEGORY_META, categorizeIngredient } from '@/utils/ingredientCategory';
import { formatIngredientLine } from '@/utils/scaleRecipe';

import {
  CARD_MIN_HEIGHT,
  getCategoryTint,
  SLColors,
  SLRadii,
  SLSpacing,
  TOUCH_MIN,
} from '../theme';

type Props = {
  item: ShoppingListItem;
  showSource?: boolean;
  onToggle: (id: string) => void;
  onMenu: (item: ShoppingListItem) => void;
  onEdit: (item: ShoppingListItem) => void;
  onDelete: (id: string) => void;
  columnFlex?: number;
};

/**
 * Flat category-tinted row. No border/shadow on the card.
 * Swipe reveals inset Edit / Delete pills (not edge-to-edge blocks).
 */
function ShoppingItemCardInner({
  item,
  showSource,
  onToggle,
  onMenu,
  onEdit,
  onDelete,
  columnFlex = 1,
}: Props) {
  const theme = useTheme();
  const swipeRef = useRef<Swipeable>(null);
  const category = categorizeIngredient(item.name);
  const tint = getCategoryTint(category, theme.isDark);

  const line = formatIngredientLine(item);
  const surface = item.checked
    ? theme.isDark
      ? theme.backgroundElement
      : '#F3F2F7'
    : tint.backgroundColor;
  const checkColor = item.checked ? SLColors.primary : tint.check;

  const closeSwipe = useCallback(() => {
    swipeRef.current?.close();
  }, []);

  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            closeSwipe();
            onEdit(item);
          }}
          style={({ pressed }) => [styles.actionPill, styles.editPill, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel="Edit item">
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionLabel}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            closeSwipe();
            onDelete(item.id);
          }}
          style={({ pressed }) => [
            styles.actionPill,
            styles.deletePill,
            pressed && styles.actionPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete item">
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionLabel}>Delete</Text>
        </Pressable>
      </View>
    );
  }, [closeSwipe, item, onDelete, onEdit]);

  return (
    <View
      style={[
        styles.wrap,
        columnFlex < 1
          ? { width: `${columnFlex * 100}%`, paddingHorizontal: SLSpacing.xs }
          : { width: '100%' },
      ]}>
      <Swipeable
        ref={swipeRef}
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        renderRightActions={renderRightActions}
        childrenContainerStyle={styles.swipeChild}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: surface,
              opacity: item.checked ? 0.55 : 1,
            },
          ]}>
          <Pressable
            onPress={() => onToggle(item.id)}
            style={styles.checkWrap}
            android_ripple={{ color: 'transparent' }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            accessibilityLabel={`Toggle ${item.name}`}>
            <View
              style={[
                styles.check,
                {
                  borderColor: checkColor,
                  backgroundColor: item.checked ? checkColor : 'transparent',
                },
              ]}>
              {item.checked ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
            </View>
          </Pressable>

          <Pressable
            onPress={() => onToggle(item.id)}
            style={styles.textCol}
            android_ripple={{ color: 'transparent' }}
            accessibilityLabel={line}>
            <Text
              style={[styles.name, { color: theme.text }, item.checked && styles.nameChecked]}
              numberOfLines={2}>
              {line}
            </Text>
            <Text style={[styles.category, { color: tint.color }]} numberOfLines={1}>
              {CATEGORY_META[category].label.toUpperCase()}
            </Text>
            {showSource && item.sourceRecipeTitle ? (
              <Text style={[styles.source, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.sourceRecipeTitle}
              </Text>
            ) : null}
          </Pressable>

          <Pressable
            onPress={() => {
              closeSwipe();
              onMenu(item);
            }}
            style={({ pressed }) => [styles.menuBtn, pressed && styles.menuPressed]}
            android_ripple={{ color: 'rgba(137,102,250,0.12)', borderless: true, radius: 22 }}
            accessibilityRole="button"
            accessibilityLabel={`More options for ${item.name}`}>
            <Ionicons name="ellipsis-vertical" size={16} color={theme.textSecondary} />
          </Pressable>
        </View>
      </Swipeable>
    </View>
  );
}

export const ShoppingItemCard = memo(ShoppingItemCardInner);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: SLRadii.lg,
  },
  swipeChild: {
    // Keep the sliding row flush — no outer border/outline.
    borderRadius: SLRadii.lg,
    overflow: 'hidden',
  },
  /** Single fill only — never set borderWidth here. */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: CARD_MIN_HEIGHT,
    borderRadius: SLRadii.lg,
    paddingLeft: SLSpacing.xs,
    paddingRight: 2,
    paddingVertical: 8,
  },
  checkWrap: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: SLSpacing.xs,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  nameChecked: {
    textDecorationLine: 'line-through',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  source: {
    fontSize: 11,
    fontWeight: '500',
  },
  menuBtn: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TOUCH_MIN / 2,
  },
  menuPressed: {
    backgroundColor: 'rgba(137, 102, 250, 0.1)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    paddingLeft: 8,
    paddingVertical: 2,
  },
  actionPill: {
    width: 72,
    borderRadius: SLRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  editPill: {
    backgroundColor: '#5B5FEF',
  },
  deletePill: {
    backgroundColor: SLColors.danger,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
