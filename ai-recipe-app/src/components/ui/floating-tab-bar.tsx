import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text, Platform, Modal } from 'react-native';
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

// Reordered items to: Home, Favorites, Spark (AI Scan), Shopping, Settings
const ITEMS = [
  { key: 'home', routeName: 'index', type: 'route', label: 'Home' },
  { key: 'favorites', routeName: 'favorites', type: 'route', label: 'Favorites' },
  { key: 'spark', type: 'action', label: 'AI Scan' },
  { key: 'shopping', routeName: 'shopping', type: 'route', label: 'Shopping' },
  { key: 'settings', routeName: 'settings', type: 'route', label: 'Settings' },
] as const;

function TabItem({
  item,
  focused,
  badge,
  onPress,
}: {
  item: typeof ITEMS[number];
  focused: boolean;
  badge?: string | number;
  onPress: () => void;
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
      style={isCenter ? styles.centerBtnWrap : styles.itemWrap}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={item.label}
    >
      <Animated.View style={[isCenter ? [styles.centerBtn, { backgroundColor: centerBgColor, borderColor: theme.border }] : styles.iconContainer, animatedStyle]}>
        {isCenter ? (
          <Ionicons name="sparkles" size={24} color="#8966FA" />
        ) : (
          <View style={styles.normalIconWrap}>
            {item.key === 'home' && (
              <MaterialCommunityIcons
                name="chef-hat"
                size={25}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'favorites' && (
              <MaterialCommunityIcons
                name={focused ? 'book-open' : 'book-open-outline'}
                size={25}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'shopping' && (
              <MaterialCommunityIcons
                name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
                size={25}
                color={focused ? activeIconColor : inactiveIconColor}
              />
            )}
            {item.key === 'settings' && (
              <MaterialCommunityIcons
                name={focused ? 'calendar-check' : 'calendar-check-outline'}
                size={25}
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

            {focused && <View style={[styles.activeDot, { backgroundColor: theme.tint }]} />}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showScanMenu, setShowScanMenu] = useState(false);
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  const tabColors = isDark
    ? (['rgba(28, 24, 38, 0.95)', 'rgba(20, 16, 26, 0.92)'] as const)
    : (['rgba(255, 255, 255, 0.92)', 'rgba(247, 243, 255, 0.88)'] as const);

  const tabBorderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.65)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {/* Liquid Glass choice dialog */}
      <Modal
        visible={showScanMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScanMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowScanMenu(false)}>
          <View style={[styles.menuCard, { backgroundColor: isDark ? '#1C1826' : 'rgba(255, 255, 255, 0.98)', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)' }]}>
            <View style={[styles.dragIndicator, { backgroundColor: theme.border }]} />
            <Text style={[styles.menuTitle, { color: theme.text }]}>Analyze Ingredients</Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>Choose photo source to scan ingredients with AI</Text>
            
            <View style={styles.menuRow}>
              <Pressable
                onPress={() => {
                  setShowScanMenu(false);
                  router.push({
                    pathname: '/(tabs)',
                    params: { openCamera: 'true', time: Date.now().toString() },
                  });
                }}
                style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#8966FA' }]}>
                  <Ionicons name="camera" size={26} color="#fff" />
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
                style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#34D399' }]}>
                  <Ionicons name="image" size={26} color="#fff" />
                </View>
                <Text style={[styles.menuBtnText, { color: theme.text }]}>Upload Photo</Text>
              </Pressable>
            </View>
            
            <Pressable style={[styles.menuCloseBtn, { borderTopColor: theme.border }]} onPress={() => setShowScanMenu(false)}>
              <Text style={[styles.menuCloseText, { color: theme.tint }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.pillShadow}>
        <LinearGradient
          colors={tabColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.pill, { borderColor: tabBorderColor }]}
        >
          <View style={styles.row}>
            {ITEMS.map((item) => {
              if (item.type === 'action') {
                const handleAction = () => {
                  setShowScanMenu(true);
                };

                return (
                  <TabItem
                    key={item.key}
                    item={item}
                    focused={false}
                    onPress={handleAction}
                  />
                );
              }

              // Otherwise it's a standard route
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
    paddingHorizontal: 16,
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
    minHeight: 70,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  itemWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  centerBtnWrap: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    top: -12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  normalIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  centerBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
    backgroundColor: '#8966FA',
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
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  // Modal dialog styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 1, 22, 0.48)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 110,
  },
  menuCard: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8E4EF',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0A0116',
    marginBottom: 6,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B6575',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 32,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 24,
  },
  menuBtn: {
    alignItems: 'center',
    width: 100,
  },
  menuBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  menuIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    color: '#0A0116',
  },
  menuCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8966FA',
  },
});
