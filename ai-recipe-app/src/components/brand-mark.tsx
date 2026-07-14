import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type BrandMarkProps = {
  size?: number;
  /** Light screens (auth/onboarding); dark uses stronger rim. Default: light */
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared SnapChef logo mark for headers (home, auth, onboarding).
 */
export function BrandMark({ size = 40, tone = 'light', style }: BrandMarkProps) {
  const frame = size + 4;
  const radius = Math.round(size * 0.28);
  const frameRadius = Math.round(frame * 0.28);

  return (
    <View
      style={[
        styles.frame,
        {
          width: frame,
          height: frame,
          borderRadius: frameRadius,
          padding: 2,
        },
        tone === 'dark' ? styles.frameDark : styles.frameLight,
        style,
      ]}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        accessibilityLabel="SnapChef AI"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameLight: {
    backgroundColor: 'rgba(137, 102, 250, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(137, 102, 250, 0.22)',
  },
  frameDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(216, 207, 255, 0.55)',
    shadowColor: '#D8CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
});
