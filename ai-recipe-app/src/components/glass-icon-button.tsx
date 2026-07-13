import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

const INK = '#0A0116';

type GlassIconButtonProps = {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
  accessibilityLabel: string;
};

/** Frosted circular icon button (e.g. favorite heart on recipe cards). */
export function GlassIconButton({
  onPress,
  icon,
  color = INK,
  size = 40,
  accessibilityLabel,
}: GlassIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFillObject, styles.webFallback]} />
        ) : (
          <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFillObject} />
        )}
        <View style={[styles.border, { borderRadius: size / 2 }]} pointerEvents="none" />
        <Ionicons name={icon} size={Math.round(size * 0.45)} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  webFallback: { backgroundColor: 'rgba(255,255,255,0.9)' },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
});
