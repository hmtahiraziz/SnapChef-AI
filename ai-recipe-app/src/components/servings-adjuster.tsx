import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SnapChef } from '@/constants/theme';
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
    <View
      style={[
        styles.stepper,
        {
          backgroundColor: theme.isDark ? theme.field : '#F5F3F8',
          borderColor: theme.isDark ? theme.border : '#E6E1EC',
        },
      ]}>
      <Pressable
        onPress={decrease}
        disabled={servings <= min}
        accessibilityLabel="Decrease servings"
        accessibilityRole="button"
        accessibilityState={{ disabled: servings <= min }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
            borderColor: theme.isDark ? theme.border : '#E8E4EF',
            opacity: servings <= min ? 0.4 : 1,
          },
          pressed && servings > min && styles.buttonPressed,
        ]}>
        <Text style={[styles.buttonText, { color: theme.text }]}>−</Text>
      </Pressable>

      <Text style={[styles.value, { color: theme.text }]}>
        {servings} serving{servings === 1 ? '' : 's'}
      </Text>

      <Pressable
        onPress={increase}
        disabled={servings >= max}
        accessibilityLabel="Increase servings"
        accessibilityRole="button"
        accessibilityState={{ disabled: servings >= max }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
            borderColor: theme.isDark ? theme.border : '#E8E4EF',
            opacity: servings >= max ? 0.4 : 1,
          },
          pressed && servings < max && styles.buttonPressed,
        ]}>
        <Text style={[styles.buttonText, { color: theme.text }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
    color: SnapChef.ink,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'center',
  },
});
