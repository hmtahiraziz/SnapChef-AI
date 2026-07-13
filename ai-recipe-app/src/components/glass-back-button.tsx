import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INK = '#0A0116';

type GlassBackButtonProps = {
  onPress: () => void;
  /** Extra top offset below safe area (e.g. when under a translucent header) */
  topOffset?: number;
};

/**
 * Circular frosted back control — absolute, safe-area aware, reusable on detail screens.
 */
export function GlassBackButton({ onPress, topOffset = 8 }: GlassBackButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + topOffset, left: Math.max(insets.left, 16) }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={styles.shadow}>
        <View style={styles.circle}>
          {Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFillObject, styles.webFallback]} />
          ) : (
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.border} pointerEvents="none" />
          <Ionicons name="chevron-back" size={22} color={INK} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 50,
  },
  shadow: {
    borderRadius: 22,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  webFallback: {
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
});
