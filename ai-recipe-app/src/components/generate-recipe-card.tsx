import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#8966FA';
const SECONDARY = '#FFE100';
const INK = '#0A0116';
const MUTED = '#6B6575';

type GenerateRecipeCardProps = {
  ingredientCount: number;
  country: string;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Premium Generate Recipe CTA — gradient surface, clear status, strong primary action.
 */
export function GenerateRecipeCard({
  ingredientCount,
  country,
  disabled = false,
  onPress,
}: GenerateRecipeCardProps) {
  const ready = !disabled && ingredientCount > 0;

  return (
    <View style={[styles.shadow, !ready && styles.shadowMuted]}>
      <LinearGradient
        colors={ready ? [PRIMARY, '#6B4FE0'] : ['#E8E4EF', '#D8D2E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.glow} pointerEvents="none" />

        <View style={styles.topRow}>
          <View style={[styles.iconChip, ready ? styles.iconChipReady : styles.iconChipIdle]}>
            <Ionicons name="sparkles" size={18} color={ready ? PRIMARY : MUTED} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, !ready && styles.titleIdle]}>Generate Recipe</Text>
            <Text style={[styles.subtitle, !ready && styles.subtitleIdle]}>
              {ready
                ? `${ingredientCount} ingredient${ingredientCount === 1 ? '' : 's'} · ${country}`
                : 'Add at least one ingredient to continue'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          disabled={!ready}
          accessibilityRole="button"
          accessibilityLabel="Generate Recipe"
          style={({ pressed }) => [
            styles.cta,
            ready ? styles.ctaReady : styles.ctaIdle,
            pressed && ready && styles.ctaPressed,
          ]}>
          <Text style={[styles.ctaText, !ready && styles.ctaTextIdle]}>
            {ready ? 'Cook with AI' : 'Waiting for ingredients'}
          </Text>
          <View style={[styles.ctaArrow, ready ? styles.ctaArrowReady : styles.ctaArrowIdle]}>
            <Ionicons name="arrow-forward" size={16} color={ready ? PRIMARY : MUTED} />
          </View>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  shadowMuted: {
    shadowOpacity: 0.08,
    elevation: 2,
  },
  card: {
    borderRadius: 28,
    padding: 18,
    gap: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SECONDARY,
    opacity: 0.18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipReady: {
    backgroundColor: '#fff',
  },
  iconChipIdle: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  copy: { flex: 1, gap: 2 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  titleIdle: {
    color: INK,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  subtitleIdle: {
    color: MUTED,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderRadius: 999,
    paddingLeft: 20,
    paddingRight: 8,
  },
  ctaReady: {
    backgroundColor: '#fff',
  },
  ctaIdle: {
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  ctaTextIdle: {
    color: MUTED,
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrowReady: {
    backgroundColor: SECONDARY,
  },
  ctaArrowIdle: {
    backgroundColor: 'rgba(10,1,22,0.06)',
  },
});
