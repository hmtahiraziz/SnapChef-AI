import { Image } from 'expo-image';
import {
  Pressable,
  StyleSheet,
  View,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { InlineError } from '@/components/ui/inline-error';
import { Fonts, Radii, SnapChef, Spacing } from '@/constants/theme';
import { IngredientReviewSheet } from './IngredientReviewSheet';
import { ScanAnalyzingOverlay } from './ScanAnalyzingOverlay';
import { useIngredientCapture } from '../hooks/useIngredientCapture';
import { useTheme } from '@/hooks/use-theme';
import { hasApiBaseUrl } from '@/constants/env';

type IngredientCaptureProps = {
  onIngredientsExtracted: (ingredients: string[], imageUri?: string) => void;
  initialAction?: 'camera' | 'gallery' | null;
  onClose: () => void;
};

export function IngredientCapture({
  onIngredientsExtracted,
  initialAction = null,
  onClose,
}: IngredientCaptureProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, fontScale } = useWindowDimensions();
  // Stack the buttons on very narrow screens or when the system font size is large
  const stackButtons = windowWidth < 340 || fontScale > 1.3;
  const {
    phase,
    previewUri,
    extracted,
    error,
    permissionKind,
    isExtracting,
    isReviewing,
    setError,
    retake,
    snapPhoto,
    pickPhoto,
    scanPendingPhoto,
    cancelScan,
    toggleExtracted,
    renameExtracted,
    removeExtracted,
    confirmExtracted,
    cancelReview,
  } = useIngredientCapture();

  const aiReady = hasApiBaseUrl();
  const busy = isExtracting;

  const runPick = useCallback(
    async (action: () => Promise<void>) => {
      try {
        setError(null);
        await action();
      } catch (captureError) {
        const message =
          captureError instanceof Error
            ? captureError.message
            : 'Something went wrong while opening the photo capture.';
        setError(message);
      }
    },
    [setError],
  );

  // Wire initial action trigger (from navbar choice dialog)
  const isInitialTriggered = useRef(false);
  useEffect(() => {
    if (isInitialTriggered.current) return;
    if (initialAction === 'camera') {
      isInitialTriggered.current = true;
      void runPick(snapPhoto);
    } else if (initialAction === 'gallery') {
      isInitialTriggered.current = true;
      void runPick(pickPhoto);
    }
  }, [initialAction, snapPhoto, pickPhoto, runPick]);

  const handleConfirmReview = () => {
    const selected = confirmExtracted();
    if (selected.length > 0) {
      onIngredientsExtracted(selected, previewUri || undefined);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (isExtracting) {
      cancelScan();
      return;
    }
    if (phase === 'preview') {
      retake();
    } else if (phase === 'review') {
      cancelReview();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={false}
      onRequestClose={handleBack}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background },
        ]}
      >
        {/* Header Block */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={handleBack} style={styles.backBtn} accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={SnapChef.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>

          {/* Logo + Title */}
          <View style={styles.headerCenter}>
            <View style={styles.headerLogo}>
              <MaterialCommunityIcons name="chef-hat" size={18} color="#fff" />
            </View>
            <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.display }]}>
              {phase === 'preview' ? 'Review photo' : 'Ingredient Scan'}
            </Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Content Area */}
        <View
          style={[
            styles.content,
            phase === 'preview' && styles.contentPreview,
            {
              paddingBottom: phase === 'preview' ? 0 : Spacing.three,
            },
          ]}
        >
          {/* 1. Idle Choice State */}
          {phase === 'idle' && (
            <View style={styles.idleContainer}>
              <View style={styles.idleIconWrap}>
                <Ionicons name="sparkles" size={48} color={SnapChef.primary} />
              </View>
              <Text style={[styles.idleTitle, { color: theme.text }]}>Identify Ingredients</Text>
              <Text style={[styles.idleDesc, { color: theme.textSecondary }]}>
                Take a photo of your fridge ingredients or upload an image to extract them
                automatically using AI.
              </Text>

              <View style={styles.choiceButtons}>
                <Pressable
                  disabled={!aiReady || busy}
                  onPress={() => void runPick(snapPhoto)}
                  style={({ pressed }) => [
                    styles.choiceBtn,
                    pressed && styles.choiceBtnPressed,
                    (!aiReady || busy) && styles.btnDisabled,
                  ]}
                >
                  <Ionicons name="camera" size={26} color="#fff" />
                  <Text style={styles.choiceBtnText}>Open Camera</Text>
                </Pressable>

                <Pressable
                  disabled={!aiReady || busy}
                  onPress={() => void runPick(pickPhoto)}
                  style={({ pressed }) => [
                    styles.choiceBtn,
                    styles.choiceBtnGallery,
                    pressed && styles.choiceBtnPressed,
                    (!aiReady || busy) && styles.btnDisabled,
                  ]}
                >
                  <Ionicons name="image" size={26} color="#fff" />
                  <Text style={styles.choiceBtnText}>Choose Gallery</Text>
                </Pressable>
              </View>

              {!aiReady && __DEV__ ? (
                <Text style={styles.warningText}>
                  Dev: set EXPO_PUBLIC_API_BASE_URL to enable photo scanning.
                </Text>
              ) : null}

              {error && !isExtracting ? (
                <View style={styles.errorContainer}>
                  <InlineError message={error} showOpenSettings={Boolean(permissionKind)} />
                </View>
              ) : null}
            </View>
          )}

          {/* 2. Photo Preview State */}
          {phase === 'preview' && previewUri ? (
            <View style={styles.previewContainer}>
              <View style={styles.previewStage}>
                <View
                  style={[
                    styles.previewFrame,
                    {
                      backgroundColor: theme.isDark ? '#121218' : '#F4F1FA',
                      borderColor: theme.isDark ? theme.border : 'rgba(137,102,250,0.14)',
                    },
                  ]}
                >
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.previewImage}
                    contentFit="cover"
                    transition={180}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.previewFooter,
                  {
                    backgroundColor: theme.isDark ? theme.backgroundElement : '#FFFFFF',
                    // Extra space so the buttons never touch the system navigation bar
                    paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 40 : 18) + 12,
                  },
                ]}
              >
                <View
                  style={[
                    styles.readyBadge,
                    {
                      backgroundColor: theme.isDark ? 'rgba(47, 107, 79, 0.22)' : '#E8F8EF',
                    },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={15} color="#2F6B4F" />
                  <Text style={styles.readyBadgeText}>Photo ready</Text>
                </View>

                <Text style={[styles.previewHint, { color: theme.textSecondary }]}>
                  Bright, uncluttered shots work best. Retake if anything looks blurry.
                </Text>

                {error && !isExtracting ? (
                  <View style={styles.errorContainer}>
                    <InlineError
                      message={error}
                      showOpenSettings={Boolean(permissionKind)}
                      primaryActionLabel="Try scan again"
                      onPrimaryAction={() => void scanPendingPhoto()}
                    />
                  </View>
                ) : null}

                <View style={[styles.previewActions, stackButtons && styles.previewActionsStacked]}>
                  <View style={[styles.retakeWrap, stackButtons && styles.wrapStacked]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={retake}
                      accessibilityRole="button"
                      accessibilityLabel="Retake photo"
                      style={[
                        styles.retakeBtn,
                        {
                          backgroundColor: theme.isDark ? 'rgba(137, 102, 250, 0.16)' : '#F3EEFF',
                          borderColor: theme.isDark ? 'rgba(180, 155, 255, 0.55)' : '#DCD0FF',
                        },
                      ]}
                    >
                      <Ionicons name="camera-outline" size={18} color="#8966FA" />
                      <Text style={styles.retakeBtnText} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                        Retake photo
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.analyzeWrap, stackButtons && styles.wrapStacked]}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => void scanPendingPhoto()}
                      accessibilityRole="button"
                      accessibilityLabel="Analyze and cook"
                      style={styles.analyzeBtn}
                    >
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                      <Text style={styles.analyzeBtnText} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                        Analyze & Cook
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {isExtracting ? (
          <ScanAnalyzingOverlay previewUri={previewUri} onCancel={cancelScan} />
        ) : null}

        {/* 4. Review Ingredients Dialog Sheet */}
        <IngredientReviewSheet
          visible={isReviewing}
          items={extracted}
          onToggle={toggleExtracted}
          onRename={renameExtracted}
          onRemove={removeExtracted}
          onConfirm={handleConfirmReview}
          onCancel={cancelReview}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1F6',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingRight: 12,
    minWidth: 60,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: SnapChef.primary,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  headerLogo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0116',
  },
  headerRightPlaceholder: {
    minWidth: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    justifyContent: 'center',
  },
  contentPreview: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingTop: Spacing.two,
  },
  idleContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  idleIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EDE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  idleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A0116',
    textAlign: 'center',
  },
  idleDesc: {
    fontSize: 14,
    color: '#6B6575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.three,
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  choiceBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radii.chip,
    backgroundColor: SnapChef.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  choiceBtnGallery: {
    backgroundColor: '#34D399',
  },
  choiceBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  choiceBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  warningText: {
    fontSize: 12,
    color: SnapChef.muted,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  previewContainer: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  previewStage: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  previewFrame: {
    flex: 1,
    width: '100%',
    minHeight: 160,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFooter: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#0A0116',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  readyBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 10,
  },
  readyBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F6B4F',
  },
  previewHint: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  previewActionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  wrapStacked: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
  },
  retakeWrap: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  analyzeWrap: {
    flexGrow: 1.45,
    flexShrink: 1,
    flexBasis: 0,
  },
  retakeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  analyzeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  retakeBtnText: {
    color: '#8966FA',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 6,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  errorContainer: {
    width: '100%',
    marginBottom: 10,
  },
});