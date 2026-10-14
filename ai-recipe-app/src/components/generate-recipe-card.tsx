import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GenerateRecipeCardProps = {
  ingredientCount: number;
  country: string;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Generate Recipe CTA — single surface, theme-aligned, arrow pinned right.
 * No outer border (parent craft card already provides the frame).
 */
export function GenerateRecipeCard({
  ingredientCount,
  country,
  disabled = false,
  onPress,
}: GenerateRecipeCardProps) {
  const theme = useTheme();
  const ready = !disabled && ingredientCount > 0;

  const idleColors: [string, string] = theme.isDark
    ? [theme.backgroundSelected, theme.field]
    : [SnapChef.field, SnapChef.fieldBorder];

  return (
    <View
      style={[
        styles.shadow,
        { shadowColor: ready ? SnapChef.primary : theme.isDark ? '#000' : SnapChef.primary },
        !ready && styles.shadowMuted,
      ]}>
      <LinearGradient
        colors={ready ? [SnapChef.primary, '#6B4FE0'] : idleColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        {ready ? <View style={styles.glow} pointerEvents="none" /> : null}

        <View style={styles.topRow}>
          <View
            style={[
              styles.iconChip,
              {
                backgroundColor: ready
                  ? SnapChef.white
                  : theme.isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.75)',
              },
            ]}>
            <Ionicons
              name="sparkles"
              size={18}
              color={ready ? SnapChef.primary : theme.textSecondary}
            />
          </View>
          <View style={styles.copy}>
            <Text
              style={[
                styles.title,
                { color: ready ? SnapChef.white : theme.text },
              ]}>
              Generate Recipe
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: ready ? 'rgba(255,255,255,0.85)' : theme.textSecondary,
                },
              ]}
              numberOfLines={2}>
              {ready
                ? `${ingredientCount} ingredient${ingredientCount === 1 ? '' : 's'} · ${country}`
                : 'Add at least one ingredient to continue'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityLabel="Generate Recipe"
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: ready
                ? SnapChef.white
                : theme.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.72)',
            },
            pressed && ready && styles.ctaPressed,
          ]}>
          <Text
            style={[
              styles.ctaText,
              { color: ready ? SnapChef.ink : theme.textSecondary },
            ]}
            numberOfLines={1}>
            {ready ? 'Cook with AI' : 'Waiting for ingredients'}
          </Text>
          <View
            style={[
              styles.ctaArrow,
              {
                backgroundColor: ready
                  ? SnapChef.secondary
                  : theme.isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(10,1,22,0.06)',
              },
            ]}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={ready ? SnapChef.primary : theme.textSecondary}
            />
          </View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: Radii.card,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  shadowMuted: {
    shadowOpacity: 0.06,
    elevation: 1,
  },
  card: {
    borderRadius: Radii.card,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
    // Single surface only — parent craft card owns the outer border.
    borderWidth: 0,
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SnapChef.secondary,
    opacity: 0.16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: Radii.pill,
    paddingLeft: 18,
    paddingRight: 8,
    gap: 12,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  ctaText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 0,
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
  },
});
