import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark } from '@/components/brand-mark';
import { GenerateRecipeCard } from '@/components/generate-recipe-card';
import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
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

function formatTime(prep?: number, cook?: number): string {
  const total = (prep ?? 0) + (cook ?? 0);
  return total > 0 ? `${total} minutes` : 'Time varies';
}

export default function HomeScreen() {
  const { ingredients, mergeIngredients, removeIngredient } = useIngredients();
  const { country, setCountry } = usePreferences();
  const { favorites } = useFavorites();
  const theme = useTheme();

  const [showCamera, setShowCamera] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const { openCamera, openGallery } = useLocalSearchParams<{ openCamera?: string; openGallery?: string }>();
  const [initialAction, setInitialAction] = useState<'camera' | 'gallery' | null>(null);

  useEffect(() => {
    if (ingredients.length === 0) {
      setScannedImageUri(null);
    }
  }, [ingredients.length]);

  useEffect(() => {
    if (openCamera === 'true') {
      setInitialAction('camera');
      setShowCamera(true);
    } else if (openGallery === 'true') {
      setInitialAction('gallery');
      setShowCamera(true);
    }
  }, [openCamera, openGallery]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return '🌅 Good morning';
    if (hours < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const history = favorites.slice(0, 4);
  const tints = ['lavender', 'mint', 'cream', 'peach'] as const;
  const isDark = theme.text === '#F5F2FF';

  const craftColors = isDark
    ? (['#201936', '#161026'] as const)
    : (['#EBE5FF', '#C7B5FD'] as const);

  const craftBorderColor = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.5)';

  const wandBgColor = isDark ? '#2C2442' : '#ffffff';

  return (
    <ScreenContainer scroll gradient>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, isDark && styles.greetingDark]}>{getGreeting()}</Text>
          <View style={styles.brandRow}>
            <BrandMark size={33} tone={isDark ? 'dark' : 'light'} />
            <Text style={[styles.brand, { color: theme.text }]}>SnapChef AI</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={[styles.headerProfileBtn, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
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
              <Text style={[styles.craftTitle, { color: theme.text }]}>Crafting a recipe from your kitchen treasures</Text>
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
                  if (imageUri) {
                    setScannedImageUri(imageUri);
                  }
                  setShowCamera(false);
                  setInitialAction(null);
                }}
                initialAction={initialAction}
                onClose={() => {
                  setShowCamera(false);
                  setInitialAction(null);
                }}
              />
            ) : null}

            <GenerateRecipeCard
              ingredientCount={ingredients.length}
              country={country}
              disabled={ingredients.length === 0}
              onPress={() =>
                router.push({
                  pathname: '/recipes',
                  params: {
                    ingredients: JSON.stringify(ingredients),
                    country,
                    scanImage: scannedImageUri || undefined,
                  },
                })
              }
            />
          </View>
        </LinearGradient>
      </View>

      {!hasApiBaseUrl() ? (
        <Text style={styles.warning}>
          Configure EXPO_PUBLIC_API_BASE_URL in .env to enable AI scan.
        </Text>
      ) : null}

      <Pressable
        onPress={() => router.push('/(tabs)/settings')}
        accessibilityRole="button"
        accessibilityLabel="Navigate to settings to cook smarter with what you have"
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
              <Text style={styles.promoBadgeText}>SnapChef AI</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={24} color="#ffffff" style={{ opacity: 0.9 }} />
          </View>
          <Text style={styles.promoTitle}>Cook smarter with what you have</Text>
          <Text style={styles.promoBody}>Snap ingredients. Get regional recipes in seconds.</Text>
        </LinearGradient>
      </Pressable>

      <SectionHeader
        title="History"
        actionLabel="See all"
        onAction={() => router.push('/favorites')}
      />

      {history.length === 0 ? (
        <GlassCard tint="white">
          <Text style={styles.emptyHistory}>
            Saved recipes will show up here. Generate something delicious to get started.
          </Text>
        </GlassCard>
      ) : (
        history.map((recipe, index) => (
          <RecipeGlassCard
            key={recipe.id}
            title={recipe.title}
            timeLabel={formatTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes)}
            meta={`${recipe.servings} servings`}
            tint={tints[index % tints.length]}
            imageUrl={recipe.imageUrl}
            recipeId={recipe.id}
            cuisine={recipe.cuisine ?? recipe.country}
            favorited
            onPress={() => router.push(`/recipe/${recipe.id}`)}
            onToggleFavorite={() =>
              Alert.alert('Open Favorites', 'Manage saved recipes in the Favorites tab.')
            }
          />        ))
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: '#ffffff',
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
    color: '#0A0116',
    lineHeight: 20,
  },
  sectionBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: SnapChef.ink,
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
    marginBottom: Spacing.two,
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
  emptyHistory: {
    fontSize: 14,
    color: SnapChef.muted,
    lineHeight: 20,
  },
});
