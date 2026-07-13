import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import AnimatedReanimated, { FadeInUp } from 'react-native-reanimated';

type GetStartedButtonProps = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

export function GetStartedButton({
  onPress,
  label = 'Swipe to Get Started',
  accessibilityLabel,
}: GetStartedButtonProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Track layout width dynamically
  const [trackWidth, setTrackWidth] = useState(0);
  const handleWidth = 56;
  const padding = 6;
  const maxSwipeDistance = Math.max(0, trackWidth - handleWidth - padding * 2);

  // Swipe animation values
  const pan = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0.35)).current;
  const isTriggered = useRef(false);

  // Shimmer animation for background text
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [textOpacity]);

  // PanResponder to handle the drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Subtle press response if needed
      },
      onPanResponderMove: (_, gestureState) => {
        if (isTriggered.current) return;
        // Clamp swipe distance between 0 and maxSwipeDistance
        const nextX = Math.max(0, Math.min(maxSwipeDistance, gestureState.dx));
        pan.setValue(nextX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isTriggered.current) return;
        
        const threshold = maxSwipeDistance * 0.82;
        if (gestureState.dx >= threshold) {
          isTriggered.current = true;
          // Animate handle to the end
          Animated.spring(pan, {
            toValue: maxSwipeDistance,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }).start(() => {
            onPress();
            // Reset state in case user navigates back later
            setTimeout(() => {
              isTriggered.current = false;
              pan.setValue(0);
            }, 800);
          });
        } else {
          // Bounce back to start
          Animated.spring(pan, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Fade out text as the user swipes
  const interpolatedTextOpacity = pan.interpolate({
    inputRange: [0, maxSwipeDistance * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <AnimatedReanimated.View
      entering={FadeInUp.duration(500).delay(150)}
      className="w-full max-w-auth self-center">
      <View
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={styles.track}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}>
        
        {/* Shimmering background hint text */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: Animated.multiply(textOpacity, interpolatedTextOpacity) },
          ]}>
          <Text style={styles.swipeText}>{label}</Text>
        </Animated.View>

        {/* Swipe Handle */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.handle,
            {
              transform: [{ translateX: pan }],
            },
          ]}>
          <LinearGradient
            colors={['#A78BFA', '#8966FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.handleGradient}>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
      </View>
    </AnimatedReanimated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 68,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30, // Offset text to account for starting handle position
  },
  swipeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C2D54',
    letterSpacing: 0.3,
  },
  handle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  handleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
