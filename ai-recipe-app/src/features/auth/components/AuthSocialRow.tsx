import React, { useRef } from 'react';
import { Image, Text, Animated, Pressable, View, StyleSheet } from 'react-native';

type AuthSocialRowProps = {
  onGoogle: () => void;
  loading?: boolean;
};

export function AuthSocialRow({ onGoogle, loading = false }: AuthSocialRowProps) {
  const scale = useRef(new Animated.Value(1)).current;

  // Spring scale animation for tactile press response
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        <Pressable
          onPress={onGoogle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          style={[styles.googleBtn, loading && styles.disabled]}>
          <Image
            source={require('@/assets/images/google-g.png')}
            style={styles.googleIcon}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E4EF',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A94A5',
    paddingHorizontal: 12,
    textTransform: 'lowercase',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E4EF',
    borderRadius: 26,
    height: 54, // Matches AuthPrimaryButton height perfectly
    width: '100%',
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0116',
    marginLeft: 12, // Exact 12px gap
  },
  disabled: {
    opacity: 0.6,
  },
});
