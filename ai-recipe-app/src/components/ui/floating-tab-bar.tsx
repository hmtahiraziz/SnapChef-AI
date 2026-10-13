import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  Platform,
  Modal,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Fonts, Radii, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Fixed mobile metrics — mock-accurate, not over-responsive. */
const PILL_HEIGHT = 68;
const PILL_MAX_WIDTH = 420;
const PILL_PAD_H = 6;
const CENTER_SIZE = 56;
const CENTER_LIFT = -16;
const ICON_SIZE = 22;
const LABEL_SIZE = 11;
const HORIZONTAL_INSET = 18;
const BOTTOM_GAP = 10;

const FOCUS_TIMING = {
  duration: 240,
  easing: Easing.out(Easing.cubic),
} as const;

const FOCUS_SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.7,
} as const;

type TabIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ITEMS = [
  {
    key: 'home',
    routeName: 'index',
    type: 'route' as const,
    label: 'Home',
    icon: 'silverware-fork-knife' as TabIconName,
    iconActive: 'silverware-fork-knife' as TabIconName,
  },
  {
    key: 'recipes',
    routeName: 'shopping',
    type: 'route' as const,
    label: 'Recipes',
    icon: 'book-outline' as TabIconName,
    iconActive: 'book-open-page-variant' as TabIconName,
  },
  {
    key: 'spark',
    type: 'action' as const,
    label: 'AI Scan',
  },
  {
    key: 'favorites',
    routeName: 'favorites',
    type: 'route' as const,
    label: 'Favorites',
    icon: 'heart-outline' as TabIconName,
    iconActive: 'heart' as TabIconName,
  },
  {
    key: 'settings',
    routeName: 'settings',
    type: 'route' as const,
    label: 'Settings',
    icon: 'cog-outline' as TabIconName,
    iconActive: 'cog' as TabIconName,
  },
];

type RouteItem = Extract<(typeof ITEMS)[number], { type: 'route' }>;

type SlotLayout = { x: number; width: number };

