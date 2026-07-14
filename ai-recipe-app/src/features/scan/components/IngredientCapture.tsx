import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View, Modal, Text } from 'react-native';
import { useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { InlineError } from '@/components/ui/inline-error';
import { SnapChef } from '@/constants/theme';
import { IngredientReviewSheet } from './IngredientReviewSheet';
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
    toggleExtracted,
    renameExtracted,
    removeExtracted,
    confirmExtracted,
    cancelReview,
  } = useIngredientCapture();

  const aiReady = hasApiBaseUrl();
  const busy = isExtracting;

  const runPick = useCallback(async (action: () => Promise<void>) => {
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
  }, [setError]);

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
      animationType="slide"
      transparent={false}
      onRequestClose={handleBack}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), backgroundColor: theme.background }]}>

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
            <Text style={[styles.headerTitle, { color: theme.text }]}>Ingredient Scan</Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Content Area */}
        <View style={styles.content}>

          {/* 1. Idle Choice State (if user cancelled camera/picker or wants to choose again) */}
          {phase === 'idle' && (
            <View style={styles.idleContainer}>
              <View style={styles.idleIconWrap}>
                <Ionicons name="sparkles" size={48} color={SnapChef.primary} />
              </View>
              <Text style={[styles.idleTitle, { color: theme.text }]}>Identify Ingredients</Text>
              <Text style={[styles.idleDesc, { color: theme.textSecondary }]}>
                Take a photo of your fridge ingredients or upload an image to extract them automatically using AI.
              </Text>

              <View style={styles.choiceButtons}>
                <Pressable
                  disabled={!aiReady || busy}
                  onPress={() => void runPick(snapPhoto)}
                  style={({ pressed }) => [
                    styles.choiceBtn,
                    pressed && styles.choiceBtnPressed,
                    (!aiReady || busy) && styles.btnDisabled
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
                    (!aiReady || busy) && styles.btnDisabled
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
            </View>
          )}

          {/* 2. Photo Preview State (image captured/selected) */}
          {phase === 'preview' && previewUri && (
            <View style={styles.previewContainer}>
              <View style={styles.previewFrame}>
                <Image source={{ uri: previewUri }} style={styles.previewImage} contentFit="contain" />
              </View>

              <View style={styles.previewActions}>
                {/* Retry — left (fixed width, not flex) */}
                <Pressable
                  onPress={retake}
                  style={({ pressed }) => [
                    styles.actionBtnOutline,
                    { backgroundColor: '#EDE7FF', borderColor: '#D8CFFF' },
                    pressed && styles.actionBtnPressed,
                  ]}
                >
                  <Ionicons name="refresh" size={18} color={SnapChef.primary} />
                  <Text style={styles.actionBtnOutlineText}>Retry</Text>
                </Pressable>

                {/* Upload & Scan — right, takes remaining space */}
                <View style={styles.actionBtnPrimaryWrap}>
                  <Pressable
                    onPress={() => void scanPendingPhoto()}
                    style={({ pressed }) => [
                      styles.actionBtnPrimaryInner,
                      pressed && styles.actionBtnPressed,
                    ]}
                  >
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                    <Text style={styles.actionBtnPrimaryText}>Upload & Scan</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* 3. Extracting / Scanning Loading Overlay */}
          {isExtracting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={SnapChef.primary} size="large" />
              <Text style={[styles.loadingTitle, { color: theme.text }]}>Analyzing Image</Text>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Our AI is scanning the ingredients in your photo...</Text>
            </View>
          )}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <InlineError
                message={error}
                showOpenSettings={Boolean(permissionKind)}
                primaryActionLabel={phase === 'preview' ? 'Try scan again' : undefined}
                onPrimaryAction={phase === 'preview' ? () => void scanPendingPhoto() : undefined}
              />
            </View>
          ) : null}

        </View>

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
    padding: 16,
    justifyContent: 'center',
  },
  idleContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  idleIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EDE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    marginBottom: 16,
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  choiceBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: SnapChef.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  choiceBtnGallery: {
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
  },
  choiceBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
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
    marginTop: 12,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  previewFrame: {
    flex: 1,
    backgroundColor: '#0F0E13',
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E4EF',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtnOutline: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E8E4EF',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  actionBtnOutlineText: {
    color: SnapChef.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnPrimaryWrap: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: SnapChef.primary,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  actionBtnPrimaryInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SnapChef.primary,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    backgroundColor: SnapChef.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 999,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A0116',
    marginTop: 16,
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B6575',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 16,
  },
});
