import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { FavoriteButton } from '@/components/favorite-button';
import { GlassBackButton } from '@/components/glass-back-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { ServingsAdjuster } from '@/components/servings-adjuster';
import { AppDialog } from '@/components/ui/app-dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPill } from '@/components/ui/glass-pill';
import { ThemedText } from '@/components/themed-text';
import { useShoppingList } from '@/context/ShoppingListContext';
import { SnapChef, Spacing } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useTheme } from '@/hooks/use-theme';
import { getFavoriteById } from '@/services/favoritesStorage';
import { getLastRecipeSearch, getSessionRecipe } from '@/services/recipeSession';
import type { Ingredient, Recipe } from '@/types/recipe';
import { smartBack } from '@/utils/navigation';
import { formatIngredientLine, getScaledIngredients } from '@/utils/scaleRecipe';
import { getRecipeImageUrl } from '@/utils/recipeImage';

function IngredientSection({
  title,
  items,
  badge,
  tint = 'white',
  dotColor = '#8966FA',
  badgeBg,
  badgeColor,
  rowAccent,
}: {
  title: string;
  items: Ingredient[];
  badge?: string;
  tint?: 'lavender' | 'mint' | 'cream' | 'peach' | 'white';
  dotColor?: string;
  badgeBg?: string;
  badgeColor?: string;
  rowAccent?: 'ready' | 'missing' | 'optional';
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <GlassCard tint={tint}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionDot, { backgroundColor: dotColor }]} />
          <ThemedText type="smallBold">{title}</ThemedText>
        </View>
        {badge ? (
          <View style={[styles.sectionBadge, badgeBg ? { backgroundColor: badgeBg } : null]}>
            <Text style={[styles.sectionBadgeText, badgeColor ? { color: badgeColor } : null]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {items.map((ingredient) => (
        <View
          key={`${title}-${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
          style={styles.ingredientRow}>
          {rowAccent === 'ready' ? (
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          ) : (
            <View style={[styles.ingredientDot, { backgroundColor: dotColor }]} />
          )}
          <ThemedText type="small" style={styles.ingredientLine}>
            {formatIngredientLine(ingredient)}
          </ThemedText>
          {rowAccent === 'ready' ? (
            <Text style={styles.readyLabel}>Ready</Text>
          ) : null}
        </View>
      ))}
    </GlassCard>
  );
}

function backFallbackHref(): '/' | { pathname: '/recipes'; params: { ingredients: string; country: string } } {
  const last = getLastRecipeSearch();
  if (last) {
    return {
      pathname: '/recipes',
      params: {
        ingredients: last.ingredientsJson,
        country: last.country,
      },
    };
  }
  return '/';
}

export default function RecipeDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isTablet, isWide, contentMaxWidth, horizontalPad } = useResponsiveLayout();
  const { addIngredients } = useShoppingList();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const [recipe, setRecipe] = useState<Recipe | undefined>(() =>
    recipeId ? getSessionRecipe(recipeId) : undefined,
  );
  const [isLoading, setIsLoading] = useState(!recipe);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(undefined);
      setIsLoading(false);
      return;
    }

    const sessionRecipe = getSessionRecipe(recipeId);
    if (sessionRecipe) {
      setRecipe(sessionRecipe);
      setServings(sessionRecipe.servings);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    void (async () => {
      const favorite = await getFavoriteById(recipeId);
      if (!active) {
        return;
      }

      setRecipe(favorite);
      setServings(favorite?.servings ?? 1);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [recipeId]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) {
      return [];
    }

    return getScaledIngredients(recipe.ingredients, recipe.servings, servings);
  }, [recipe, servings]);

  const missingIngredients = recipe?.missingIngredients ?? [];
  const optionalIngredients = recipe?.optionalIngredients ?? [];

  const handleBack = () => smartBack(backFallbackHref());

  if (isLoading) {
    return (
      <View style={styles.root}>
        <ScreenContainer withTabInset={false} gradient edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.contentBelowBack}>
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.tint} />
              <ThemedText type="small">Loading recipe...</ThemedText>
            </View>
          </View>
        </ScreenContainer>
        <GlassBackButton onPress={handleBack} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.root}>
        <ScreenContainer scroll withTabInset={false} gradient edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.contentBelowBack}>
            <ThemedText type="subtitle">Recipe not found</ThemedText>
            <ThemedText themeColor="textSecondary">
              This recipe is no longer in session. Go back to results or open one from Favorites.
            </ThemedText>
            <GlassPill label="Go back" variant="primary" onPress={handleBack} />
          </View>
        </ScreenContainer>
        <GlassBackButton onPress={handleBack} />
      </View>
    );
  }

  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  // Hero badge from real fields only — never invent labels
  const heroBadge = recipe.difficulty
    ? recipe.difficulty.toUpperCase()
    : totalTime > 0 && totalTime <= 30
      ? `${totalTime} MIN`
      : null;
  const metaPills = [
    recipe.cuisine ?? recipe.country
      ? { key: 'cuisine', label: recipe.cuisine ?? recipe.country!, icon: 'flag-outline' as const, tone: 'purple' as const }
      : null,
    recipe.difficulty
      ? {
          key: 'difficulty',
          label: recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1),
          icon: 'leaf-outline' as const,
          tone: 'green' as const,
        }
      : null,
    totalTime > 0
      ? { key: 'total', label: `${totalTime} min total`, icon: 'time-outline' as const, tone: 'purple' as const }
      : null,
    recipe.prepTimeMinutes
      ? {
          key: 'prep',
          label: `${recipe.prepTimeMinutes} min prep`,
          icon: 'restaurant-outline' as const,
          tone: 'orange' as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: 'flag-outline' | 'leaf-outline' | 'time-outline' | 'restaurant-outline';
    tone: 'purple' | 'green' | 'orange';
  }>;

  const handleAddMissing = async () => {
    if (missingIngredients.length === 0) {
      setNotice({
        title: 'Nothing missing',
        message: 'This recipe has no missing ingredients.',
      });
      return;
    }
    const added = await addIngredients(missingIngredients, recipe.title);
    setToastMessage(
      added > 0
        ? `Added ${added} item${added === 1 ? '' : 's'} to your shopping list!`
        : 'Items were already on your shopping list.',
    );
  };

  const handleAddOptional = async () => {
    if (optionalIngredients.length === 0) {
      return;
    }
    const added = await addIngredients(optionalIngredients, recipe.title);
    setToastMessage(
      added > 0
        ? `Added ${added} optional item${added === 1 ? '' : 's'} to your list!`
        : 'Optional items were already on your list.',
    );
  };

  return (
    <View style={styles.root}>
      <ScreenContainer scroll withTabInset={false} gradient edges={['top', 'bottom', 'left', 'right']}>
        {/* Clears the floating back control — image must not sit under it */}
        <View style={styles.backClearance} />

        <View style={styles.heroBlock}>
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: getRecipeImageUrl(recipe) }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient
              colors={['transparent', 'rgba(10,1,22,0.78)']}
              style={styles.heroGradient}>
              <View style={styles.heroCopy}>
                {heroBadge ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{heroBadge}</Text>
                  </View>
                ) : null}
                <ThemedText
                  type={isWide ? 'subtitle' : 'smallBold'}
                  style={styles.heroTitle}
                  numberOfLines={3}>
                  {recipe.title}
                </ThemedText>
              </View>
            </LinearGradient>
            <View style={styles.heroFavorite}>
              <FavoriteButton recipe={recipe} />
            </View>
          </View>

          {recipe.description ? (
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {recipe.description}
            </ThemedText>
          ) : null}

          {metaPills.length > 0 ? (
            <View style={styles.metaRow}>
              {metaPills.map((pill) => (
                <View
                  key={pill.key}
                  style={[
                    styles.metaPill,
                    pill.tone === 'green' && styles.metaPillGreen,
                    pill.tone === 'orange' && styles.metaPillOrange,
                  ]}>
                  <Ionicons
                    name={pill.icon}
                    size={13}
                    color={
                      pill.tone === 'green'
                        ? '#059669'
                        : pill.tone === 'orange'
                          ? '#D97706'
                          : SnapChef.primary
                    }
                  />
                  <Text
                    style={[
                      styles.metaPillText,
                      pill.tone === 'green' && styles.metaPillTextGreen,
                      pill.tone === 'orange' && styles.metaPillTextOrange,
                    ]}>
                    {pill.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <GlassCard tint="white">
          <View style={styles.servingsRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: SnapChef.primary }]} />
              <ThemedText type="smallBold">Servings</ThemedText>
            </View>
            <View style={styles.servingsStepperWrap}>
              <ServingsAdjuster servings={servings} onChange={setServings} />
            </View>
          </View>
        </GlassCard>

        <IngredientSection
          title="You have"
          items={scaledIngredients}
          badge={`${scaledIngredients.length} in pantry`}
          tint="white"
          dotColor="#10B981"
          badgeBg="rgba(16, 185, 129, 0.12)"
          badgeColor="#059669"
          rowAccent="ready"
        />
        <IngredientSection
          title="Missing"
          items={missingIngredients}
          badge={`${missingIngredients.length} to get`}
          tint="white"
          dotColor="#EF4444"
          badgeBg="rgba(239, 68, 68, 0.1)"
          badgeColor="#DC2626"
          rowAccent="missing"
        />
        <IngredientSection
          title="Optional"
          items={optionalIngredients}
          badge={`${optionalIngredients.length} optional`}
          tint="white"
          dotColor="#F59E0B"
          badgeBg="rgba(245, 158, 11, 0.12)"
          badgeColor="#D97706"
          rowAccent="optional"
        />

        {optionalIngredients.length > 0 ? (
          <GlassPill
            label="Add optional to list"
            variant="glass"
            onPress={() => void handleAddOptional()}
          />
        ) : null}

        <GlassCard tint="white">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8966FA' }} />
            <ThemedText type="smallBold">Steps</ThemedText>
          </View>
          {recipe.steps.map((step, index) => (
            <View key={`${index}-${step}`} style={{ flexDirection: 'row', gap: 8, marginBottom: 10, paddingLeft: 4 }}>
              <ThemedText type="small" style={{ fontWeight: '700', color: '#8966FA' }}>{index + 1}.</ThemedText>
              <ThemedText type="small" style={{ flex: 1, lineHeight: 18 }}>{step}</ThemedText>
            </View>
          ))}
        </GlassCard>
        {/* Spacer so content clears the floating action dock */}
        <View
          style={{
            height:
              (missingIngredients.length > 0 ? (isTablet ? 100 : 148) : isTablet ? 88 : 96) +
              Math.max(insets.bottom, 12),
          }}
        />
      </ScreenContainer>

      {/* ── Bottom actions: centered Add Missing above Start Cooking ── */}
      <View
        pointerEvents="box-none"
        style={[
          styles.dockShell,
          {
            paddingHorizontal: horizontalPad,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}>
        <View
          style={[
            styles.dock,
            {
              backgroundColor: theme.backgroundElement || '#FFFFFF',
              maxWidth: contentMaxWidth ?? undefined,
              width: '100%',
              alignSelf: 'center',
            },
          ]}>
          <View style={styles.dockInner}>
            {missingIngredients.length > 0 ? (
              <View style={styles.secondaryCenter}>
                <Pressable
                  onPress={() => void handleAddMissing()}
                  style={({ pressed }) => [
                    styles.secondaryLink,
                    pressed && styles.secondaryLinkPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add missing ingredients to shopping list">
                  <View style={styles.actionRow}>
                    <View style={styles.secondaryIconDisc}>
                      <Ionicons name="cart-outline" size={16} color={SnapChef.primary} />
                    </View>
                    <Text style={styles.secondaryLinkText} numberOfLines={1}>
                      Add Missing Ingredients
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              onPress={() => router.push(`/recipe/${recipe.id}/cook`)}
              style={({ pressed }) => [styles.primaryWrap, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Start Cooking">
              <LinearGradient
                colors={[SnapChef.primary, '#6B4DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}>
                <View style={styles.actionRow}>
                  <View style={styles.primaryIconDisc}>
                    <Ionicons name="play" size={14} color="#FFFFFF" style={styles.primaryPlayIcon} />
                  </View>
                  <Text style={styles.primaryBtnText}>Start Cooking</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>

      {toastMessage ? (
        <View
          style={[
            styles.toastContainer,
            {
              bottom:
                (missingIngredients.length > 0 ? (isTablet ? 108 : 156) : isTablet ? 96 : 104) +
                Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View style={styles.toastCard}>
            <View style={styles.toastContent}>
              <Ionicons name="checkmark-circle" size={19} color="#10B981" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <GlassBackButton onPress={handleBack} />

      <AppDialog
        visible={notice !== null}
        title={notice?.title ?? ''}
        message={notice?.message}
        confirmOnly
        confirmLabel="OK"
        onConfirm={() => setNotice(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /** Match GlassBackButton circle (44) + small gap — keeps hero below the control */
  backClearance: {
    height: 52,
  },
  contentBelowBack: {
    gap: Spacing.three,
    paddingTop: 52,
  },
  heroBlock: {
    gap: Spacing.three,
  },
  heroWrap: {
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#EDE7FF',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  heroCopy: {
    gap: 10,
    paddingRight: 48,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  heroFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dockShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  description: {
    lineHeight: 21,
    fontSize: 14,
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(137, 102, 250, 0.1)',
  },
  metaPillGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  metaPillOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: SnapChef.primary,
  },
  metaPillTextGreen: {
    color: '#059669',
  },
  metaPillTextOrange: {
    color: '#D97706',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 40,
  },
  servingsStepperWrap: {
    flexShrink: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingLeft: 2,
  },
  ingredientDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  ingredientLine: {
    flex: 1,
  },
  readyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  dock: {
    borderRadius: 28,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 12,
  },
  dockInner: {
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryCenter: {
    width: '100%',
    alignItems: 'center',
  },
  /* Stitch: text-link row — cart disc + purple label, no pill fill */
  secondaryLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryLinkPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  secondaryIconDisc: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  secondaryLinkText: {
    color: SnapChef.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      web: { display: 'flex' as const },
      default: {},
    }),
  },
  primaryWrap: {
    width: '100%',
    borderRadius: 999,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtn: {
    width: '100%',
    minHeight: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  primaryIconDisc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  primaryPlayIcon: {
    marginLeft: 2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  toastContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCard: {
    backgroundColor: '#0A0116',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxWidth: '90%',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
