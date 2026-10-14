import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AddItemBar({ value, onChange, onSubmit, style }: Props) {
  const theme = useTheme();
  const canSubmit = value.trim().length > 0;

  return (
    <View style={[styles.row, style]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
            borderColor: theme.isDark ? theme.border : '#E8E4EF',
            color: theme.text,
          },
        ]}
        placeholder="Add an item..."
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        blurOnSubmit={false}
      />
      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        style={[styles.addBtn, !canSubmit && styles.addBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Add item"
        accessibilityState={{ disabled: !canSubmit }}>
        <Ionicons name="add" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SLSpacing.sm },
  input: {
    flex: 1,
    minHeight: TOUCH_MIN,
    borderRadius: SLRadii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SLSpacing.lg,
    paddingVertical: SLSpacing.sm,
    fontSize: 15,
    fontWeight: '500',
  },
  addBtn: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: SLRadii.md,
    backgroundColor: SLColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
});
