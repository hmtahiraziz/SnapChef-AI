import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
 * Trigger inline — opens a full-screen bottom-sheet modal with search & grid.
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

  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

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

  const select = useCallback(
    (country: string) => {
      onChange(country);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  const renderItem = useCallback(
    ({ item: country }: { item: string }) => {
      const selected = country === value;
      const tagline = CUISINE_TAGLINES[country] ?? '';

      return (
        <Pressable
          onPress={() => select(country)}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          style={({ pressed }) => [
            styles.option,
            {
              backgroundColor: selected
                ? isDark
                  ? 'rgba(137, 102, 250, 0.15)'
                  : '#F3EFFF'
                : isDark
                  ? '#2A2438'
                  : '#FFFFFF',
              borderColor: selected
                ? isDark
                  ? 'rgba(137, 102, 250, 0.4)'
                  : 'rgba(137, 102, 250, 0.22)'
                : isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'transparent',
            },
            pressed && styles.optionPressed,
          ]}>
          {/* Flag circle */}
          <View
            style={[
              styles.optionFlag,
              { backgroundColor: isDark ? theme.background : '#F3F1F6' },
              selected && { backgroundColor: isDark ? 'rgba(137, 102, 250, 0.25)' : '#EDE7FF' },
            ]}>
            <Text style={styles.optionFlagEmoji}>{getCountryFlag(country)}</Text>
          </View>

          {/* Label + tagline */}
          <View style={styles.optionTextWrap}>
            <Text
              style={[
                styles.optionLabel,
                { color: theme.text },
                selected && { color: theme.tint },
              ]}
              numberOfLines={1}>
              {country === 'Others' ? 'Others' : country}
            </Text>
            {tagline ? (
              <Text style={[styles.optionTagline, { color: theme.textSecondary }]} numberOfLines={1}>
                {tagline}
              </Text>
            ) : null}
          </View>

          {/* Check indicator */}
          {selected ? (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : (
            <View style={[styles.radioOuter, { borderColor: isDark ? theme.border : '#DCD7E4' }]}>
              <View style={styles.radioInner} />
            </View>
          )}
        </Pressable>
      );
    },
    [value, select, isDark, theme],
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
            colors={isDark ? ['#2A2438', '#1C1826'] : ['#F8F5FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Flag badge */}
          <View
            style={[
              styles.triggerFlagBadge,
              {
                backgroundColor: isDark ? '#3D3550' : '#EDE7FF',
                borderColor: isDark ? theme.border : 'rgba(137, 102, 250, 0.12)',
              },
            ]}>
            <Text style={styles.triggerFlagEmoji}>{value ? flag : '🌍'}</Text>
          </View>

          {/* Label */}
          <View style={styles.triggerTextWrap}>
            <Text style={[styles.triggerEyebrow, { color: theme.textSecondary }]}>Cuisine</Text>
            <Text
              style={[
                styles.triggerLabel,
                { color: theme.text },
                !value && { color: theme.textSecondary, fontWeight: '500' },
              ]}
              numberOfLines={1}>
              {value || placeholder}
            </Text>
          </View>

          {/* Chevron pill */}
          <View
            style={[
              styles.triggerChevron,
              {
                backgroundColor: isDark ? '#2A2438' : '#F3F0FF',
                borderColor: isDark ? theme.border : 'rgba(137, 102, 250, 0.1)',
              },
            ]}>
            <Ionicons name="chevron-expand-outline" size={16} color={theme.tint} />
          </View>
        </Pressable>
      </Animated.View>

      {/* ────────── Full-screen Picker Modal ────────── */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => {
          setOpen(false);
          setSearch('');
        }}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            setOpen(false);
            setSearch('');
          }}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? '#1C1826' : '#FAFAFD',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderTopWidth: isDark ? 1 : 0,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}>
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? theme.border : '#DCD7E4' }]} />

          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Choose Cuisine</Text>
            <Pressable
              onPress={() => {
                setOpen(false);
                setSearch('');
              }}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: isDark ? '#2A2438' : '#F3F1F6' },
                pressed && styles.closeBtnPressed,
              ]}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Search */}
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
              <Pressable
                onPress={() => setSearch('')}
                hitSlop={8}
                style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </Pressable>
            ) : null}
          </View>

          {/* Country list */}
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No matching cuisines found</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
    minHeight: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(137, 102, 250, 0.18)',
    overflow: 'hidden',
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  triggerFlagBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EDE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(137, 102, 250, 0.12)',
  },
  triggerFlagEmoji: {
    fontSize: 22,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  triggerTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  triggerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: SnapChef.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: SnapChef.ink,
    letterSpacing: 0.1,
  },
  triggerPlaceholder: {
    color: SnapChef.muted,
    fontWeight: '500',
  },
  triggerChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(137, 102, 250, 0.1)',
  },

  /* ── Modal ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 1, 22, 0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
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
    paddingTop: 4,
    paddingBottom: 12,
  },
  separator: {
    height: 4,
  },

  /* ── Option Row ── */
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#F3EFFF',
    borderColor: 'rgba(137, 102, 250, 0.22)',
  },
  optionPressed: {
    backgroundColor: '#F8F6FF',
  },
  optionFlag: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F1F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionFlagSelected: {
    backgroundColor: '#EDE7FF',
  },
  optionFlagEmoji: {
    fontSize: 22,
    textAlign: 'center',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  optionTextWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: SnapChef.ink,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: SnapChef.primary,
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
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#DCD7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 0,
    height: 0,
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
