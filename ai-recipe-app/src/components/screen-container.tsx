import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type ViewProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';

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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!gradient) return;
    // Keep Android status / system chrome aligned with the screen gradient.
    void SystemUI.setBackgroundColorAsync(theme.gradientStart).catch(() => {});
  }, [gradient, theme.gradientStart]);

  // Drop the floating-tab reserve while typing — avoids a huge empty band above the keyboard.
  const bottomPad = keyboardOpen
    ? Spacing.three
    : withTabInset
      ? BottomTabInset + Spacing.four
      : undefined;

  const content = (
    <ThemedView
      style={[
        styles.content,
        { paddingHorizontal: horizontalPad, maxWidth: width >= 1100 ? 920 : MaxContentWidth },
        gradient && styles.transparent,
        style,
      ]}
      type={gradient ? undefined : 'background'}
      {...rest}
    >
      {children}
    </ThemedView>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, bottomPad != null && { paddingBottom: bottomPad }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {content}
    </ScrollView>
  ) : (
    <ThemedView
      style={[
        styles.staticContent,
        gradient && styles.transparent,
        bottomPad != null && { paddingBottom: bottomPad },
      ]}
      type={gradient ? undefined : 'background'}
    >
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
