import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Fonts, Radii, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ShoppingListItem } from '@/services/shoppingListStorage';
import { formatIngredientLine } from '@/utils/scaleRecipe';

import { SLColors, SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  item: ShoppingListItem | null;
  onClose: () => void;
  onEdit: (item: ShoppingListItem) => void;
  onDelete: (id: string) => void;
};

export function ItemMenuSheet({ item, onClose, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const sheetBg = theme.isDark ? theme.backgroundElement : SnapChef.white;

  return (
    <BottomSheetModal
      visible={item !== null}
      onClose={onClose}
      sheetStyle={[styles.sheet, { backgroundColor: sheetBg }]}>
      <View style={[styles.handle, { backgroundColor: theme.isDark ? theme.border : '#D8D2E4' }]} />

      <Text style={[styles.itemName, { color: theme.text, fontFamily: Fonts.bodyBold }]} numberOfLines={2}>
        {item ? formatIngredientLine(item) : ''}
      </Text>
      <Text style={[styles.hint, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
        Choose an action
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            if (!item) return;
            onClose();
            setTimeout(() => onEdit(item), 220);
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit item"
          style={({ pressed }) => [pressed ? styles.pressed : null]}>
          <View
            style={[
              styles.actionRow,
              { backgroundColor: theme.isDark ? 'rgba(137,102,250,0.16)' : '#F3EEFF' },
            ]}>
            <View style={[styles.iconCircle, { backgroundColor: SnapChef.primary }]}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.actionTitle, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                Edit
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Name, quantity, or unit
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!item) return;
            onClose();
            onDelete(item.id);
          }}
          accessibilityRole="button"
          accessibilityLabel="Delete item"
          style={({ pressed }) => [pressed ? styles.pressed : null]}>
          <View
            style={[
              styles.actionRow,
              { backgroundColor: theme.isDark ? 'rgba(229,57,53,0.14)' : '#FEF2F2' },
            ]}>
            <View style={[styles.iconCircle, { backgroundColor: SLColors.danger }]}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.actionTitle, { color: SLColors.danger, fontFamily: Fonts.bodyBold }]}>
                Delete
              </Text>
              <Text style={[styles.actionDesc, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Remove from your list
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        style={({ pressed }) => [pressed ? styles.pressed : null]}>
        <View
          style={[
            styles.cancelFace,
            { backgroundColor: theme.isDark ? theme.backgroundSelected : SnapChef.field },
          ]}>
          <Text style={[styles.cancelText, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
            Cancel
          </Text>
        </View>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
    paddingTop: SLSpacing.md,
    paddingHorizontal: SLSpacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SLSpacing.md,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: SLSpacing.md,
  },
  actions: {
    width: '100%',
    marginBottom: SLSpacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radii.card,
    minHeight: TOUCH_MIN + 16,
    marginBottom: SLSpacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
  },
  cancelFace: {
    width: '100%',
    minHeight: TOUCH_MIN + 4,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
