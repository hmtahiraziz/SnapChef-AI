import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#8966FA';
const SECONDARY = '#FFE100';
const INK = '#0A0116';

type AiScanButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
};

/** AI Scan control — camera + sparkles badge. */
export function AiScanButton({ onPress, disabled, compact = false }: AiScanButtonProps) {
  const size = compact ? 48 : 64;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="AI Scan ingredients with camera"
      style={[styles.wrap, compact && styles.wrapCompact, disabled && styles.disabled]}>
      <LinearGradient
        colors={[PRIMARY, '#6B4FE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="camera" size={compact ? 22 : 28} color="#fff" />
      </LinearGradient>
      <View style={[styles.badge, compact && styles.badgeCompact]}>
        <Ionicons name="sparkles" size={compact ? 10 : 12} color={PRIMARY} />
      </View>
      {!compact ? <Text style={styles.label}>AI Scan</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 88,
  },
  wrapCompact: {
    width: 56,
  },
  disabled: { opacity: 0.45 },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 40,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeCompact: {
    top: 30,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
});
