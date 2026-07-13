import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  withTabInset?: boolean;
  gradient?: boolean;
  /** When a stack header is visible, skip top safe-area. */
  edges?: Edge[];
};

export function ScreenContainer({
  children,
  scroll = false,
  withTabInset = true,
  gradient = false,
  edges,
  style,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPad = width >= 768 ? Spacing.five : Spacing.four;
  const resolvedEdges: Edge[] = edges ?? ['top', 'right', 'bottom', 'left'];

  const content = (
    <ThemedView
      style={[
        styles.content,
        { paddingHorizontal: horizontalPad, maxWidth: width >= 1100 ? 920 : MaxContentWidth },
        gradient && styles.transparent,
        style,
      ]}
      type={gradient ? undefined : 'background'}
      {...rest}>
      {children}
    </ThemedView>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        withTabInset && { paddingBottom: BottomTabInset + Spacing.four },
      ]}
      keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  ) : (
    <ThemedView
      style={[
        styles.staticContent,
        gradient && styles.transparent,
        withTabInset && { paddingBottom: BottomTabInset + Spacing.four },
      ]}
      type={gradient ? undefined : 'background'}>
      {content}
    </ThemedView>
  );

  if (gradient) {
    return (
      <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.safeArea}>
        <SafeAreaView style={styles.flex} edges={resolvedEdges}>
          {body}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={resolvedEdges}>
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  staticContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
});
