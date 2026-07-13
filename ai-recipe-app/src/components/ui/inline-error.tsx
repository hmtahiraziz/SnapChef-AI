import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InlineErrorProps = {
  message: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  showOpenSettings?: boolean;
};

/**
 * Shared inline error: message + optional Retry/Retake + Open Settings.
 */
export function InlineError({
  message,
  primaryActionLabel,
  onPrimaryAction,
  showOpenSettings = false,
}: InlineErrorProps) {
  const theme = useTheme();

  return (
    <View style={styles.block}>
      <ThemedText type="small" style={styles.message}>
        {message}
      </ThemedText>
      {showOpenSettings ? (
        <Pressable onPress={() => void Linking.openSettings()} hitSlop={8}>
          <ThemedText type="smallBold" style={{ color: theme.tint }}>
            Open Settings
          </ThemedText>
        </Pressable>
      ) : null}
      {primaryActionLabel && onPrimaryAction ? (
        <Pressable onPress={onPrimaryAction} hitSlop={8}>
          <ThemedText type="smallBold" style={{ color: theme.tint }}>
            {primaryActionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.one,
  },
  message: {
    color: '#c62828',
  },
});
