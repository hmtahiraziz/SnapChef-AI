import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SnapChef } from '@/constants/theme';

type GlassPillProps = {
  label: string;
  onPress?: () => void;
  variant?: 'glass' | 'primary' | 'ink' | 'outline';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function GlassPill({
  label,
  onPress,
  variant = 'glass',
  icon,
  loading = false,
  disabled = false,
  style,
}: GlassPillProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary' || variant === 'ink') {
    const bg = variant === 'primary' ? SnapChef.primary : SnapChef.ink;
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1 },
          styles.glow,
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={styles.labelLight}>{label}</Text>
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
          styles.base,
          styles.outline,
          { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
          style,
        ]}>
        {loading ? (
          <ActivityIndicator color={SnapChef.ink} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={styles.labelDark}>{label}</Text>
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
      style={({ pressed }) => [{ opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 }, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.72)', 'rgba(216,207,255,0.45)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles.glassBorder]}>
        {loading ? (
          <ActivityIndicator color={SnapChef.ink} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={styles.labelDark}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 999,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: SnapChef.fieldBorder,
    backgroundColor: SnapChef.white,
  },
  glow: {
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelLight: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  labelDark: {
    color: SnapChef.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});
