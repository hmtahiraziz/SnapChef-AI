import { HeaderHeightContext } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import {
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";

import { ThemedView } from "@/components/themed-view";
import {
  FrostedHeaderBackground,
  HEADER_BOTTOM_RADIUS,
} from "@/components/ui/frosted-header-background";
import {
  BottomTabInset,
  getFloatingTabContentInset,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  /** Fixed frosted header over scroll content (content scrolls underneath and blurs). */
  header?: ReactNode;
  scroll?: boolean;
  withTabInset?: boolean;
  gradient?: boolean;
  /** When a stack header is visible, skip top safe-area. */
  edges?: Edge[];
};

export function ScreenContainer({
  children,
  header,
  scroll = false,
  withTabInset = true,
  gradient = false,
  edges,
  style,
  ...rest
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPad = width >= 768 ? Spacing.five : Spacing.four;
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  /** Seed so first paint clears the bar; onLayout refines to the real height. */
  const [headerHeight, setHeaderHeight] = useState(() =>
    header ? insets.top + 108 : 0
  );
  const navHeaderHeight = useContext(HeaderHeightContext) ?? 0;

  /**
   * Tab screens: do not also pad SafeArea bottom — tab inset already clears
   * the floating bar + home indicator. Stack screens keep full edges unless overridden.
   */
  const resolvedEdges: Edge[] = useMemo(() => {
    if (edges) return edges;
    if (withTabInset) return ["top", "left", "right"];
    return ["top", "right", "bottom", "left"];
  }, [edges, withTabInset]);

  /** Frosted header draws into the status-bar area; exclude top safe-area from the shell. */
  const safeEdges: Edge[] = useMemo(() => {
    if (!header) return resolvedEdges;
    return resolvedEdges.filter((edge) => edge !== "top") as Edge[];
  }, [header, resolvedEdges]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!gradient) return;
    void SystemUI.setBackgroundColorAsync(theme.gradientStart).catch(() => {});
  }, [gradient, theme.gradientStart]);

  const tabInset = getFloatingTabContentInset(insets.bottom) || BottomTabInset;

  const bottomPad = keyboardOpen
    ? Spacing.three
    : withTabInset
    ? tabInset
    : Spacing.five;

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    setHeaderHeight((prev) => (prev === next ? prev : next));
  };

  /**
   * Custom overlay header: measured height.
   * Transparent stack header: clear the frosted bar (fallback when HeaderHeightContext is 0).
   */
  const stackHeaderFallback = insets.top + 56;
  const contentTopInset = header
    ? headerHeight
    : !resolvedEdges.includes("top")
    ? Math.max(navHeaderHeight, stackHeaderFallback)
    : 0;

  const headerNode = header ? (
    <View
      style={[styles.headerOverlay, { paddingHorizontal: horizontalPad }]}
      onLayout={onHeaderLayout}
      pointerEvents="box-none"
    >
      <FrostedHeaderBackground intensity={90} />
      <View
        style={[styles.headerInner, { paddingTop: insets.top + Spacing.three }]}
      >
        {header}
      </View>
    </View>
  ) : null;

  const content = (
    <ThemedView
      style={[
        scroll ? styles.contentScroll : styles.contentFill,
        {
          paddingHorizontal: horizontalPad,
          maxWidth: width >= 1100 ? 920 : MaxContentWidth,
        },
        gradient && styles.transparent,
        header ? styles.contentWithHeader : null,
        style,
      ]}
      type={gradient ? undefined : "background"}
      {...rest}
    >
      {children}
    </ThemedView>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        contentTopInset > 0 && { paddingTop: contentTopInset },
        bottomPad != null && { paddingBottom: bottomPad },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {content}
    </ScrollView>
  ) : (
    <ThemedView
      style={[
        styles.staticContent,
        gradient && styles.transparent,
        contentTopInset > 0 && { paddingTop: contentTopInset },
        bottomPad != null && { paddingBottom: bottomPad },
      ]}
      type={gradient ? undefined : "background"}
    >
      {content}
    </ThemedView>
  );

  const shell = (
    <View style={styles.flex}>
      {body}
      {headerNode}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        style={styles.safeArea}
      >
        <SafeAreaView style={styles.flex} edges={safeEdges}>
          {shell}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={safeEdges}
    >
      {shell}
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
    backgroundColor: "transparent",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    overflow: "hidden",
    borderBottomLeftRadius: HEADER_BOTTOM_RADIUS,
    borderBottomRightRadius: HEADER_BOTTOM_RADIUS,
  },
  headerInner: {
    paddingBottom: Spacing.two,
  },
  scrollView: {
    flex: 1,
  },
  staticContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  /** Do NOT use flex:1 inside ScrollView — it breaks natural height / clips. */
  contentScroll: {
    width: "100%",
    alignSelf: "center",
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  contentFill: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  contentWithHeader: {
    paddingTop: Spacing.two,
  },
});
