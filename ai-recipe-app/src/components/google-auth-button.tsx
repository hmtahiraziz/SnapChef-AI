import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Google "G" logo — authentic 4-color mark, not a generic icon-font glyph.
 * Requires: npx expo install react-native-svg
 */
function GoogleGLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.9 36.3 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </Svg>
  );
}

type Props = {
  onPress: () => void;
  variant?: 'compact' | 'full';
  disabled?: boolean;
};

/**
 * Google sign-in button — two variants:
 *  - "compact": small centered pill, label "Google" (matches reference image)
 *  - "full": edge-to-edge pill, label "Continue with Google"
 *
 * Usage:
 *   <GoogleAuthButton onPress={signInWithGoogle} variant="compact" />
 */
export function GoogleAuthButton({ onPress, variant = 'compact', disabled }: Props) {
  const isCompact = variant === 'compact';
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={[
        styles.base,
        isCompact ? styles.compact : styles.full,
        isPressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        <GoogleGLogo size={22} />
        <Text style={styles.label}>{isCompact ? 'Google' : 'Continue with Google'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    backgroundColor: '#F5F4FA', // Very light lavender/off-white background
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Subtle border
    borderColor: 'rgba(10, 1, 22, 0.08)', // 8% opacity border for crisp definition
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, // Soft minimal iOS shadow
    shadowRadius: 4,
    elevation: 2, // Explicit elevation shadow for Android
  },
  compact: {
    alignSelf: 'center', // Centers itself horizontally in stretch parent containers
    paddingHorizontal: 32, // Increased padding
    paddingVertical: 14,
  },
  full: {
    width: '100%',
    paddingVertical: 15,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16, // Premium font size
    fontWeight: '600', // Semi-bold weight
    color: '#0A0116',
    letterSpacing: 0.2, // Premium typography
  },
});
