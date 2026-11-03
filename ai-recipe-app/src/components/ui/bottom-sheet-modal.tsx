import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingTabMetrics } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_SLIDE_DISTANCE = Math.min(SCREEN_HEIGHT * 0.35, 360);
const OPEN_MS = 280;
const CLOSE_MS = 220;

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Styles for the sliding sheet container (not the overlay). */
  sheetStyle?: StyleProp<ViewStyle>;
  /** Dim overlay color. */
  overlayColor?: string;
  /** Prevent closing when tapping the overlay. */
  disableOverlayClose?: boolean;
  /** Kept for API compatibility; open motion is always a smooth ease. */
  motion?: 'spring' | 'smooth';
  /**
   * Extra bottom space so actions clear the floating tab bar (default true).
   * Set false for stack/full-screen flows without the tab bar.
   */
  clearFloatingTabBar?: boolean;
};

/**
 * Bottom sheet with a simple open/close:
 * - Backdrop fades in place
 * - Sheet slides up once (no spring overshoot)
 */
export function BottomSheetModal({
  visible,
  onClose,
  children,
  sheetStyle,
  overlayColor = 'rgba(10, 1, 22, 0.48)',
  disableOverlayClose = false,
  clearFloatingTabBar = true,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_SLIDE_DISTANCE)).current;
  const closingRef = useRef(false);

  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const bottomPad = clearFloatingTabBar
    ? safeBottom +
      FloatingTabMetrics.bottomGap +
      FloatingTabMetrics.pillHeight +
      12
    : safeBottom + 16;

  const animateOpen = useCallback(() => {
    closingRef.current = false;
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(SHEET_SLIDE_DISTANCE);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY]);

  const animateClose = useCallback(
    (after?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: CLOSE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SHEET_SLIDE_DISTANCE,
          duration: CLOSE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        closingRef.current = false;
        if (!finished) return;
        setMounted(false);
        after?.();
      });
    },
    [backdropOpacity, sheetTranslateY],
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      animateClose();
    }
  }, [visible, mounted, animateClose]);

  useEffect(() => {
    if (!mounted || !visible) return;
    const id = requestAnimationFrame(() => animateOpen());
    return () => cancelAnimationFrame(id);
  }, [mounted, visible, animateOpen]);

  const handleOverlayPress = () => {
    if (disableOverlayClose) return;
    animateClose(onClose);
  };

  const handleRequestClose = () => {
    animateClose(onClose);
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleRequestClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View
          style={[styles.backdrop, { backgroundColor: overlayColor, opacity: backdropOpacity }]}
          pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={handleOverlayPress} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetWrap,
            sheetStyle,
            { paddingBottom: bottomPad, transform: [{ translateY: sheetTranslateY }] },
          ]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    width: '100%',
  },
});
