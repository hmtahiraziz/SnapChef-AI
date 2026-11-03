import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenContainer } from '@/components/screen-container';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { FavoriteRecipeCard } from '@/components/ui/favorite-recipe-card';
import { getCountryFlag } from '@/constants/countries';
import { SnapChef, Spacing } from '@/constants/theme';
import { useFavorites } from '@/context/FavoritesContext';
import type { FavoriteRecipe } from '@/types/recipe';
import { useTheme } from '@/hooks/use-theme';

type FilterId = 'all' | 'quick' | string;
type SortId = 'recent' | 'oldest' | 'az';

const SORT_OPTIONS: { id: SortId; label: string; hint: string }[] = [
  { id: 'recent', label: 'Recently Added', hint: 'Newest saves first' },
  { id: 'oldest', label: 'Oldest First', hint: 'Earliest saves first' },
  { id: 'az', label: 'Name A–Z', hint: 'Alphabetical by title' },
];

function totalMinutes(recipe: FavoriteRecipe): number {
  return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
}

function formatTime(recipe: FavoriteRecipe): string {
  const total = totalMinutes(recipe);
  return total > 0 ? `${total} min` : 'Time varies';
}

export default function FavoritesScreen() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showSortModal, setShowSortModal] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const [sort, setSort] = useState<SortId>('recent');

  const cuisineFilters = useMemo(() => {
    const set = new Set<string>();
    for (const recipe of favorites) {
      const c = recipe.cuisine ?? recipe.country;
      if (c) set.add(c);
    }
    return [...set].sort();
  }, [favorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...favorites];

    if (filter === 'quick') {
      list = list.filter((r) => {
        const t = totalMinutes(r);
        return t > 0 && t <= 30;
      });
    } else if (filter !== 'all') {
      list = list.filter((r) => (r.cuisine ?? r.country) === filter);
    }

    if (q) {
      list = list.filter((r) => {
        const hay = `${r.title} ${r.description ?? ''} ${r.cuisine ?? ''} ${r.country ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (sort === 'recent') {
      list.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''));
    } else if (sort === 'oldest') {
      list.sort((a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''));
    } else {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [favorites, filter, query, sort]);

  const chips: {
    id: FilterId;
    label: string;
    count?: number;
    icon?: keyof typeof Ionicons.glyphMap;
    flag?: string;
  }[] = [
    { id: 'all', label: 'All', count: favorites.length },
    { id: 'quick', label: '< 30 mins', icon: 'time-outline' },
    ...cuisineFilters.map((c) => ({
      id: c as FilterId,
      label: c,
      flag: getCountryFlag(c),
    })),
  ];

  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? 'Recently Added';
  const filtersActive = filter !== 'all';
  const iconBtnBg = theme.isDark ? theme.backgroundElement : SnapChef.white;
  const iconBtnBorder = theme.isDark ? theme.border : SnapChef.fieldBorder;

  return (
    <>
      <ScreenContainer
        scroll
        gradient
        header={
          <View style={styles.headerBlock}>
            <View style={styles.headerTop}>
              <View style={styles.titleBlock}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
                  {favorites.length > 0 ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{favorites.length} Saved</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Your saved recipes, ready when you are.
                </Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => {
                    setShowSearch((v) => {
                      if (v) setQuery('');
                      return !v;
                    });
                  }}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: showSearch ? '#ECE6FD' : iconBtnBg,
                      borderColor: showSearch ? 'rgba(137, 102, 250, 0.35)' : iconBtnBorder,
                    },
                  ]}
                  accessibilityLabel="Search favorites">
                  <Ionicons
                    name={showSearch ? 'close' : 'search'}
                    size={17}
                    color={showSearch ? SnapChef.primary : theme.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setShowFilters((v) => !v)}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor: showFilters || filtersActive ? '#ECE6FD' : iconBtnBg,
                      borderColor:
                        showFilters || filtersActive
                          ? 'rgba(137, 102, 250, 0.35)'
                          : iconBtnBorder,
                    },
                  ]}
                  accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}>
                  <Ionicons
                    name="options-outline"
                    size={17}
                    color={showFilters || filtersActive ? SnapChef.primary : theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            {showSearch && favorites.length > 0 ? (
              <View
                style={[
                  styles.searchRow,
                  {
                    backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
                    borderColor: theme.isDark ? theme.border : SnapChef.fieldBorder,
                  },
                ]}>
                <Ionicons name="search" size={16} color={SnapChef.primary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search saved recipes..."
                  placeholderTextColor={theme.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                />
                {query.length > 0 ? (
                  <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                    <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        }>
        {isLoading ? <ActivityIndicator color={SnapChef.primary} style={styles.loader} /> : null}

        {!isLoading && favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Generate a recipe, then save it with the heart to see it here."
            actionLabel="Go to Home"
            onAction={() => router.push('/(tabs)')}
          />
        ) : null}

        {favorites.length > 0 ? (
          <>
            {showFilters ? (
              <View style={styles.chipsWrap}>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipsScroll}
                  contentContainerStyle={styles.chipsRow}>
                  {chips.map((chip) => {
                    const active = filter === chip.id;
                    return (
                      <Pressable
                        key={chip.id}
                        onPress={() => setFilter(chip.id)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? SnapChef.primary : SnapChef.white,
                            borderColor: active ? SnapChef.primary : SnapChef.fieldBorder,
                          },
                          !theme.isDark && !active ? styles.chipIdle : null,
                          theme.isDark && !active
                            ? {
                                backgroundColor: theme.backgroundElement,
                                borderColor: theme.border,
                              }
                            : null,
                        ]}>
                        {chip.flag && !active ? (
                          <Text style={styles.chipFlag}>{chip.flag}</Text>
                        ) : null}
                        {chip.icon && !active ? (
                          <Ionicons name={chip.icon} size={12} color={SnapChef.primary} />
                        ) : null}
                        <Text
                          style={[
                            styles.chipText,
                            { color: active ? '#fff' : theme.text },
                          ]}>
                          {chip.label}
                        </Text>
                        {chip.count != null && active ? (
                          <View style={styles.chipCount}>
                            <Text style={styles.chipCountText}>{chip.count}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.resultRow}>
              <Text style={[styles.resultText, { color: theme.textSecondary }]}>
                Showing{' '}
                <Text style={{ color: theme.text, fontWeight: '700' }}>{filtered.length}</Text>
                {' matched recipes'}
              </Text>
              <Pressable
                onPress={() => setShowSortModal(true)}
                style={styles.sortBtn}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${sortLabel}`}>
                <Text style={styles.sortText} numberOfLines={1}>
                  {sortLabel}
                </Text>
                <Ionicons name="chevron-down" size={12} color={SnapChef.primary} />
              </Pressable>
            </View>

            <View style={styles.listWrap}>
              {filtered.length === 0 ? (
                <Text style={[styles.emptyFilter, { color: theme.textSecondary }]}>
                  No favorites match this filter.
                </Text>
              ) : (
                filtered.map((recipe) => (
                  <FavoriteRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    timeLabel={formatTime(recipe)}
                    favorited
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    onToggleFavorite={() => void removeFavorite(recipe.id)}
                  />
                ))
              )}
            </View>
          </>
        ) : null}
      </ScreenContainer>

      <BottomSheetModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        sheetStyle={[
          styles.sortSheet,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
            paddingBottom: Math.max(insets.bottom, 20),
            borderColor: theme.isDark ? theme.border : SnapChef.fieldBorder,
          },
        ]}>
        <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
        <Text style={[styles.sheetTitle, { color: theme.text }]}>Sort favorites</Text>
        <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
          Choose how saved recipes are ordered
        </Text>

        {SORT_OPTIONS.map((option) => {
          const active = sort === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => {
                setSort(option.id);
                setShowSortModal(false);
              }}
              style={[
                styles.sortOption,
                {
                  backgroundColor: active
                    ? theme.isDark
                      ? theme.backgroundSelected
                      : '#ECE6FD'
                    : theme.isDark
                      ? theme.background
                      : SnapChef.field,
                  borderColor: active
                    ? 'rgba(137, 102, 250, 0.4)'
                    : theme.isDark
                      ? theme.border
                      : SnapChef.fieldBorder,
                },
              ]}>
              <View style={styles.sortOptionText}>
                <Text style={[styles.sortOptionLabel, { color: theme.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.sortOptionHint, { color: theme.textSecondary }]}>
                  {option.hint}
                </Text>
              </View>
              {active ? (
                <Ionicons name="checkmark-circle" size={22} color={SnapChef.primary} />
              ) : (
                <View style={[styles.sortRadio, { borderColor: theme.border }]} />
              )}
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => setShowSortModal(false)}
          style={[
            styles.sheetCancel,
            { backgroundColor: theme.isDark ? theme.backgroundSelected : SnapChef.field },
          ]}>
          <Text style={[styles.sheetCancelText, { color: theme.text }]}>Cancel</Text>
        </Pressable>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: '#ECE6FD',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(137, 102, 250, 0.22)',
  },
  countBadgeText: {
    color: SnapChef.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#7546F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  loader: { marginVertical: Spacing.three },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#7546F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  chipsWrap: {
    flexGrow: 0,
    flexShrink: 0,
    marginHorizontal: -2,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 2,
    paddingRight: 10,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipIdle: {
    shadowColor: '#7546F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  chipFlag: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipCount: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 10,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '52%',
    paddingVertical: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: SnapChef.primary,
    flexShrink: 1,
  },
  listWrap: {
    flexGrow: 0,
    gap: 14,
  },
  emptyFilter: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '500',
  },
  sortSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sortOptionText: {
    flex: 1,
    gap: 2,
  },
  sortOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  sortOptionHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  sheetCancel: {
    marginTop: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  sheetCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
