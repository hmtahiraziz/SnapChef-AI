import React, { useMemo, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const ITEMS = [
  { key: 'home', routeName: 'index', type: 'route', label: 'Home' },
  { key: 'favorites', routeName: 'favorites', type: 'route', label: 'Favorites' },
  { key: 'spark', type: 'action', label: 'AI Scan' },
  { key: 'shopping', routeName: 'shopping', type: 'route', label: 'Shopping' },
  { key: 'settings', routeName: 'settings', type: 'route', label: 'Settings' },
] as const;

type TabMetrics = {
  isCompact: boolean;
  horizontalPad: number;
  bottomPad: number;
  pillMinHeight: number;
  pillPadH: number;
  rowPadV: number;
  iconSize: number;
  iconHit: number;
  itemMinHeight: number;
  centerWrap: number;
  centerBtn: number;
  centerIcon: number;
  centerLift: number;
  menuPad: number;
  menuIcon: number;
  menuGap: number;
  menuBtnWidth: number;
  menuTitleSize: number;
  /** Space reserved above the home-indicator / tab bar for the scan sheet. */
  scanSheetBottomInset: number;
};

function buildTabMetrics(
  width: number,
  height: number,
  safeBottom: number,
  safeHorizontal: number,
): TabMetrics {
  const isCompact = width < 380;
  const isTiny = width < 340;
  const isShort = height < 700;

  const bottomPad = Math.max(safeBottom, isCompact ? 8 : 12);
  const horizontalPad = Math.max(safeHorizontal, isTiny ? 10 : isCompact ? 12 : 16);

  const pillMinHeight = isTiny ? 58 : isCompact ? 62 : isShort ? 66 : 70;
  const centerWrap = isTiny ? 54 : isCompact ? 58 : 68;
  const centerBtn = isTiny ? 46 : isCompact ? 50 : 58;
  const centerLift = isTiny ? -8 : isCompact ? -10 : -12;
  const pillPadH = isTiny ? 2 : isCompact ? 4 : 6;
  const rowPadV = isCompact ? 4 : 6;

  // Pill body + protruding center + gap so sheet sits cleanly above the bar.
  const scanSheetBottomInset =
    bottomPad + pillMinHeight + Math.abs(centerLift) + (isCompact ? 10 : 14);

  return {
    isCompact,
    horizontalPad,
    bottomPad,
    pillMinHeight,
    pillPadH,
    rowPadV,
    iconSize: isTiny ? 20 : isCompact ? 22 : 25,
    iconHit: isTiny ? 40 : isCompact ? 44 : 48,
    itemMinHeight: isTiny ? 44 : isCompact ? 48 : 52,
    centerWrap,
    centerBtn,
    centerIcon: isTiny ? 20 : isCompact ? 21 : 24,
    centerLift,
    menuPad: isCompact ? 18 : 24,
    menuIcon: isCompact ? 56 : 64,
    menuGap: isCompact ? 20 : 32,
    menuBtnWidth: isCompact ? 88 : 100,
    menuTitleSize: isCompact ? 17 : 19,
    scanSheetBottomInset,
  };
}

function TabItem({
  item,
  focused,
  badge,
  onPress,
  metrics,
}: {
  item: (typeof ITEMS)[number];
  focused: boolean;
  badge?: string | number;
  onPress: () => void;
  metrics: TabMetrics;
}) {
  const scale = useSharedValue(1);
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCenter = item.type === 'action';
  const isDark = theme.text === '#F5F2FF';

  const inactiveIconColor = isDark ? 'rgba(245, 242, 255, 0.45)' : 'rgba(10, 1, 22, 0.45)';
  const activeIconColor = '#8966FA';
  const centerBgColor = isDark ? '#1C1826' : '#ffffff';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 10, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
      }}
      onHoverIn={() => {
        if (Platform.OS === 'web') {
          scale.value = withSpring(1.15, { damping: 8, stiffness: 180 });
        }
      }}
      onHoverOut={() => {
        if (Platform.OS === 'web') {
          scale.value = withSpring(1.0, { damping: 8, stiffness: 180 });
        }
      }}
      style={
        isCenter
          ? [
              styles.centerBtnWrap,
              {
                width: metrics.centerWrap,
                height: metrics.centerWrap,
                top: metrics.centerLift,
              },
            ]
          : [styles.itemWrap, { minHeight: metrics.itemMinHeight }]
      }
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={item.label}
    >
      <Animated.View
        style={[
          isCenter
            ? [
                styles.centerBtn,
                {
                  width: metrics.centerBtn,
                  height: metrics.centerBtn,
                  borderRadius: metrics.centerBtn / 2,
                  backgroundColor: centerBgColor,
                  borderColor: theme.border,
                },
              ]
            : [
                styles.iconContainer,
                { width: metrics.iconHit, height: metrics.iconHit },
              ],
          animatedStyle,
        ]}
      >
        {isCenter ? (
          <Ionicons name="sparkles" size={metrics.centerIcon} color="#8966FA" />
        ) : (
          <View style={styles.normalIconWrap}>
            {item.key === 'home' && (
              <MaterialCommunityIcons
                name="chef-hat"
                size={metrics.iconSize}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'favorites' && (
              <MaterialCommunityIcons
                name={focused ? 'book-open' : 'book-open-outline'}
                size={metrics.iconSize}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'shopping' && (
              <MaterialCommunityIcons
                name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
                size={metrics.iconSize}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'settings' && (
              <MaterialCommunityIcons
                name={focused ? 'cog' : 'cog-outline'}
                size={metrics.iconSize}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}

            {badge != null ? (
              <View style={[styles.badge, { borderColor: centerBgColor }]}>
                <Text style={styles.badgeText}>
                  {typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
                </Text>
              </View>
            ) : null}

            {focused ? (
              <View style={[styles.activeDot, { backgroundColor: theme.tint }]} />
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [showScanMenu, setShowScanMenu] = useState(false);
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  const metrics = useMemo(
    () =>
      buildTabMetrics(
        width,
        height,
        insets.bottom,
        Math.max(insets.left, insets.right),
      ),
    [width, height, insets.bottom, insets.left, insets.right],
  );

  const tabColors = isDark
    ? (['rgba(28, 24, 38, 0.95)', 'rgba(20, 16, 26, 0.92)'] as const)
    : (['rgba(255, 255, 255, 0.92)', 'rgba(247, 243, 255, 0.88)'] as const);

  const tabBorderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.65)';

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          paddingBottom: metrics.bottomPad,
          paddingHorizontal: metrics.horizontalPad,
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
          style={[styles.modalOverlay, { paddingBottom: metrics.scanSheetBottomInset }]}
          onPress={() => setShowScanMenu(false)}
        >
          <Pressable
            onPress={() => {
              /* Absorb presses so the overlay dismiss handler does not fire. */
            }}
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? '#1C1826' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                padding: metrics.menuPad,
                width: metrics.isCompact ? '94%' : '90%',
              },
            ]}
          >
            <View style={[styles.dragIndicator, { backgroundColor: theme.border }]} />
            <Text style={[styles.menuTitle, { color: theme.text, fontSize: metrics.menuTitleSize }]}>
              Analyze Ingredients
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              Choose photo source to scan ingredients with AI
            </Text>

            <View style={[styles.menuRow, { gap: metrics.menuGap }]}>
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
                  { width: metrics.menuBtnWidth },
                  pressed && styles.menuBtnPressed,
                ]}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    {
                      backgroundColor: '#8966FA',
                      width: metrics.menuIcon,
                      height: metrics.menuIcon,
                      borderRadius: metrics.menuIcon / 2,
                    },
                  ]}
                >
                  <Ionicons name="camera" size={metrics.isCompact ? 22 : 26} color="#fff" />
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
                  { width: metrics.menuBtnWidth },
                  pressed && styles.menuBtnPressed,
                ]}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    {
                      backgroundColor: '#34D399',
                      width: metrics.menuIcon,
                      height: metrics.menuIcon,
                      borderRadius: metrics.menuIcon / 2,
                    },
                  ]}
                >
                  <Ionicons name="image" size={metrics.isCompact ? 22 : 26} color="#fff" />
                </View>
                <Text style={[styles.menuBtnText, { color: theme.text }]}>Upload Photo</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.menuCloseBtn, { borderTopColor: theme.border }]}
              onPress={() => setShowScanMenu(false)}
            >
              <Text style={[styles.menuCloseText, { color: theme.tint }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.pillShadow}>
        <LinearGradient
          colors={tabColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.pill,
            {
              borderColor: tabBorderColor,
              minHeight: metrics.pillMinHeight,
              paddingHorizontal: metrics.pillPadH,
            },
          ]}
        >
          <View style={[styles.row, { paddingVertical: metrics.rowPadV }]}>
            {ITEMS.map((item) => {
              if (item.type === 'action') {
                return (
                  <TabItem
                    key={item.key}
                    item={item}
                    focused={false}
                    onPress={() => setShowScanMenu(true)}
                    metrics={metrics}
                  />
                );
              }

              const route = state.routes.find((r) => r.name === item.routeName);
              if (!route) return null;

              const { options } = descriptors[route.key];
              if ((options as { href?: string | null }).href === null) {
                return null;
              }

              const focused = state.routes[state.index].name === item.routeName;
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
                  onPress={handlePress}
                  metrics={metrics}
                />
              );
            })}
          </View>
        </LinearGradient>
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
    maxWidth: 500,
    borderRadius: 36,
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  pill: {
    borderRadius: 36,
    overflow: 'visible',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtnWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  centerBtn: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff4d4f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#fff',
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
    borderRadius: 28,
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
