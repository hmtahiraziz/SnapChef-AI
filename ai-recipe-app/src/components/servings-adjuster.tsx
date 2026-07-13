import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ServingsAdjusterProps = {
  servings: number;
  min?: number;
  max?: number;
  onChange: (servings: number) => void;
};

export function ServingsAdjuster({
  servings,
  min = 1,
  max = 12,
  onChange,
}: ServingsAdjusterProps) {
  const theme = useTheme();

  const decrease = () => {
    if (servings > min) {
      onChange(servings - 1);
    }
  };

  const increase = () => {
    if (servings < max) {
      onChange(servings + 1);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={decrease}
        disabled={servings <= min}
        accessibilityLabel="Decrease servings"
        accessibilityRole="button"
        accessibilityState={{ disabled: servings <= min }}
        style={[
          styles.button,
          {
            borderColor: theme.backgroundSelected,
            opacity: servings <= min ? 0.4 : 1,
          },
        ]}>
        <ThemedText type="smallBold">−</ThemedText>
      </Pressable>

      <ThemedText type="smallBold">{servings} servings</ThemedText>

      <Pressable
        onPress={increase}
        disabled={servings >= max}
        accessibilityLabel="Increase servings"
        accessibilityRole="button"
        accessibilityState={{ disabled: servings >= max }}
        style={[
          styles.button,
          {
            borderColor: theme.backgroundSelected,
            opacity: servings >= max ? 0.4 : 1,
          },
        ]}>
        <ThemedText type="smallBold">+</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  button: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
