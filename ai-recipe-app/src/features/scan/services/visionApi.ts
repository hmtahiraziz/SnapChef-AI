import { hasApiBaseUrl } from '@/constants/env';
import { ApiKeyMissingError, VisionError } from '@/services/errors';
import { backendFetch } from '@/services/backendClient';
import type { ExtractedIngredient } from '../types';

interface VisionExtractResponse {
  ingredients?: string[];
  items?: Array<{ name?: string; confidence?: number }>;
}

function normalizeExtracted(
  response: VisionExtractResponse,
): Omit<ExtractedIngredient, 'selected'>[] {
  const fromItems: Omit<ExtractedIngredient, 'selected'>[] = [];

  if (Array.isArray(response.items) && response.items.length > 0) {
    for (const item of response.items) {
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      if (!name) {
        continue;
      }
      fromItems.push({
        name,
        confidence:
          typeof item.confidence === 'number' && Number.isFinite(item.confidence)
            ? item.confidence
            : undefined,
      });
    }
  }

  if (fromItems.length > 0) {
    return fromItems;
  }

  if (!Array.isArray(response.ingredients)) {
    throw new VisionError('Invalid vision response from server.');
  }

  return response.ingredients
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

export type ExtractImageInput = {
  uri: string;
  mimeType?: string;
  fileName?: string;
  signal?: AbortSignal;
};

/**
 * Upload a kitchen photo (multipart) and return detected ingredients.
 * Requires a signed-in Clerk session (Authorization bearer token).
 */
export async function extractIngredientsFromImage(
  input: ExtractImageInput,
): Promise<Omit<ExtractedIngredient, 'selected'>[]> {
  if (!hasApiBaseUrl()) {
    throw new ApiKeyMissingError();
  }

  if (!input.uri) {
    throw new VisionError('No image data provided.');
  }

  const mimeType = input.mimeType || 'image/jpeg';
  const fileName = input.fileName || `scan-${Date.now()}.jpg`;

  const formData = new FormData();
  formData.append(
    'file',
    {
      uri: input.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob,
  );

  try {
    const response = await backendFetch<VisionExtractResponse>('/api/v1/vision/extract', {
      method: 'POST',
      body: formData,
      multipart: true,
      signal: input.signal,
    });

    const items = normalizeExtracted(response);

    if (items.length === 0) {
      throw new VisionError(
        'No ingredients spotted. Try brighter light, crop closer, or retake the photo.',
      );
    }

    return items;
  } catch (error) {
    if (error instanceof VisionError) {
      throw error;
    }
    if (error instanceof Error) {
      if (
        error.name === 'AbortError' ||
        error.message === 'Scan cancelled.' ||
        error.message === 'Request cancelled.'
      ) {
        throw new VisionError('Scan cancelled.');
      }
      throw new VisionError(error.message || 'Failed to extract ingredients.');
    }
    throw new VisionError('Failed to extract ingredients.');
  }
}
