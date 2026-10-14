import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Fonts, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type SettingsRowProps = {
  label: string;
  /** Secondary line under the label (alias kept for existing callers). */
  value?: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  /** Hide the bottom rule (use on the last row inside a card). */
  showDivider?: boolean;
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  /** When set, renders a Switch instead of a chevron. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  rightElement?: ReactNode;
};

export function SettingsRow({
  label,
  value,
  subtitle,
  onPress,
  destructive = false,
  showChevron = true,
  showDivider = true,
  icon,
  iconColor = SnapChef.primary,
  iconBg = 'rgba(137, 102, 250, 0.12)',
  switchValue,
  onSwitchChange,
  rightElement,
}: SettingsRowProps) {
  const theme = useTheme();
  const detail = subtitle ?? value;
  const hasSwitch = typeof switchValue === 'boolean' && typeof onSwitchChange === 'function';
  const interactive = Boolean(onPress) && !hasSwitch;
  const showTrailingChevron = !hasSwitch && !rightElement && interactive && showChevron;

  const row = (
    <View
      style={[
        styles.row,
        showDivider
          ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }
          : null,
      ]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}

      <View style={styles.copy}>
        <Text
          style={[
            styles.label,
            { color: destructive ? '#c62828' : theme.text, fontFamily: Fonts.bodyBold },
          ]}
          numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text
            style={[styles.detail, { color: theme.textSecondary, fontFamily: Fonts.body }]}
            numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>

      {rightElement ? <View style={styles.trailing}>{rightElement}</View> : null}

      {hasSwitch ? (
        <View style={styles.trailing}>
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: theme.border, true: 'rgba(137, 102, 250, 0.45)' }}
            thumbColor={switchValue ? SnapChef.primary : '#f4f3f4'}
            ios_backgroundColor={theme.border}
          />
        </View>
      ) : null}

      {showTrailingChevron ? (
        <View style={styles.trailing}>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
      ) : null}
    </View>
  );

  if (interactive) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}>
        {row}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{row}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.72,
  },
  row: {
    width: '100%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  trailing: {
    flexShrink: 0,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
