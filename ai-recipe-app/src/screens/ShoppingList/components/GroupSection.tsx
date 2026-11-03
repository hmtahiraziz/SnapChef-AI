import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { SLColors, SLRadii, SLSpacing, TOUCH_MIN } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  title: string;
  emoji?: string;
  color?: string;
  count: number;
  collapsed: boolean;
  allChecked?: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function GroupSection({
  title,
  emoji,
  color = SLColors.primary,
  count,
  collapsed,
  allChecked,
  onToggle,
  children,
}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle();
        }}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
        accessibilityLabel={`${title}, ${count} items`}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text
          style={[styles.title, { color: theme.text }, allChecked && styles.titleDone]}
          numberOfLines={2}>
          {title}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.isDark
                ? theme.backgroundSelected
                : 'rgba(137, 102, 250, 0.12)',
            },
          ]}>
          <Text style={[styles.badgeText, { color: theme.tint }]}>{count}</Text>
          <Ionicons
            name={collapsed ? 'chevron-forward' : 'chevron-down'}
            size={12}
            color={theme.tint}
          />
        </View>
      </Pressable>
      {!collapsed ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: SLSpacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SLSpacing.sm,
    minHeight: TOUCH_MIN,
    paddingVertical: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  emoji: { fontSize: 14 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', minWidth: 0 },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.55 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: SLRadii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
  body: { gap: SLSpacing.sm },
});
