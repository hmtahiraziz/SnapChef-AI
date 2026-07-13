import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExtractedIngredient } from '../types';

type IngredientReviewSheetProps = {
  visible: boolean;
  items: ExtractedIngredient[];
  onToggle: (index: number) => void;
  onRename: (index: number, name: string) => void;
  onRemove: (index: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function IngredientReviewSheet({
  visible,
  items,
  onToggle,
  onRename,
  onRemove,
  onConfirm,
  onCancel,
}: IngredientReviewSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const selectedCount = items.filter((item) => item.selected && item.name.trim()).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <ThemedView
          type="backgroundElement"
          style={[
            styles.sheet,
            {
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, Spacing.three),
            },
          ]}>
          <ThemedText type="smallBold">Review ingredients</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Uncheck or edit names before adding them to your kitchen list.
          </ThemedText>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {items.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                style={[styles.row, { borderColor: theme.border }]}>
                <Pressable
                  onPress={() => onToggle(index)}
                  hitSlop={8}
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.tint,
                      backgroundColor: item.selected ? theme.tint : 'transparent',
                    },
                  ]}
                />
                <TextInput
                  value={item.name}
                  onChangeText={(text) => onRename(index, text)}
                  placeholder="Ingredient name"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      opacity: item.selected ? 1 : 0.55,
                    },
                  ]}
                />
                {typeof item.confidence === 'number' ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.confidence}>
                    {Math.round(item.confidence * 100)}%
                  </ThemedText>
                ) : null}
                <Pressable onPress={() => onRemove(index)} hitSlop={10} style={styles.removeBtn}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Remove
                  </ThemedText>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">Cancel</ThemedText>
            </Pressable>
            <Pressable
              disabled={selectedCount === 0}
              onPress={onConfirm}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.tint,
                  opacity: selectedCount === 0 ? 0.4 : 1,
                },
              ]}>
              <ThemedText type="smallBold" style={styles.primaryText}>
                Add {selectedCount || ''}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  list: {
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.two,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    minHeight: 44,
    fontSize: 15,
  },
  confidence: {
    minWidth: 36,
    textAlign: 'right',
  },
  removeBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: Spacing.two,
  },
  primaryText: {
    color: '#ffffff',
  },
});
