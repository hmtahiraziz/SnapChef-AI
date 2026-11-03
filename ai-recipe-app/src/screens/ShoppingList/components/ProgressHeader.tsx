import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

type Props = {
  checkedCount: number;
  totalCount: number;
  progress: number;
  showSearch: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onToggleSearch: () => void;
  onCopy: () => void;
  onShare: () => void;
};

export function ProgressHeader({
  checkedCount,
  totalCount,
  progress,
  showSearch,
  search,
  onSearchChange,
  onToggleSearch,
  onCopy,
  onShare,
}: Props) {
  const theme = useTheme();
  const progressSv = useSharedValue(0);
  const trackW = useSharedValue(0);

  useEffect(() => {
    progressSv.value = withTiming(Math.min(1, Math.max(0, progress)), { duration: 320 });
  }, [progress, progressSv]);

  const fillStyle = useAnimatedStyle(() => ({
    width: trackW.value * progressSv.value,
  }));

  const iconBg = theme.isDark ? theme.backgroundElement : '#FFFFFF';
  const iconBorder = theme.isDark ? theme.border : '#E8E4EF';

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            Shopping list
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {totalCount > 0
              ? `${checkedCount} of ${totalCount} done`
              : 'Add items from recipes or type below.'}
          </Text>
        </View>

        <View style={styles.actions}>
          <HeaderIcon
            name={showSearch ? 'close' : 'search'}
            label={showSearch ? 'Close search' : 'Search list'}
            onPress={onToggleSearch}
            bg={showSearch ? '#ECE6FD' : iconBg}
            border={showSearch ? 'rgba(137,102,250,0.35)' : iconBorder}
            color={showSearch ? SLColors.primary : theme.textSecondary}
          />
          {totalCount > 0 ? (
            <>
              <HeaderIcon
                name="copy-outline"
                label="Copy list"
                onPress={onCopy}
                bg={iconBg}
                border={iconBorder}
                color={theme.textSecondary}
              />
              <HeaderIcon
                name="share-outline"
                label="Share list"
                onPress={onShare}
                bg={iconBg}
                border={iconBorder}
                color={theme.textSecondary}
              />
            </>
          ) : null}
        </View>
      </View>

      {totalCount > 0 ? (
        <View
          style={[
            styles.track,
            {
              backgroundColor: theme.isDark
                ? theme.backgroundSelected
                : SLColors.progressTrack,
            },
          ]}
          onLayout={(e) => {
            trackW.value = e.nativeEvent.layout.width;
          }}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: totalCount, now: checkedCount }}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      ) : null}

      {showSearch ? (
        <View
          style={[
            styles.searchRow,
            {
              backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
              borderColor: theme.isDark ? theme.border : '#E8E4EF',
            },
          ]}>
          <Ionicons name="search" size={16} color={SLColors.primary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search items..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={onSearchChange}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function HeaderIcon({
  name,
  label,
  onPress,
  bg,
  border,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  bg: string;
  border: string;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconBtn, { backgroundColor: bg, borderColor: border }]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={name} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { gap: SLSpacing.sm },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SLSpacing.sm,
  },
  titleBlock: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, flexShrink: 0, paddingTop: 2 },
  iconBtn: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: TOUCH_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  track: {
    height: 8,
    borderRadius: SLRadii.pill,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    borderRadius: SLRadii.pill,
    backgroundColor: SLColors.progressFill,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SLSpacing.sm,
    borderRadius: SLRadii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SLSpacing.md,
    minHeight: TOUCH_MIN,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 0 },
});
