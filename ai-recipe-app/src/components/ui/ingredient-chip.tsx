import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SnapChef } from '@/constants/theme';

type IngredientChipProps = {
  label: string;
  onRemove?: () => void;
  dashed?: boolean;
  onPress?: () => void;
};

const getIngredientEmoji = (label: string): string => {
  const lower = label.toLowerCase();
  if (lower.includes('milk') || lower.includes('dairy')) return '🥛';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('chicken') || lower.includes('poultry')) return '🍗';
  if (lower.includes('beef') || lower.includes('meat') || lower.includes('steak')) return '🥩';
  if (lower.includes('pork') || lower.includes('bacon')) return '🥓';
  if (lower.includes('cheese')) return '🧀';
  if (lower.includes('bread') || lower.includes('toast')) return '🍞';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('fish') || lower.includes('salmon') || lower.includes('tuna')) return '🐟';
  if (lower.includes('shrimp') || lower.includes('prawn')) return '🍤';
  if (lower.includes('rice')) return '🍚';
  if (lower.includes('pasta') || lower.includes('noodle')) return '🍝';
  if (lower.includes('lemon') || lower.includes('lime')) return '🍋';
  if (lower.includes('salt') || lower.includes('pepper')) return '🧂';
  if (lower.includes('oil') || lower.includes('olive')) return '🫒';
  if (lower.includes('carrot')) return '🥕';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('grape')) return '🍇';
  if (lower.includes('mushroom')) return '🍄';
  if (
    lower.includes('spinach') ||
    lower.includes('lettuce') ||
    lower.includes('salad') ||
    lower.includes('leaf')
  )
    return '🥬';
  if (lower.includes('flour')) return '🌾';
  if (lower.includes('sugar') || lower.includes('honey')) return '🍯';
  return '🍳';
};

import { useTheme } from '@/hooks/use-theme';

export function IngredientChip({ label, onRemove, dashed, onPress }: IngredientChipProps) {
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  if (dashed) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.dashed,
          {
            backgroundColor: isDark ? 'rgba(28, 24, 38, 0.65)' : 'rgba(255, 255, 255, 0.78)',
            borderColor: isDark ? 'rgba(137, 102, 250, 0.35)' : 'rgba(137, 102, 250, 0.45)',
          },
          pressed && styles.dashedPressed,
        ]}
      >
        <View style={styles.addDisc}>
          <Ionicons name="add" size={16} color="#fff" />
        </View>
        <Text style={[styles.dashedLabel, { color: theme.text }]}>{label}</Text>
      </Pressable>
    );
  }

  const emoji = getIngredientEmoji(label);

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? 'rgba(28, 24, 38, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.55)',
        },
      ]}
    >
      <Text style={styles.emojiText}>{emoji}</Text>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          style={({ pressed }) => [
            styles.removeBtn,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 1, 22, 0.06)',
            },
            pressed && {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(10, 1, 22, 0.12)',
            },
          ]}
        >
          <Ionicons name="close" size={12} color={theme.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 20,
    minHeight: 36,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emojiText: {
    fontSize: 14,
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: SnapChef.ink,
  },
  removeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(10, 1, 22, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  removeBtnPressed: {
    backgroundColor: 'rgba(10, 1, 22, 0.12)',
  },
  dashed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingLeft: 6,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(137, 102, 250, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dashedPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  addDisc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: SnapChef.ink,
  },
});
