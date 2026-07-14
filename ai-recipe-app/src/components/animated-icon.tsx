import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

/**
 * Compact SnapChef mark for in-app use.
 * Responsive — scales with screen width; no Reanimated (APK-safe).
 */
export function AnimatedIcon({ size }: { size?: number }) {
  const { width } = useWindowDimensions();
  const resolved = size ?? Math.min(96, Math.round(width * 0.22));

  return (
    <View style={[styles.wrap, { width: resolved, height: resolved, borderRadius: resolved * 0.28 }]}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: resolved, height: resolved, borderRadius: resolved * 0.28 }}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
