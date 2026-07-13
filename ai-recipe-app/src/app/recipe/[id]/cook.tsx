import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
  PanResponder,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { GlassBackButton } from '@/components/glass-back-button';
import { ScreenContainer } from '@/components/screen-container';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPill } from '@/components/ui/glass-pill';
import { ThemedText } from '@/components/themed-text';
import { Spacing, SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getFavoriteById } from '@/services/favoritesStorage';
import { getSessionRecipe } from '@/services/recipeSession';
import type { Recipe } from '@/types/recipe';
import { smartBack } from '@/utils/navigation';

function CookNavButton({
  label,
  onPress,
  disabled,
  variant,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: 'primary' | 'outline';
  icon?: 'chevron-back' | 'chevron-forward' | 'checkmark';
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const bg = isPrimary ? '#8966FA' : '#ffffff';
  const textCol = isPrimary ? '#ffffff' : '#8966FA';
  const borderCol = isPrimary ? 'transparent' : '#E8E4EF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(0.92, { damping: 10 });
      }}
      onPressOut={() => {
        if (!disabled) scale.value = withSpring(1.0, { damping: 10 });
      }}
      onHoverIn={() => {
        if (!disabled && Platform.OS === 'web') {
          scale.value = withSpring(1.08, { damping: 8 });
        }
      }}
      onHoverOut={() => {
        if (!disabled && Platform.OS === 'web') {
          scale.value = withSpring(1.0, { damping: 8 });
        }
      }}
      style={[styles.navBtnWrapper, disabled && styles.navBtnDisabled]}
    >
      <Animated.View
        style={[
          styles.navBtn,
          { backgroundColor: bg, borderColor: borderCol },
          isPrimary && styles.navBtnShadow,
          animatedStyle,
        ]}
      >
        <View style={styles.navBtnContent}>
          {icon === 'chevron-back' && (
            <Ionicons name="chevron-back" size={18} color={textCol} />
          )}
          <Text style={[styles.navBtnLabel, { color: textCol }]}>{label}</Text>
          {icon === 'chevron-forward' && (
            <Ionicons name="chevron-forward" size={18} color={textCol} />
          )}
          {icon === 'checkmark' && (
            <Ionicons name="checkmark-circle" size={18} color={textCol} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function CookModeScreen() {
  useKeepAwake();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Array.isArray(id) ? id[0] : id;
  const detailFallback = recipeId ? (`/recipe/${recipeId}` as const) : ('/' as const);
  const [recipe, setRecipe] = useState<Recipe | undefined>(() =>
    recipeId ? getSessionRecipe(recipeId) : undefined,
  );
  const [isLoading, setIsLoading] = useState(!recipe);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(undefined);
      setIsLoading(false);
      return;
    }

    const sessionRecipe = getSessionRecipe(recipeId);
    if (sessionRecipe) {
      setRecipe(sessionRecipe);
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
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [recipeId]);

  const steps = recipe?.steps ?? [];
  const total = steps.length;
  const progress = useMemo(() => (total === 0 ? 0 : (stepIndex + 1) / total), [stepIndex, total]);
  const isLast = stepIndex >= total - 1;

  const exitCook = () => smartBack(detailFallback);

  // Swipe gesture configuration
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 35 && Math.abs(gestureState.dy) < 30;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 50) {
            setStepIndex((current) => Math.max(0, current - 1));
          } else if (gestureState.dx < -50) {
            setStepIndex((current) => Math.min(total - 1, current + 1));
          }
        },
      }),
    [total]
  );

  const nextStepText = useMemo(() => {
    if (stepIndex < total - 1) {
      return steps[stepIndex + 1];
    }
    return null;
  }, [stepIndex, steps, total]);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <ScreenContainer withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
          <View style={styles.topPad} />
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.tint} size="large" />
            <ThemedText type="small" style={styles.loadingText}>Preparing cooking mode...</ThemedText>
          </View>
        </ScreenContainer>
        <GlassBackButton onPress={exitCook} />
      </View>
    );
  }

  if (!recipe || total === 0) {
    return (
      <View style={styles.root}>
        <ScreenContainer withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
          <View style={styles.topPad} />
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color={SnapChef.primary} style={{ marginBottom: 12 }} />
            <ThemedText type="subtitle" style={{ textAlign: 'center' }}>No steps available</ThemedText>
            <View style={{ marginTop: 24 }}>
              <GlassPill label="Back to recipe" variant="primary" onPress={exitCook} />
            </View>
          </View>
        </ScreenContainer>
        <GlassBackButton onPress={exitCook} />
      </View>
    );
  }

  // Pre-formatting step numbers (e.g. 01, 02)
  const displayStepNum = String(stepIndex + 1).padStart(2, '0');
  const displayTotalNum = String(total).padStart(2, '0');

  return (
    <View style={styles.root}>
      <ScreenContainer withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
        <View style={styles.topPad} />

        <View style={styles.topMeta}>
          <Text style={styles.recipeTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Step {displayStepNum} of {displayTotalNum}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
            <LinearGradient
              colors={['#8966FA', '#C9B8FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.gestureHint}>
          <Ionicons name="swap-horizontal" size={14} color={SnapChef.muted} />
          <Text style={styles.gestureHintText}>Swipe left or right to switch steps</Text>
        </View>

        <Animated.View
          key={stepIndex}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(160)}
          style={styles.stepCardWrap}
          {...panResponder.panHandlers}
        >
          <GlassCard tint="white" style={[styles.stepCard, isTablet && styles.stepCardWide]}>
            <View style={styles.cardHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepCircleText}>{stepIndex + 1}</Text>
              </View>
              <Ionicons name="restaurant-outline" size={20} color={SnapChef.primary} />
            </View>

            <View style={styles.stepBody}>
              <Text style={[styles.stepText, isTablet && styles.stepTextWide]}>
                {steps[stepIndex]}
              </Text>
            </View>

            {nextStepText && (
              <View style={styles.nextTeaser}>
                <Text style={styles.nextTeaserTitle}>UP NEXT</Text>
                <Text style={styles.nextTeaserText} numberOfLines={2}>
                  {nextStepText}
                </Text>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        <View style={[styles.navRow, isTablet && styles.navRowWide]}>
          <CookNavButton
            label="Previous"
            variant="outline"
            disabled={stepIndex === 0}
            icon="chevron-back"
            onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
          />

          {isLast ? (
            <CookNavButton
              label="Done"
              variant="primary"
              icon="checkmark"
              onPress={exitCook}
            />
          ) : (
            <CookNavButton
              label="Next"
              variant="primary"
              icon="chevron-forward"
              onPress={() => setStepIndex((current) => Math.min(total - 1, current + 1))}
            />
          )}
        </View>
      </ScreenContainer>
      <GlassBackButton onPress={exitCook} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topPad: { height: 56 },
  loadingRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 16,
    color: SnapChef.muted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  topMeta: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SnapChef.muted,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stepBadge: {
    backgroundColor: '#EDE7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: SnapChef.primary,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  gestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    opacity: 0.8,
  },
  gestureHintText: {
    fontSize: 11,
    color: SnapChef.muted,
  },
  stepCardWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  stepCard: {
    padding: 24,
    borderRadius: 28,
    minHeight: 280,
    justifyContent: 'space-between',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  stepCardWide: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
    minHeight: 340,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8966FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  stepBody: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
  },
  stepText: {
    fontSize: 20,
    lineHeight: 30,
    color: SnapChef.ink,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepTextWide: {
    fontSize: 24,
    lineHeight: 38,
  },
  nextTeaser: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F1F6',
    paddingTop: 14,
  },
  nextTeaserTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: SnapChef.primary,
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  nextTeaserText: {
    fontSize: 13,
    color: SnapChef.muted,
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  navRowWide: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  navBtnWrapper: {
    flex: 1,
    minHeight: 52,
  },
  navBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  navBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  navBtnShadow: {
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
});
