import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { COUNTRIES, getCountryFlag } from '@/constants/countries';
import { SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_SLIDE_DISTANCE = Math.min(SCREEN_HEIGHT * 0.78, 640);
const OPEN_MS = 280;
const CLOSE_MS = 220;

/** Cuisine sub-labels for richer presentation */
const CUISINE_TAGLINES: Record<string, string> = {
  Pakistan: 'Biryani, Nihari, Kebabs',
  India: 'Curry, Tandoori, Dosa',
  Bangladesh: 'Hilsa, Bhuna, Pitha',
  Turkey: 'Kebab, Baklava, Pide',
  Italy: 'Pasta, Pizza, Risotto',
  Mexico: 'Tacos, Mole, Guacamole',
  China: 'Dim Sum, Wok, Noodles',
  Japan: 'Sushi, Ramen, Tempura',
  Thailand: 'Pad Thai, Tom Yum, Curry',
  France: 'Croissant, Soufflé, Ratatouille',
  USA: 'BBQ, Burgers, Chowder',
  UK: 'Roast, Pie, Fish & Chips',
  Lebanon: 'Hummus, Falafel, Shawarma',
  Iran: 'Ghormeh Sabzi, Tahdig, Kebab',
  Spain: 'Paella, Tapas, Churros',
  Korea: 'Bibimbap, Kimchi, BBQ',
  Others: 'Explore all cuisines',
};

type CountryDropdownProps = {
  value: string;
  onChange: (country: string) => void;
  /** Max height of the open list (in-flow — pushes content below, no overlap). */
  maxListHeight?: number;
  placeholder?: string;
};

/**
 * Premium country dropdown.
 * Trigger inline — opens a full-screen bottom-sheet modal with search & list.
 */
export function CountryDropdown({
  value,
  onChange,
  maxListHeight: _maxListHeight = 240,
  placeholder = 'Select cuisine / country',
}: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();
  const flag = getCountryFlag(value);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_SLIDE_DISTANCE)).current;
  const closingRef = useRef(false);

  const theme = useTheme();
  const { isDark } = theme;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [...COUNTRIES];
    return COUNTRIES.filter(
      (c) =>
        c.toLowerCase().includes(q) ||
        (CUISINE_TAGLINES[c]?.toLowerCase().includes(q) ?? false),
    );
  }, [search]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 140,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 140,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  const animateOpen = useCallback(() => {
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

  const closeSheet = useCallback(() => {
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
      if (finished) {
        setOpen(false);
        setSearch('');
      }
    });
  }, [backdropOpacity, sheetTranslateY]);

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      animateOpen();
    }
  }, [open, animateOpen]);

  const select = useCallback(
    (country: string) => {
      Keyboard.dismiss();
      onChange(country);
      closeSheet();
    },
    [onChange, closeSheet],
  );

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const renderItem = useCallback(
    ({ item: country }: { item: string }) => {
      const selected = country === value;
      const tagline = CUISINE_TAGLINES[country] ?? '';
      const label = country === 'Others' ? 'Others' : country;

      return (
        <Pressable
          onPressIn={dismissKeyboard}
          onPress={() => select(country)}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={tagline ? `${label}, ${tagline}` : label}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: selected
                ? isDark
                  ? 'rgba(137, 102, 250, 0.15)'
                  : '#F3EFFF'
                : isDark
                  ? theme.backgroundSelected
                  : '#FFFFFF',
              borderColor: selected
                ? isDark
                  ? 'rgba(137, 102, 250, 0.35)'
                  : 'rgba(137, 102, 250, 0.2)'
                : isDark
                  ? theme.cardBorder
                  : 'rgba(232, 228, 239, 0.9)',
            },
            pressed && !selected && styles.optionPressed,
          ]}>
          {/* Row layout on View — Pressable flexDirection is unreliable with NativeWind/web */}
          <View style={styles.optionRow}>
            {/* 1 — Flag */}
            <View
              style={[
                styles.optionFlag,
                { backgroundColor: isDark ? theme.background : '#F3F1F6' },
                selected && {
                  backgroundColor: isDark ? 'rgba(137, 102, 250, 0.25)' : '#EDE7FF',
                },
              ]}>
              <Text style={styles.optionFlagEmoji}>{getCountryFlag(country)}</Text>
            </View>

            {/* 2 — Name + description (column) */}
            <View style={styles.optionTextColumn}>
              <Text
                style={[
                  styles.optionLabel,
                  { color: theme.text },
                  selected && { color: theme.tint },
                ]}
                numberOfLines={1}>
                {label}
              </Text>
              {tagline ? (
                <Text
                  style={[styles.optionTagline, { color: theme.textSecondary }]}
                  numberOfLines={1}>
                  {tagline}
                </Text>
              ) : null}
            </View>

            {/* 3 — Check / radio */}
            {selected ? (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            ) : (
              <View
                style={[styles.radioOuter, { borderColor: isDark ? theme.border : '#D5D0DC' }]}
              />
            )}
          </View>
        </Pressable>
      );
    },
    [value, select, dismissKeyboard, isDark, theme],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View style={styles.root}>
      {/* ────────── Trigger Button ────────── */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={() => setOpen(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Cuisine: ${value || placeholder}`}
          style={[
            styles.trigger,
            { borderColor: isDark ? theme.border : 'rgba(137, 102, 250, 0.18)' },
          ]}>
          <LinearGradient
            colors={isDark ? [theme.backgroundSelected, theme.backgroundElement] : ['#F8F5FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.triggerFlagBadge,
              { backgroundColor: isDark ? theme.field : '#EDE7FF' },
            ]}>
            <Text style={styles.triggerFlagEmoji}>{value ? flag : '🌍'}</Text>
          </View>

          <View style={styles.triggerTextWrap}>
            <Text style={[styles.triggerEyebrow, { color: theme.tint }]}>CUISINE</Text>
            <Text
              style={[
                styles.triggerLabel,
                { color: theme.text },
                !value && { color: theme.textSecondary, fontWeight: '500' },
              ]}
              numberOfLines={1}>
              {value || placeholder}
            </Text>
            {value && CUISINE_TAGLINES[value] ? (
              <Text
                style={[styles.triggerTagline, { color: theme.textSecondary }]}
                numberOfLines={1}>
                {CUISINE_TAGLINES[value]}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.triggerChevron,
              { backgroundColor: isDark ? theme.field : '#F3F0FF' },
            ]}>
            <Ionicons name="swap-vertical" size={16} color={theme.tint} />
          </View>
        </Pressable>
      </Animated.View>

      {/* ────────── Full-screen Picker Modal ────────── */}
      <Modal
        visible={open}
        animationType="none"
        transparent
        statusBarTranslucent
        onRequestClose={closeSheet}>
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
            pointerEvents="auto">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? theme.backgroundElement : '#FAFAFD',
                borderTopColor: isDark ? theme.cardBorder : 'transparent',
                borderTopWidth: isDark ? 1 : 0,
                paddingBottom: Math.max(insets.bottom, 16) + 8,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}>
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? theme.border : '#DCD7E4' }]} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Choose Cuisine</Text>
              <Pressable
                onPress={closeSheet}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: isDark ? theme.backgroundSelected : '#F3F1F6' },
                  pressed && styles.closeBtnPressed,
                ]}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View
              style={[
                styles.searchWrap,
                {
                  backgroundColor: isDark ? theme.background : '#FFFFFF',
                  borderColor: isDark ? theme.border : '#E8E4EF',
                },
              ]}>
              <Ionicons
                name="search"
                size={18}
                color={theme.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search country or dish..."
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#B0AAB8'}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
              {search.length > 0 && Platform.OS !== 'ios' ? (
                <Pressable onPress={() => setSearch('')} hitSlop={8} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={dismissKeyboard}
              onTouchStart={dismissKeyboard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No matching cuisines found
                  </Text>
                </View>
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'stretch',
  },

  /* ── Trigger ── */
  trigger: {
    width: '100%',
    minHeight: 72,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(137, 102, 250, 0.18)',
    overflow: 'hidden',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    ...Platform.select({
      web: { display: 'flex' as const },
      default: {},
    }),
  },
  triggerFlagBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EDE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  triggerFlagEmoji: {
    fontSize: 26,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  triggerTextWrap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingRight: 8,
  },
  triggerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: SnapChef.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  triggerLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: SnapChef.ink,
    letterSpacing: 0.1,
  },
  triggerTagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  triggerChevron: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    flexShrink: 0,
  },

  /* ── Modal ── */
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 1, 22, 0.45)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: '#FAFAFD',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DCD7E4',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: SnapChef.ink,
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F1F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    backgroundColor: '#E8E4EF',
  },

  /* ── Search ── */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E4EF',
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: SnapChef.ink,
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
      default: {},
    }),
  },
  clearBtn: {
    padding: 4,
  },

  /* ── List ── */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  separator: {
    height: 16,
  },

  /* ── Option: [flag] | name+desc column | check ── */
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...Platform.select({
      web: { display: 'flex' as const },
      default: {},
    }),
  },
  optionFlag: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F1F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  optionFlagEmoji: {
    fontSize: 20,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  optionTextColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: SnapChef.ink,
    marginBottom: 2,
  },
  optionTagline: {
    fontSize: 12,
    fontWeight: '500',
    color: SnapChef.muted,
    lineHeight: 16,
  },

  /* ── Selection indicators ── */
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D5D0DC',
    flexShrink: 0,
  },

  /* ── Empty State ── */
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: SnapChef.muted,
  },
});
