import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BrandMark } from '@/components/brand-mark';
import { GenerateRecipeCard } from '@/components/generate-recipe-card';
import { ScreenContainer } from '@/components/screen-container';
import { EmptyState } from '@/components/ui/empty-state';
import { IngredientComposer } from '@/components/ui/ingredient-composer';
import { RecipeGlassCard } from '@/components/ui/recipe-glass-card';
import { SectionHeader } from '@/components/ui/section-header';
import { hasApiBaseUrl } from '@/constants/env';
import { SnapChef, Spacing } from '@/constants/theme';
import { useFavorites } from '@/context/FavoritesContext';
import { usePreferences } from '@/context/PreferencesContext';
import { IngredientCapture, useIngredients } from '@/features/scan';
import { CountryDropdown } from '@/features/settings';
import { useTheme } from '@/hooks/use-theme';

type ScanSource = 'camera' | 'gallery' | null;

function formatTime(prep?: number, cook?: number): string {
  const total = (prep ?? 0) + (cook ?? 0);
  return total > 0 ? `${total} minutes` : 'Time varies';
}

function greetingForHour(hours: number): string {
  if (hours < 12) return 'Good morning';
  if (hours < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { ingredients, mergeIngredients, removeIngredient } = useIngredients();
  const { country, setCountry } = usePreferences();
  const { favorites } = useFavorites();
  const theme = useTheme();

  const [showCamera, setShowCamera] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [initialAction, setInitialAction] = useState<ScanSource>(null);
  const { openCamera, openGallery } = useLocalSearchParams<{
    openCamera?: string;
    openGallery?: string;
  }>();

  const isDark = theme.text === '#F5F2FF';
  const previewFavorites = favorites.slice(0, 4);
  const tints = ['lavender', 'mint', 'cream', 'peach'] as const;

  const craftColors = isDark
    ? (['#201936', '#161026'] as const)
    : (['#EBE5FF', '#C7B5FD'] as const);
  const craftBorderColor = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.5)';
  const wandBgColor = isDark ? '#2C2442' : '#ffffff';

  const openScan = useCallback((source: ScanSource = null) => {
    setInitialAction(source);
    setShowCamera(true);
  }, []);

  const closeScan = useCallback(() => {
    setShowCamera(false);
    setInitialAction(null);
  }, []);

  const clearScanParams = useCallback(() => {
    router.setParams({
      openCamera: undefined,
      openGallery: undefined,
      time: undefined,
    });
  }, []);

  useEffect(() => {
    if (ingredients.length === 0) {
      setScannedImageUri(null);
    }
  }, [ingredients.length]);

  useEffect(() => {
    if (openCamera === 'true') {
      openScan('camera');
      clearScanParams();
      return;
    }
    if (openGallery === 'true') {
      openScan('gallery');
      clearScanParams();
    }
  }, [openCamera, openGallery, openScan, clearScanParams]);

  const onGenerate = () => {
    if (ingredients.length === 0) return;
    router.push({
      pathname: '/recipes',
      params: {
        ingredients: JSON.stringify(ingredients),
        country,
        scanImage: scannedImageUri || undefined,
      },
    });
  };

  return (
    <ScreenContainer scroll gradient>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, isDark && styles.greetingDark]}>
            {greetingForHour(new Date().getHours())}
          </Text>
          <View style={styles.brandRow}>
            <BrandMark size={33} tone={isDark ? 'dark' : 'light'} />
            <Text style={[styles.brand, { color: theme.text }]}>SnapChef AI</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={[
            styles.headerProfileBtn,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-sharp" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.craftCardShadow}>
        <LinearGradient
          colors={craftColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.craftCard, { borderColor: craftBorderColor }]}
        >
          <View style={styles.craftInner}>
            <View style={styles.craftHead}>
              <View style={[styles.wandContainer, { backgroundColor: wandBgColor }]}>
                <Ionicons name="sparkles" size={18} color={isDark ? '#FFF6D6' : '#0A0116'} />
              </View>
              <Text style={[styles.craftTitle, { color: theme.text }]}>
                Craft a recipe from what you have
              </Text>
            </View>

            <IngredientComposer
              ingredients={ingredients}
              onAddMany={mergeIngredients}
              onRemove={removeIngredient}
            />

            <View style={styles.sectionBlock}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Cuisine</Text>
              <CountryDropdown
                value={country}
                onChange={(next) => void setCountry(next)}
                maxListHeight={200}
              />
            </View>

            {showCamera ? (
              <IngredientCapture
                onIngredientsExtracted={(items, imageUri) => {
                  mergeIngredients(items);
                  if (imageUri) setScannedImageUri(imageUri);
                  closeScan();
                }}
                initialAction={initialAction}
                onClose={closeScan}
              />
            ) : null}

            <GenerateRecipeCard
              ingredientCount={ingredients.length}
              country={country}
              disabled={ingredients.length === 0}
              onPress={onGenerate}
            />
          </View>
        </LinearGradient>
      </View>

      {__DEV__ && !hasApiBaseUrl() ? (
        <Text style={styles.warning}>
          Dev: set EXPO_PUBLIC_API_BASE_URL to enable AI scan.
        </Text>
      ) : null}

      <Pressable
        onPress={() => openScan(null)}
        accessibilityRole="button"
        accessibilityLabel="Scan ingredients with SnapChef AI"
        style={({ pressed }) => [
          styles.promoPressable,
          pressed && styles.promoPressablePressed,
        ]}
      >
        <LinearGradient
          colors={['#8966FA', '#603FEF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoCard}
        >
          <View style={styles.promoHeaderRow}>
            <View style={styles.promoBadge}>
              <Ionicons name="sparkles" size={12} color="#8966FA" />
              <Text style={styles.promoBadgeText}>AI Scan</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={24} color="#ffffff" style={{ opacity: 0.9 }} />
          </View>
          <Text style={styles.promoTitle}>Snap ingredients. Cook smarter.</Text>
          <Text style={styles.promoBody}>
            Take or upload a photo — SnapChef finds recipes from your kitchen.
          </Text>
        </LinearGradient>
      </Pressable>

      <SectionHeader
        title="Favorites"
        actionLabel={previewFavorites.length > 0 ? 'See all' : undefined}
        onAction={previewFavorites.length > 0 ? () => router.push('/favorites') : undefined}
      />

      {previewFavorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Generate a recipe, then save it to see it here."
          actionLabel="Scan ingredients"
          onAction={() => openScan('camera')}
        />
      ) : (
        previewFavorites.map((recipe, index) => (
          <RecipeGlassCard
            key={recipe.id}
            title={recipe.title}
            timeLabel={formatTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}
            meta={`${recipe.servings} servings`}
            tint={tints[index % tints.length]}
            imageUrl={recipe.imageUrl}
            recipeId={recipe.id}
            cuisine={recipe.cuisine ?? recipe.country}
            onPress={() => router.push(`/recipe/${recipe.id}`)}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
    marginTop: 8,
  },
  headerLeft: {
    gap: 2,
    flex: 1,
    paddingRight: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: SnapChef.ink,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8966FA',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  greetingDark: {
    color: '#C4B0FF',
  },
  headerProfileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  craftCardShadow: {
    borderRadius: 28,
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.four,
    backgroundColor: 'transparent',
  },
  craftCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  craftInner: {
    padding: 20,
    gap: 16,
  },
  craftHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  wandContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  craftTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  sectionBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.8,
  },
  warning: {
    textAlign: 'center',
    color: SnapChef.muted,
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  promoPressable: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.four,
  },
  promoPressablePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  promoCard: {
    padding: 20,
    borderRadius: 24,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  promoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8966FA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 26,
    marginBottom: 6,
  },
  promoBody: {
    fontSize: 13,
    color: '#E3DCFF',
    lineHeight: 18,
    fontWeight: '500',
  },
});
