import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Fonts, Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileHeaderProps = {
  displayName: string;
  email: string;
  imageUrl?: string | null;
  greeting?: string;
};

export function ProfileHeader({
  displayName,
  email,
  imageUrl,
  greeting = 'Hello',
}: ProfileHeaderProps) {
  const theme = useTheme();
  const { isDark } = theme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? theme.backgroundElement : SnapChef.white,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : SnapChef.fieldBorder,
          shadowColor: isDark ? '#000' : SnapChef.primary,
        },
      ]}>
      <View style={styles.row}>
        <View
          style={[
            styles.avatarWrap,
            { backgroundColor: isDark ? theme.field : '#F3EEFF' },
          ]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={28} color={theme.textSecondary} />
          )}
        </View>

        <View style={styles.copy}>
          <Text style={[styles.greeting, { color: theme.textSecondary, fontFamily: Fonts.bodyMedium }]}>
            {greeting.toUpperCase()}
          </Text>
          <Text
            style={[styles.name, { color: theme.text, fontFamily: Fonts.bodyBold }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {displayName}
          </Text>
          <Text
            style={[styles.email, { color: theme.textSecondary, fontFamily: Fonts.body }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {email}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: Spacing.three,
    flexShrink: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  email: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
