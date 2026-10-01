import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SnapChef, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type GlassTint = 'lavender' | 'mint' | 'cream' | 'peach' | 'white' | 'yellow';

const TINT_COLORS_LIGHT: Record<GlassTint, [string, string]> = {
  lavender: ['rgba(216,207,255,0.92)', 'rgba(237,231,255,0.88)'],
  mint: ['rgba(216,245,227,0.95)', 'rgba(232,250,240,0.9)'],
  cream: ['rgba(255,246,214,0.95)', 'rgba(255,250,235,0.9)'],
  peach: ['rgba(255,232,240,0.95)', 'rgba(255,244,248,0.9)'],
  white: ['rgba(255,255,255,0.92)', 'rgba(247,244,255,0.88)'],
  yellow: ['rgba(255,225,0,0.88)', 'rgba(255,240,120,0.85)'],
};

const TINT_COLORS_DARK: Record<GlassTint, [string, string]> = {
  lavender: ['rgba(36,36,48,0.96)', 'rgba(28,26,40,0.94)'],
  mint: ['rgba(22,40,32,0.96)', 'rgba(16,30,24,0.94)'],
  cream: ['rgba(42,38,26,0.96)', 'rgba(30,28,18,0.94)'],
  peach: ['rgba(42,26,34,0.96)', 'rgba(30,18,24,0.94)'],
  white: ['rgba(28,28,36,0.96)', 'rgba(22,22,30,0.94)'],
  yellow: ['rgba(48,42,16,0.92)', 'rgba(34,30,12,0.9)'],
};

type GlassCardProps = {
  children: ReactNode;
  tint?: GlassTint;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function GlassCard({ children, tint = 'lavender', style, padded = true }: GlassCardProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? TINT_COLORS_DARK[tint] : TINT_COLORS_LIGHT[tint];

  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)',
          },
        ]}
      >
        <View
          style={[
            styles.highlight,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
            },
          ]}
          pointerEvents="none"
        />
        <View style={padded ? styles.pad : undefined}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    opacity: 0.6,
  },
  pad: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
