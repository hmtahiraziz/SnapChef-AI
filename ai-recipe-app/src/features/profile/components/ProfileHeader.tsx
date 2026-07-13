import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileHeaderProps = {
  displayName: string;
  email: string;
  imageUrl?: string | null;
  greeting?: string;
  onPressAvatar?: () => void;
  uploading?: boolean;
};

export function ProfileHeader({
  displayName,
  email,
  imageUrl,
  greeting = 'Hello',
  onPressAvatar,
  uploading = false,
}: ProfileHeaderProps) {
  const theme = useTheme();
  const isDark = theme.text === '#F5F2FF';

  const colors = isDark
    ? (['rgba(42,36,56,0.9)', 'rgba(28,24,38,0.92)'] as const)
    : (['rgba(216,207,255,0.9)', 'rgba(255,255,255,0.92)'] as const);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={onPressAvatar}
          disabled={!onPressAvatar || uploading}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: isDark ? theme.background : 'rgba(255,255,255,0.85)' }]}>
              <Ionicons name="person" size={28} color={theme.textSecondary} />
            </View>
          )}
          <View style={[styles.cameraBadge, { borderColor: isDark ? theme.backgroundElement : '#fff' }]}>
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={12} color="#fff" />
            )}
          </View>
        </Pressable>
        <View style={styles.copy}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting}</Text>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1.5,
    padding: Spacing.four,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  copy: { flex: 1, gap: 2 },
  greeting: { fontSize: 13, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 13 },
});
