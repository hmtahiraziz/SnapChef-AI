import React, { useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, Animated, Pressable, View } from 'react-native';

type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthPrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: AuthPrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  // Spring animations for premium scale tap response
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
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.btn, (disabled || loading) && styles.disabled]}>
        <View style={styles.glow} />
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#8966FA',
    borderRadius: 26,
    paddingVertical: 16,
    minHeight: 54, // Matches the height of AuthSocialRow (54px)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    width: '100%',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255,255,255,0.4)',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
