import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
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

  const canGoBack = showBackButton !== undefined ? showBackButton : router.canGoBack();
  const logoSize = isCompact ? 56 : 72;

  // Clear the system nav when keyboard is closed; keep it tight when open.
  const navClearance =
    Platform.OS === 'android' ? Math.max(insets.bottom, 20) : Math.max(insets.bottom, 12);
  const contentBottomPad = keyboardOpen ? 16 : navClearance + 12;

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
    // Match status-bar / system chrome to the header gradient while on auth.
    void SystemUI.setBackgroundColorAsync(HEADER_GRADIENT[0]).catch(() => {});
    return () => {
      void SystemUI.setBackgroundColorAsync('#FFFFFF').catch(() => {});
    };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Gradient extends under the status bar (paddingTop = inset, not SafeArea clip). */}
      <LinearGradient
        colors={[...HEADER_GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerBand, { paddingTop: insets.top }]}
      >
        <View style={[styles.headerContent, isCompact && styles.headerContentCompact]}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
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
            <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact]}>
              {BRAND_NAME}
            </Text>
            <Text style={[styles.brandSubtitle, isCompact && styles.brandSubtitleCompact]}>
              AI-Powered Culinary Assistant
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPad }]}
        >
          {children}
        </ScrollView>
      </View>

      {/* Opaque fill under system nav — hide while keyboard is open to avoid a huge gap. */}
      {!keyboardOpen ? (
        <View pointerEvents="none" style={[styles.navFill, { height: navClearance }]} />
      ) : null}
    </View>
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
