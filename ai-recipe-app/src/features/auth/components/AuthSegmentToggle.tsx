import React, { useEffect } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type AuthSegmentToggleProps = {
  active: 'sign-in' | 'sign-up';
  onSignIn: () => void;
  onSignUp: () => void;
};

const TRACK_WIDTH = 250;
const PADDING = 4;
const PILL_WIDTH = (TRACK_WIDTH - PADDING * 2) / 2; // 121px

export function AuthSegmentToggle({ active, onSignIn, onSignUp }: AuthSegmentToggleProps) {
  const translateX = useSharedValue(active === 'sign-in' ? PADDING : PADDING + PILL_WIDTH);

  // Animate indicator slide on active state change
  useEffect(() => {
    translateX.value = withSpring(active === 'sign-in' ? PADDING : PADDING + PILL_WIDTH, {
      damping: 18,
      stiffness: 120,
    });
  }, [active, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.track}>
      {/* Animated active pill background with physical depth shadow */}
      <Animated.View style={[styles.activePill, animatedStyle]} />
      
      <Pressable
        onPress={onSignIn}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'sign-in' }}
        style={styles.seg}>
        <Text style={[styles.segText, active === 'sign-in' && styles.segTextActive]}>
          Log In
        </Text>
      </Pressable>

      <Pressable
        onPress={onSignUp}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'sign-up' }}
        style={styles.seg}>
        <Text style={[styles.segText, active === 'sign-up' && styles.segTextActive]}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: 48,
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E8E4EF', // Premium light lavender-gray track
    borderRadius: 24,
    padding: PADDING,
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  activePill: {
    position: 'absolute',
    left: 0,
    top: PADDING,
    width: PILL_WIDTH,
    height: 48 - PADDING * 2,
    borderRadius: 20,
    backgroundColor: '#0A0116', // Slate/black active pill
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  seg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    height: '100%',
  },
  segText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B6575',
  },
  segTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
