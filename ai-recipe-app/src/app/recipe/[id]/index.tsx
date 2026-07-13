import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { FavoriteButton } from '@/components/favorite-button';
import { GlassBackButton } from '@/components/glass-back-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { ServingsAdjuster } from '@/components/servings-adjuster';
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
  tint = 'white',
  dotColor = '#8966FA',
}: {
  title: string;
  items: Ingredient[];
  tint?: 'lavender' | 'mint' | 'cream' | 'peach' | 'white';
  dotColor?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <GlassCard tint={tint}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
        <ThemedText type="smallBold">{title}</ThemedText>
      </View>
      {items.map((ingredient) => (
        <ThemedText
          key={`${title}-${ingredient.name}-${ingredient.quantity}-${ingredient.unit}`}
          type="small"
          style={{ marginLeft: 16, marginBottom: 4 }}
        >
          • {formatIngredientLine(ingredient)}
        </ThemedText>
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
  const { isTablet, isWide, isNarrow, contentMaxWidth, horizontalPad } = useResponsiveLayout();
  const { addIngredients } = useShoppingList();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const [recipe, setRecipe] = useState<Recipe | undefined>(() =>
    recipeId ? getSessionRecipe(recipeId) : undefined,
  );
  const [isLoading, setIsLoading] = useState(!recipe);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        <ScreenContainer withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
          <View style={styles.topPad} />
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.tint} />
            <ThemedText type="small">Loading recipe...</ThemedText>
          </View>
        </ScreenContainer>
        <GlassBackButton onPress={handleBack} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.root}>
        <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
          <View style={styles.topPad} />
          <ThemedText type="subtitle">Recipe not found</ThemedText>
          <ThemedText themeColor="textSecondary">
            This recipe is no longer in session. Go back to results or open one from Favorites.
          </ThemedText>
          <GlassPill label="Go back" variant="primary" onPress={handleBack} />
        </ScreenContainer>
        <GlassBackButton onPress={handleBack} />
      </View>
    );
  }

  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const metaParts = [
    recipe.cuisine ?? recipe.country,
    recipe.difficulty
      ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)
      : null,
    totalTime > 0 ? `${totalTime} min total` : null,
    recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} min prep` : null,
    recipe.cookTimeMinutes ? `${recipe.cookTimeMinutes} min cook` : null,
  ].filter(Boolean);

  const handleAddMissing = async () => {
    if (missingIngredients.length === 0) {
      Alert.alert('Nothing missing', 'This recipe has no missing ingredients.');
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
      <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
        <View style={styles.topPad} />

        <View style={styles.heroWrap}>
          <Image
            source={{ uri: getRecipeImageUrl(recipe) }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,1,22,0.75)']}
            style={styles.heroGradient}>
            <ThemedText type={isWide ? 'subtitle' : 'smallBold'} style={styles.heroTitle} numberOfLines={3}>
              {recipe.title}
            </ThemedText>
          </LinearGradient>
          <View style={styles.heroFavorite}>
            <FavoriteButton recipe={recipe} />
          </View>
        </View>

        {recipe.description ? (
          <ThemedText themeColor="textSecondary">{recipe.description}</ThemedText>
        ) : null}

        <ThemedText themeColor="textSecondary">{metaParts.join(' · ')}</ThemedText>

        <GlassCard tint="white">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8966FA' }} />
            <ThemedText type="smallBold">Servings</ThemedText>
          </View>
          <ServingsAdjuster servings={servings} onChange={setServings} />
        </GlassCard>

        <IngredientSection title="You have" items={scaledIngredients} tint="white" dotColor="#10B981" />
        <IngredientSection title="Missing" items={missingIngredients} tint="white" dotColor="#EF4444" />
        <IngredientSection title="Optional" items={optionalIngredients} tint="white" dotColor="#F59E0B" />

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

      {/* ── Floating premium action dock ── */}
      <View
        pointerEvents="box-none"
        style={[
          styles.dockShell,
          {
            paddingHorizontal: horizontalPad,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}
      >
        <View
          style={[
            styles.dock,
            {
              backgroundColor: theme.backgroundElement || '#ffffff',
              borderColor: theme.border || 'rgba(137, 102, 250, 0.12)',
              maxWidth: contentMaxWidth ?? undefined,
              width: '100%',
              alignSelf: 'center',
            },
          ]}
        >
          <View style={[styles.dockInner, isTablet && styles.dockInnerRow]}>
            {missingIngredients.length > 0 ? (
              <Pressable
                onPress={() => void handleAddMissing()}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  isTablet && styles.secondaryBtnTablet,
                  pressed && styles.btnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add missing ingredients to shopping list"
              >
                <View style={styles.secondaryIconDisc}>
                  <Ionicons name="cart-outline" size={18} color={SnapChef.primary} />
                </View>
                <Text style={styles.secondaryBtnText} numberOfLines={1}>
                  {isNarrow ? 'Add Missing' : 'Add Missing Ingredients'}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.push(`/recipe/${recipe.id}/cook`)}
              style={({ pressed }) => [
                styles.primaryWrap,
                isTablet && styles.primaryWrapTablet,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start Cooking"
            >
              <LinearGradient
                colors={[SnapChef.primary, '#603FEF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <View style={styles.primaryHighlight} pointerEvents="none" />
                <Ionicons name="play-circle" size={22} color="#ffffff" />
                <Text style={styles.primaryBtnText}>Start Cooking</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topPad: { height: 52 },
  heroWrap: {
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: Spacing.two,
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
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
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
  dock: {
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  dockInner: {
    gap: 10,
  },
  dockInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryBtn: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: '#F5F2FF',
    borderWidth: 1.5,
    borderColor: 'rgba(137, 102, 250, 0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  secondaryBtnTablet: {
    flex: 0.42,
  },
  secondaryIconDisc: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(137, 102, 250, 0.18)',
  },
  secondaryBtnText: {
    color: SnapChef.primary,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  primaryWrap: {
    borderRadius: 999,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryWrapTablet: {
    flex: 0.58,
  },
  primaryBtn: {
    minHeight: 56,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  primaryHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnPressed: {
    opacity: 0.88,
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
    borderWidth: 1.5,
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
