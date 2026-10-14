import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Fonts, Radii, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ShoppingListItem } from '@/services/shoppingListStorage';

import { SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  item: ShoppingListItem | null;
  visible: boolean;
  onClose: () => void;
  onSave: (qty: string, unit: string, name: string) => void;
};

export function EditItemModal({ item, visible, onClose, onSave }: Props) {
  const theme = useTheme();
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!item) return;
    setQty(item.quantity ?? '');
    setUnit(item.unit ?? '');
    setName(item.name ?? '');
  }, [item]);

  const fieldBg = theme.isDark ? theme.field : SnapChef.field;
  const fieldBorder = theme.isDark ? theme.border : SnapChef.fieldBorder;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      sheetStyle={[
        styles.sheet,
        { backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white },
      ]}>
      <View style={[styles.handle, { backgroundColor: theme.isDark ? theme.border : '#E8E4EF' }]} />
      <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.bodyBold }]}>Edit item</Text>

      <View style={styles.row}>
        <View style={styles.qtySlot}>
          <TextInput
            style={[
              styles.field,
              { backgroundColor: fieldBg, borderColor: fieldBorder, color: theme.text },
            ]}
            placeholder="Qty"
            placeholderTextColor={theme.textSecondary}
            value={qty}
            onChangeText={setQty}
          />
        </View>
        <View style={styles.unitSlot}>
          <TextInput
            style={[
              styles.field,
              { backgroundColor: fieldBg, borderColor: fieldBorder, color: theme.text },
            ]}
            placeholder="Unit"
            placeholderTextColor={theme.textSecondary}
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        <View style={styles.nameSlot}>
          <TextInput
            style={[
              styles.field,
              { backgroundColor: fieldBg, borderColor: fieldBorder, color: theme.text },
            ]}
            placeholder="Name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

      <View style={styles.btnRow}>
        <View style={styles.btnSlot}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
            style={({ pressed }) => [pressed ? styles.pressed : null]}>
            <View
              style={[
                styles.btnFace,
                { backgroundColor: theme.isDark ? theme.backgroundSelected : SnapChef.field },
              ]}>
              <Text style={[styles.cancelText, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                Cancel
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.btnSlot}>
          <Pressable
            onPress={() => {
              if (name.trim()) onSave(qty, unit, name);
            }}
            accessibilityRole="button"
            accessibilityLabel="Save item"
            style={({ pressed }) => [pressed ? styles.pressed : null]}>
            <View style={[styles.btnFace, { backgroundColor: SnapChef.primary }]}>
              <Text style={[styles.saveText, { fontFamily: Fonts.bodyBold }]}>Save</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: Radii.card,
    borderTopRightRadius: Radii.card,
    paddingHorizontal: SLSpacing.xl,
    paddingTop: SLSpacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SLSpacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SLSpacing.lg,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SLSpacing.lg,
  },
  qtySlot: {
    width: 70,
    marginRight: 10,
  },
  unitSlot: {
    width: 90,
    marginRight: 10,
  },
  nameSlot: {
    flex: 1,
    minWidth: 0,
  },
  field: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: SLSpacing.md,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: TOUCH_MIN,
  },
  btnRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  btnSlot: {
    flex: 1,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  btnFace: {
    width: '100%',
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
