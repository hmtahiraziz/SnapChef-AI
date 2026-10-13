import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolation,
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type GetStartedButtonProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

const HANDLE = 56;
const PAD = 6;
const COMPLETE_RATIO = 0.85;

const SPRING_BACK = { damping: 18, stiffness: 220, mass: 0.8, overshootClamping: true };
const SPRING_END = { damping: 20, stiffness: 180, mass: 0.9, overshootClamping: true };

export function GetStartedButton({
  onPress,
  label = 'Swipe to Get Started',
  accessibilityLabel,
}: GetStartedButtonProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const maxX = Math.max(0, trackWidth - HANDLE - PAD * 2);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const maxXSV = useSharedValue(0);
  const completed = useSharedValue(false);
  const shimmer = useSharedValue(0.45);

  useEffect(() => {
    maxXSV.value = maxX;
  }, [maxX, maxXSV]);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1100 }),
        withTiming(0.45, { duration: 1100 })
      ),
      -1,
      false
    );
    return () => cancelAnimation(shimmer);
  }, [shimmer]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const triggerComplete = useCallback(() => {
    onPress();
    setTimeout(() => {
      completed.value = false;
      translateX.value = 0;
    }, 600);
  }, [onPress, completed, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX(8)
    .failOffsetY([-12, 12])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      if (completed.value) return;
      const max = maxXSV.value;
      if (max <= 0) return;
      translateX.value = Math.max(0, Math.min(max, startX.value + e.translationX));
    })
    .onEnd((e) => {
      if (completed.value) return;
      const max = maxXSV.value;
      if (max <= 0) {
        translateX.value = 0;
        return;
      }

      const projected = translateX.value + e.velocityX * 0.12;
      const shouldComplete =
        projected >= max * COMPLETE_RATIO || translateX.value >= max * COMPLETE_RATIO;

      if (shouldComplete) {
        completed.value = true;
        translateX.value = withSpring(max, SPRING_END, (finished) => {
          if (finished) runOnJS(triggerComplete)();
        });
      } else {
        translateX.value = withSpring(0, SPRING_BACK);
      }
    });

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => {
    const max = Math.max(1, maxXSV.value);
    return {
      width: HANDLE + PAD * 2 + translateX.value,
      opacity: interpolate(translateX.value, [0, max * 0.2, max], [0, 0.35, 0.55], Extrapolation.CLAMP),
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const max = Math.max(1, maxXSV.value);
    return {
      opacity: interpolate(
        translateX.value,
        [0, max * 0.55],
        [shimmer.value, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View entering={FadeInUp.duration(420).delay(80)} style={styles.root}>
      <GestureDetector gesture={pan}>
        <View
          onLayout={onLayout}
          style={styles.track}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint="Swipe right to continue">
          <Animated.View style={[styles.fill, fillStyle]} pointerEvents="none" />

          <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
            <Text style={styles.label}>{label}</Text>
          </Animated.View>

          <Animated.View style={[styles.handle, handleStyle]}>
            <LinearGradient
              colors={['#A78BFA', '#8966FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.handleGradient}>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'center',
  },
  track: {
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: PAD,
    overflow: 'hidden',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: 'rgba(137, 102, 250, 0.22)',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: HANDLE * 0.35,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C2D54',
    letterSpacing: 0.2,
  },
  handle: {
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    zIndex: 2,
  },
  handleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: HANDLE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
