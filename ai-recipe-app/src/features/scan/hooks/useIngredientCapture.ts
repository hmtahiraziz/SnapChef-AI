import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCallback, useRef, useState } from 'react';

import { extractIngredientsFromImage } from '../services/visionApi';
import type { CapturePhase, ExtractedIngredient, PendingCapture } from '../types';
import { PermissionDeniedError } from '@/services/errors';

type CaptureSource = 'camera' | 'library';

async function prepareCapture(uri: string): Promise<PendingCapture> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: manipulated.uri,
    mimeType: 'image/jpeg',
    fileName: `scan-${Date.now()}.jpg`,
  };
}

export function useIngredientCapture() {
  const [phase, setPhase] = useState<CapturePhase>('idle');
  const [pending, setPending] = useState<PendingCapture | null>(null);
  const [extracted, setExtracted] = useState<ExtractedIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionKind, setPermissionKind] = useState<'camera' | 'library' | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resetCapture = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase('idle');
    setPending(null);
    setExtracted([]);
    setError(null);
    setPermissionKind(null);
  }, []);

  const pickFromSource = useCallback(async (source: CaptureSource) => {
    setError(null);
    setPermissionKind(null);
    setExtracted([]);

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPermissionKind(source === 'camera' ? 'camera' : 'library');
      throw new PermissionDeniedError(source === 'camera' ? 'camera' : 'library');
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.85,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.85,
            allowsEditing: true,
            aspect: [4, 3],
          });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const prepared = await prepareCapture(result.assets[0].uri);
    setPending(prepared);
    setPhase('preview');
  }, []);

  const snapPhoto = useCallback(async () => pickFromSource('camera'), [pickFromSource]);
  const pickPhoto = useCallback(async () => pickFromSource('library'), [pickFromSource]);

  const retake = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(null);
    setExtracted([]);
    setError(null);
    setPhase('idle');
  }, []);

  const cancelScan = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setError(null);
    setPhase(pending ? 'preview' : 'idle');
  }, [pending]);

  const scanPendingPhoto = useCallback(async () => {
    if (!pending?.uri) {
      setError('No photo ready to scan. Take or choose a photo first.');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setPhase('extracting');

    try {
      const items = await extractIngredientsFromImage({
        uri: pending.uri,
        mimeType: pending.mimeType,
        fileName: pending.fileName,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        return;
      }

      setExtracted(
        items.map((item) => ({
          ...item,
          selected: true,
        })),
      );
      setPhase('review');
    } catch (scanError) {
      if (controller.signal.aborted) {
        setPhase(pending ? 'preview' : 'idle');
        return;
      }
      const message =
        scanError instanceof Error
          ? scanError.message
          : 'Something went wrong while reading the photo.';
      if (message === 'Scan cancelled.') {
        setPhase(pending ? 'preview' : 'idle');
        return;
      }
      setError(message);
      setPhase('preview');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [pending]);

  const toggleExtracted = useCallback((index: number) => {
    setExtracted((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, selected: !item.selected } : item,
      ),
    );
  }, []);

  const renameExtracted = useCallback((index: number, name: string) => {
    setExtracted((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, name } : item)),
    );
  }, []);

  const removeExtracted = useCallback((index: number) => {
    setExtracted((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const confirmExtracted = useCallback((): string[] => {
    const selected = extracted
      .filter((item) => item.selected && item.name.trim().length > 0)
      .map((item) => item.name.trim());
    resetCapture();
    return selected;
  }, [extracted, resetCapture]);

  const cancelReview = useCallback(() => {
    setExtracted([]);
    setPhase(pending ? 'preview' : 'idle');
  }, [pending]);

  return {
    phase,
    pending,
    previewUri: pending?.uri ?? null,
    extracted,
    error,
    permissionKind,
    isExtracting: phase === 'extracting',
    isReviewing: phase === 'review',
    setError,
    resetCapture,
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
  };
}
