import { type ReactNode } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'expo-status-bar';

import { BRAND_NAME } from '../constants';

type AuthScreenShellProps = {
  children: ReactNode;
  showBackButton?: boolean;
  compact?: boolean;
};

export function AuthScreenShell({ children, showBackButton, compact }: AuthScreenShellProps) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isCompact = compact || height < 700;

  // Check if we should render back button
  const canGoBack = showBackButton !== undefined ? showBackButton : router.canGoBack();

  // Dynamic logo container & icon sizes
  const logoContainerSize = isCompact ? 56 : 72;
  const logoIconSize = isCompact ? 28 : 36;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Premium Header with Soft Lavender/Purple Gradient */}
      <LinearGradient
        colors={['#E8E4EF', '#D8CFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        
        {/* Floating circular back button */}
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
            activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#0A0116" />
          </TouchableOpacity>
        ) : null}

        {/* Central Logo & Brand Typography */}
        <View style={styles.brandingContainer}>
          <View
            style={[
              styles.logoBadge,
              {
                width: logoContainerSize,
                height: logoContainerSize,
                borderRadius: logoContainerSize * 0.35,
              },
            ]}>
            <MaterialCommunityIcons name="chef-hat" size={logoIconSize} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, isCompact && styles.brandTitleCompact]}>
            {BRAND_NAME}
          </Text>
          <Text style={[styles.brandSubtitle, isCompact && styles.brandSubtitleCompact]}>
            AI-Powered Culinary Assistant
          </Text>
        </View>
      </LinearGradient>

      {/* Main Form Sheet */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
          <View style={styles.sheetBackground} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F0ECFA', // Matches bottom area behind card on tablet/iOS edges
  },
  flex: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: '28%', // Percentage-based height for proportional scaling
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: '25%', // Keep it vertically aligned relatively
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
  },
  logoBadge: {
    backgroundColor: '#8966FA',
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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#8966FA',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginTop: -28,
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
    shadowOffset: { width: 0, height: 8 },
  },
  sheetBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
});
