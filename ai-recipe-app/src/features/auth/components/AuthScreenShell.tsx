import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import * as SystemUI from 'expo-system-ui';

import { BRAND_NAME } from '../constants';

const HEADER_GRADIENT = ['#E8E4EF', '#D8CFFF'] as const;

type AuthKeyboardScrollApi = {
  /** Scroll a focused field so it sits above the keyboard. */
  ensureVisible: (targetRef: RefObject<View | null>) => void;
};

const AuthKeyboardScrollContext = createContext<AuthKeyboardScrollApi | null>(null);

export function useAuthKeyboardScroll() {
  return useContext(AuthKeyboardScrollContext);
}

type AuthScreenShellProps = {
  children: ReactNode;
  showBackButton?: boolean;
  compact?: boolean;
};

export function AuthScreenShell({ children, showBackButton, compact }: AuthScreenShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isCompact = compact || height < 700;
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(0);
  const keyboardHeightRef = useRef(0);

  const canGoBack = showBackButton !== undefined ? showBackButton : router.canGoBack();
  // Shrink branding while typing so signup password stays in the usable area.
  const logoSize = keyboardOpen ? 40 : isCompact ? 56 : 72;

  const navClearance =
    Platform.OS === 'android' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom, 12);
  // Enough bottom space to scroll password + CTA fully above the keyboard.
  const keyboardScrollPad = keyboardOpen
    ? Math.max(keyboardHeight, 160) + 48
    : 0;
  const contentBottomPad = (keyboardOpen ? 24 : navClearance + 12) + keyboardScrollPad;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      const nextHeight = event.endCoordinates?.height ?? 0;
      keyboardHeightRef.current = nextHeight;
      setKeyboardOpen(true);
      setKeyboardHeight(nextHeight);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(HEADER_GRADIENT[0]).catch(() => {});
    return () => {
      void SystemUI.setBackgroundColorAsync('#FFFFFF').catch(() => {});
    };
  }, []);

  const ensureVisible = useCallback((targetRef: RefObject<View | null>) => {
    const run = () => {
      const node = targetRef.current;
      if (!node || !scrollRef.current) return;

      node.measureInWindow((_x, y, _w, h) => {
        const winH = Dimensions.get('window').height;
        const kb = keyboardHeightRef.current;
        // If height isn't known yet, assume a typical keyboard so we still nudge up.
        const effectiveKb = kb > 0 ? kb : Platform.OS === 'ios' ? 300 : 280;
        const keyboardTop = winH - effectiveKb;
        const fieldBottom = y + h;
        const clearance = 28;

        if (fieldBottom > keyboardTop - clearance) {
          const delta = fieldBottom - (keyboardTop - clearance);
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetY.current + delta),
            animated: true,
          });
        }
      });
    };

    // Wait for keyboard animation / Android layout pass before measuring.
    requestAnimationFrame(() => {
      setTimeout(run, Platform.OS === 'ios' ? 60 : 180);
    });
  }, []);

  return (
    <AuthKeyboardScrollContext.Provider value={{ ensureVisible }}>
      <View style={styles.root}>
        <StatusBar style="dark" />

        <LinearGradient
          colors={[...HEADER_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBand, { paddingTop: insets.top }]}
        >
          <View
            style={[
              styles.headerContent,
              isCompact && styles.headerContentCompact,
              keyboardOpen && styles.headerContentKeyboard,
            ]}
          >
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={[styles.backButton, keyboardOpen && styles.backButtonKeyboard]}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={22} color="#0A0116" />
              </TouchableOpacity>
            ) : null}

            <View style={styles.brandingContainer}>
              <View
                style={[
                  styles.logoBadge,
                  {
                    width: logoSize,
                    height: logoSize,
                    borderRadius: logoSize * 0.28,
                    marginBottom: keyboardOpen ? 4 : 8,
                  },
                ]}
              >
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={{
                    width: logoSize,
                    height: logoSize,
                    borderRadius: logoSize * 0.28,
                  }}
                  contentFit="cover"
                  accessibilityLabel={BRAND_NAME}
                />
              </View>
              <Text
                style={[
                  styles.brandTitle,
                  isCompact && styles.brandTitleCompact,
                  keyboardOpen && styles.brandTitleKeyboard,
                ]}
              >
                {BRAND_NAME}
              </Text>
              {!keyboardOpen ? (
                <Text style={[styles.brandSubtitle, isCompact && styles.brandSubtitleCompact]}>
                  AI-Powered Culinary Assistant
                </Text>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={styles.sheetAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets={false}
              nestedScrollEnabled
              showsVerticalScrollIndicator={keyboardOpen}
              showsHorizontalScrollIndicator={false}
              bounces={keyboardOpen}
              alwaysBounceVertical={keyboardOpen}
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPad }]}
              onScroll={(event) => {
                scrollOffsetY.current = event.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {!keyboardOpen ? (
          <View pointerEvents="none" style={[styles.navFill, { height: navClearance }]} />
        ) : null}
      </View>
    </AuthKeyboardScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBand: {
    width: '100%',
    overflow: 'hidden',
  },
  headerContent: {
    minHeight: 168,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerContentCompact: {
    minHeight: 140,
    paddingBottom: 36,
  },
  headerContentKeyboard: {
    minHeight: 72,
    paddingBottom: 28,
    paddingTop: 4,
  },
  navFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
    elevation: 50,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  backButtonKeyboard: {
    top: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  logoBadge: {
    overflow: 'hidden',
    backgroundColor: '#1E1633',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0A0116',
    letterSpacing: 0.5,
  },
  brandTitleCompact: {
    fontSize: 18,
  },
  brandTitleKeyboard: {
    fontSize: 16,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6575',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  brandSubtitleCompact: {
    fontSize: 10,
    marginTop: 1,
  },
  sheetAvoider: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    width: '100%',
    marginTop: -28,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  sheetTablet: {
    maxWidth: 480,
    alignSelf: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    marginBottom: 24,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
  },
});
