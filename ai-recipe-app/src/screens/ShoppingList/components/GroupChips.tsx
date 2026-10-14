import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SORT_OPTIONS, type SortMode } from '../useShoppingListScreen';
import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  scrollable?: boolean;
};

export function GroupChips({ value, onChange, scrollable = true }: Props) {
  const theme = useTheme();

  const chips = SORT_OPTIONS.map((opt) => {
    const active = value === opt.mode;
    return (
      <Pressable
        key={opt.mode}
        onPress={() => onChange(opt.mode)}
        style={[
          styles.chip,
          {
            backgroundColor: active
              ? SLColors.primary
              : theme.isDark
                ? theme.backgroundElement
                : '#FFFFFF',
            borderColor: active
              ? SLColors.primary
              : theme.isDark
                ? theme.border
                : '#E8E4EF',
          },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`Group by ${opt.label}`}>
        <Ionicons name={opt.icon} size={14} color={active ? '#fff' : theme.textSecondary} />
        <Text style={[styles.chipText, { color: active ? '#fff' : theme.text }]}>{opt.label}</Text>
      </Pressable>
    );
  });

  if (!scrollable) return <View style={styles.wrapRow}>{chips}</View>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      style={styles.scroll}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled">
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SLSpacing.sm,
    paddingVertical: 2,
    paddingRight: SLSpacing.sm,
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SLSpacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH_MIN - 4,
    paddingHorizontal: 14,
    borderRadius: SLRadii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
});
