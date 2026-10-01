import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Radii, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GlassPillProps = {
  label: string;
  onPress?: () => void;
  variant?: 'glass' | 'primary' | 'ink' | 'outline';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  /** Override label/spinner color (e.g. black on primary). */
  labelColor?: string;
  /** Stretch to parent width (common on narrow phones). */
  fullWidth?: boolean;
};

function usePillMetrics() {
  const { width } = useWindowDimensions();
  const isTiny = width < 340;
  const isCompact = width < 380;
  const isTablet = width >= 768;

  return {
    minHeight: isTiny ? 48 : isCompact ? 50 : isTablet ? 56 : 52,
    paddingHorizontal: isTiny ? 16 : isCompact ? 18 : isTablet ? 26 : 22,
    fontSize: isTiny ? 14 : isCompact ? 15 : 16,
    radius: Radii.pill,
  };
}

export function GlassPill({
  label,
  onPress,
  variant = 'glass',
  icon,
  loading = false,
  disabled = false,
  style,
  labelColor: labelColorProp,
  fullWidth = false,
}: GlassPillProps) {
  const theme = useTheme();
  const metrics = usePillMetrics();
  const isDisabled = disabled || loading;

  const baseStyle = [
    styles.base,
    {
      minHeight: metrics.minHeight,
      paddingHorizontal: metrics.paddingHorizontal,
      borderRadius: metrics.radius,
      alignSelf: fullWidth ? ('stretch' as const) : ('auto' as const),
      width: fullWidth ? ('100%' as const) : undefined,
    },
  ];

  if (variant === 'primary' || variant === 'ink') {
    const bg = variant === 'primary' ? SnapChef.primary : theme.isDark ? '#F3F2F7' : SnapChef.ink;
    const labelColor =
      labelColorProp ?? (variant === 'ink' && theme.isDark ? SnapChef.ink : '#FFFFFF');
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          ...baseStyle,
          { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1 },
          styles.glow,
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { color: labelColor, fontSize: metrics.fontSize }]}>
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          ...baseStyle,
          styles.outline,
          {
            borderColor: SnapChef.fieldBorder,
            backgroundColor: SnapChef.field,
            opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          },
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={SnapChef.ink} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { color: SnapChef.ink, fontSize: metrics.fontSize }]}>
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        fullWidth && styles.fullWidth,
        { opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 },
        style,
      ]}>
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(36,36,48,0.92)', 'rgba(28,26,40,0.88)']
            : ['rgba(255,255,255,0.92)', 'rgba(247,243,255,0.88)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          ...baseStyle,
          styles.glassBorder,
          {
            borderColor: theme.isDark ? theme.cardBorder : 'rgba(255,255,255,0.75)',
          },
        ]}>
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, { color: theme.text, fontSize: metrics.fontSize }]}>
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  glassBorder: {
    borderWidth: 1.5,
  },
  outline: {
    borderWidth: 1.5,
  },
  glow: {
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '700',
  },
});