function TabItem({
  item,
  focused,
  badge,
  onPress,
  onSlotLayout,
  inactiveColor,
}: {
  item: (typeof ITEMS)[number];
  focused: boolean;
  badge?: string | number;
  onPress: () => void;
  onSlotLayout?: (event: LayoutChangeEvent) => void;
  inactiveColor: string;
}) {
  const progress = useSharedValue(focused ? 1 : 0);
  const isCenter = item.type === 'action';

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, FOCUS_TIMING);
  }, [focused, progress]);

  const iconMotionStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.06]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -1]) },
    ],
  }));

  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
  }));

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [inactiveColor, SnapChef.primary]),
    opacity: interpolate(progress.value, [0, 1], [0.88, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [1, 0]) }],
  }));

  if (isCenter) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.centerWrap}
        accessibilityRole="button"
        accessibilityLabel="AI Scan"
      >
        <View style={styles.centerBtn}>
          <Ionicons name="sparkles" size={24} color={SnapChef.white} />
        </View>
      </Pressable>
    );
  }

  const routeItem = item as RouteItem;

  return (
    <Pressable
      onPress={onPress}
      onLayout={onSlotLayout}
      style={styles.itemWrap}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={routeItem.label}
    >
      <View style={styles.itemInner}>
        <Animated.View style={[styles.iconSlot, iconMotionStyle]}>
          <Animated.View style={[styles.iconLayer, inactiveIconStyle]}>
            <MaterialCommunityIcons
              name={routeItem.icon}
              size={ICON_SIZE}
              color={inactiveColor}
            />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, activeIconStyle]}>
            <MaterialCommunityIcons
              name={routeItem.iconActive}
              size={ICON_SIZE}
              color={SnapChef.primary}
            />
          </Animated.View>
          {badge != null ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
              </Text>
            </View>
          ) : null}
        </Animated.View>
        <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {routeItem.label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [showScanMenu, setShowScanMenu] = useState(false);
  const theme = useTheme();
  const { isDark } = theme;

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8) + BOTTOM_GAP;
  const horizontalPad = Math.max(HORIZONTAL_INSET, Math.max(insets.left, insets.right));
  const scanSheetBottomInset = bottomPad + PILL_HEIGHT + Math.abs(CENTER_LIFT) + 12;

  const pillBg = isDark ? theme.backgroundElement : SnapChef.white;
  const pillBorder = isDark ? theme.cardBorder : 'rgba(255, 255, 255, 0.95)';
  const inactiveColor = isDark ? theme.iconMuted : 'rgba(10, 1, 22, 0.72)';
  const indicatorTint = isDark ? 'rgba(180, 155, 255, 0.18)' : 'rgba(137, 102, 250, 0.12)';

  const isCompact = width < 360;

  const menuMetrics = useMemo(
    () => ({
      pad: isCompact ? 18 : 24,
      icon: isCompact ? 56 : 64,
      gap: isCompact ? 20 : 32,
      btnWidth: isCompact ? 88 : 100,
      titleSize: isCompact ? 17 : 19,
    }),
    [isCompact],
  );

  const slotLayouts = useRef<Record<string, SlotLayout>>({});
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(56);
  const indicatorOpacity = useSharedValue(0);
  const hasPlacedIndicator = useRef(false);

  const activeRouteName = state.routes[state.index]?.name;
  const activeItemKey = ITEMS.find(
    (item) => item.type === 'route' && item.routeName === activeRouteName,
  )?.key;

  const moveIndicatorTo = (key: string) => {
    const layout = slotLayouts.current[key];
    if (!layout) return;

    const targetW = Math.min(64, Math.max(48, layout.width - 8));
    const targetX = layout.x + (layout.width - targetW) / 2;

    if (!hasPlacedIndicator.current) {
      indicatorX.value = targetX;
      indicatorW.value = targetW;
      indicatorOpacity.value = withTiming(1, { duration: 180 });
      hasPlacedIndicator.current = true;
      return;
    }

    indicatorX.value = withSpring(targetX, FOCUS_SPRING);
    indicatorW.value = withSpring(targetW, FOCUS_SPRING);
    indicatorOpacity.value = withTiming(1, FOCUS_TIMING);
  };

  useEffect(() => {
    if (activeItemKey) {
      moveIndicatorTo(activeItemKey);
    }
  }, [activeItemKey]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    width: indicatorW.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          paddingBottom: bottomPad,
          paddingHorizontal: horizontalPad,
        },
      ]}
    >
      <Modal
        visible={showScanMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowScanMenu(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { paddingBottom: scanSheetBottomInset }]}
          onPress={() => setShowScanMenu(false)}
        >
          <Pressable
            onPress={() => {
              /* Absorb presses so the overlay dismiss handler does not fire. */
            }}
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? theme.backgroundElement : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? theme.cardBorder : 'rgba(255, 255, 255, 0.85)',
                padding: menuMetrics.pad,
                width: isCompact ? '94%' : '90%',
              },
            ]}
          >
            <View style={[styles.dragIndicator, { backgroundColor: theme.border }]} />
            <Text style={[styles.menuTitle, { color: theme.text, fontSize: menuMetrics.titleSize }]}>
              Analyze Ingredients
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              Choose photo source to scan ingredients with AI
            </Text>

            <View style={[styles.menuRow, { gap: menuMetrics.gap }]}>
              <Pressable
                onPress={() => {
                  setShowScanMenu(false);
                  router.push({
                    pathname: '/(tabs)',
                    params: { openCamera: 'true', time: Date.now().toString() },
                  });
                }}
                style={({ pressed }) => [
                  styles.menuBtn,
                  { width: menuMetrics.btnWidth },
                  pressed && styles.menuBtnPressed,
                ]}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    {
                      backgroundColor: SnapChef.primary,
                      width: menuMetrics.icon,
                      height: menuMetrics.icon,
                      borderRadius: menuMetrics.icon / 2,
                    },
                  ]}
                >
                  <Ionicons name="camera" size={isCompact ? 22 : 26} color={SnapChef.white} />
                </View>
                <Text style={[styles.menuBtnText, { color: theme.text }]}>Take Photo</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowScanMenu(false);
                  router.push({
                    pathname: '/(tabs)',
                    params: { openGallery: 'true', time: Date.now().toString() },
                  });
                }}
                style={({ pressed }) => [
                  styles.menuBtn,
                  { width: menuMetrics.btnWidth },
                  pressed && styles.menuBtnPressed,
                ]}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    {
                      backgroundColor: '#34D399',
                      width: menuMetrics.icon,
                      height: menuMetrics.icon,
                      borderRadius: menuMetrics.icon / 2,
                    },
                  ]}
                >
                  <Ionicons name="image" size={isCompact ? 22 : 26} color={SnapChef.white} />
                </View>
                <Text style={[styles.menuBtnText, { color: theme.text }]}>Upload Photo</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.menuCloseBtn, { borderTopColor: theme.border }]}
              onPress={() => setShowScanMenu(false)}
            >
              <Text style={[styles.menuCloseText, { color: SnapChef.primary }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.pillShadow}>
        <View
          style={[
            styles.pill,
            {
              backgroundColor: pillBg,
              borderColor: pillBorder,
              height: PILL_HEIGHT,
            },
          ]}
        >
          <View style={styles.row}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.activeIndicator,
                { backgroundColor: indicatorTint },
                indicatorStyle,
              ]}
            />

            {ITEMS.map((item) => {
              if (item.type === 'action') {
                return (
                  <TabItem
                    key={item.key}
                    item={item}
                    focused={false}
                    inactiveColor={inactiveColor}
                    onPress={() => setShowScanMenu(true)}
                  />
                );
              }

              const route = state.routes.find((r) => r.name === item.routeName);
              if (!route) return null;

              const { options } = descriptors[route.key];
              if ((options as { href?: string | null }).href === null) {
                return null;
              }

              const focused = activeRouteName === item.routeName;
              const badge = options.tabBarBadge;

              const handlePress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              return (
                <TabItem
                  key={item.key}
                  item={item}
                  focused={focused}
                  badge={badge}
                  inactiveColor={inactiveColor}
                  onPress={handlePress}
                  onSlotLayout={(event) => {
                    const { x, width: slotWidth } = event.nativeEvent.layout;
                    slotLayouts.current[item.key] = { x, width: slotWidth };
                    if (item.key === activeItemKey) {
                      moveIndicatorTo(item.key);
                    }
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  pillShadow: {
    width: '100%',
    maxWidth: PILL_MAX_WIDTH,
    borderRadius: Radii.nav,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 12,
    backgroundColor: 'transparent',
  },
  pill: {
    width: '100%',
    borderRadius: Radii.nav,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
    justifyContent: 'center',
    paddingHorizontal: PILL_PAD_H,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    borderRadius: 22,
    zIndex: 0,
  },
  itemWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: PILL_HEIGHT - 8,
    zIndex: 1,
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconSlot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: LABEL_SIZE,
    fontFamily: Fonts.bodyMedium,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  centerWrap: {
    width: CENTER_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    top: CENTER_LIFT,
    zIndex: 10,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: SnapChef.white,
  },
  badgeText: {
    color: SnapChef.white,
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 1, 22, 0.48)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuCard: {
    maxWidth: 380,
    borderRadius: Radii.card,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1.5,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  menuTitle: {
    fontWeight: '800',
    marginBottom: 6,
  },
  menuSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 24,
  },
  menuBtn: {
    alignItems: 'center',
  },
  menuBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  menuIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  menuBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
