import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  checkedCount: number;
  onClearChecked: () => void;
  onClearAll: () => void;
};

export function ClearAllButton({ checkedCount, onClearChecked, onClearAll }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {checkedCount > 0 ? (
        <Pressable
          onPress={onClearChecked}
          style={[
            styles.btn,
            {
              backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
              borderColor: theme.isDark ? theme.border : '#E8E4EF',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Clear ${checkedCount} done items`}>
          <Ionicons name="checkmark-done" size={16} color={theme.text} />
          <Text style={[styles.btnText, { color: theme.text }]}>Clear {checkedCount} done</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onClearAll}
        style={styles.clearAll}
        accessibilityRole="button"
        accessibilityLabel="Clear all items">
        <Ionicons name="trash-outline" size={16} color={SLColors.danger} />
        <Text style={styles.clearAllText}>Clear all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SLSpacing.sm,
    marginTop: SLSpacing.xs,
  },
  btn: {
    flexGrow: 1,
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: SLRadii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SLSpacing.md,
  },
  btnText: { fontSize: 14, fontWeight: '700' },
  clearAll: {
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SLSpacing.sm,
    paddingVertical: SLSpacing.sm,
  },
  clearAllText: { fontSize: 14, fontWeight: '700', color: SLColors.danger },
});
