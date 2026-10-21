import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

export function ShoppingEmptyState() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? theme.backgroundElement : '#F5F1FF',
        },
      ]}>
      <Text style={styles.emoji}>🛒</Text>
      <Text style={[styles.title, { color: theme.text }]}>Your list is empty</Text>
      <Text style={[styles.desc, { color: theme.textSecondary }]}>
        Add items above, or open a recipe and tap &quot;Add Missing&quot; to fill your list.
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel="Browse recipes">
        <Ionicons name="sparkles" size={14} color="#fff" />
        <Text style={styles.btnText}>Browse recipes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: SLSpacing.sm,
    paddingVertical: SLSpacing.xl,
    paddingHorizontal: SLSpacing.lg,
    borderRadius: SLRadii.xl,
  },
  emoji: { fontSize: 44 },
  title: { fontSize: 18, fontWeight: '800' },
  desc: { fontSize: 13, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SLColors.primary,
    paddingHorizontal: 20,
    minHeight: TOUCH_MIN,
    borderRadius: SLRadii.pill,
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
