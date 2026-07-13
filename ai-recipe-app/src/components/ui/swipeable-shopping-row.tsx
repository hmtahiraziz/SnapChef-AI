/**
 * SwipeableShoppingRow
 * Swipe left to reveal two full-height action buttons:
 *   [Edit (blue)] [Delete (red)]  — iOS Mail / Reminders pattern
 *
 * Uses React Native's built-in Animated API — no extra deps.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

/* Total width of both revealed buttons combined */
const ACTIONS_WIDTH = 160;
const BTN_WIDTH = 80;
const SWIPE_THRESHOLD = 70;

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
};

export function SwipeableShoppingRow({ children, onDelete, onEdit }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);
  const isOpen = useRef(false);

  const close = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    }).start();
    isOpen.current = false;
  }, [translateX]);

  const open = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -ACTIONS_WIDTH,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    }).start();
    isOpen.current = true;
  }, [translateX]);

  return (
    <View style={styles.outer}>
      {/* ── Revealed action strip ── */}
      <View style={styles.actionsStrip}>

        {/* EDIT — left of the two revealed buttons */}
        <Pressable
          onPress={() => { close(); onEdit(); }}
          style={({ pressed }) => [styles.actionBtn, styles.editBtn, pressed && styles.actionBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Edit item"
        >
          <View style={styles.actionIconCircle}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Edit</Text>
        </Pressable>

        {/* DELETE — right of the two revealed buttons */}
        <Pressable
          onPress={() => { close(); onDelete(); }}
          style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.actionBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Delete item"
        >
          <View style={[styles.actionIconCircle, styles.deleteIconCircle]}>
            <Ionicons name="trash" size={20} color="#fff" />
          </View>
          <Text style={styles.actionLabel}>Delete</Text>
        </Pressable>
      </View>

      {/* ── Sliding content ── */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          startX.current = e.nativeEvent.pageX;
        }}
        onResponderMove={(e) => {
          const dx = e.nativeEvent.pageX - startX.current;
          if (isOpen.current) {
            const next = Math.min(0, -ACTIONS_WIDTH + dx);
            translateX.setValue(next);
          } else {
            const next = Math.min(0, dx);
            translateX.setValue(next);
          }
        }}
        onResponderRelease={(e) => {
          const dx = e.nativeEvent.pageX - startX.current;
          if (isOpen.current) {
            dx > SWIPE_THRESHOLD / 2 ? close() : open();
          } else {
            dx < -SWIPE_THRESHOLD ? open() : close();
          }
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    borderRadius: 28,
    marginBottom: Spacing.two,
  },

  /* ── Revealed strip sits absolutely behind the sliding row ── */
  actionsStrip: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTIONS_WIDTH,
    flexDirection: 'row',
    borderRadius: 28,
    overflow: 'hidden',
  },

  /* Shared base for both buttons */
  actionBtn: {
    width: BTN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
  },
  actionBtnPressed: {
    opacity: 0.82,
  },

  /* Edit = indigo/blue */
  editBtn: {
    backgroundColor: '#5B5FEF',
  },

  /* Delete = red */
  deleteBtn: {
    backgroundColor: '#EF4444',
  },

  /* Icon circle gives each button a secondary visual layer */
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconCircle: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  /* Label below icon */
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
