import { getClerkInstance } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

import { ENV, hasApiBaseUrl, isApiBaseLoopback } from '@/constants/env';
import { NetworkError } from '@/services/errors';

async function getAuthorizationHeader(): Promise<Record<string, string>> {
  try {
    const clerk = getClerkInstance();
    const token = await clerk.session?.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[backendFetch] unable to read clerk session token', error);
    }
  }

  return {};
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV.apiBaseUrl}${normalizedPath}`;
}

function unreachableMessage(): string {
  const base = ENV.apiBaseUrl;
  if (Platform.OS !== 'web' && isApiBaseLoopback()) {
    return (
      `Cannot reach API at ${base}. Start the backend on port 8000, then run ` +
      '`adb reverse tcp:8000 tcp:8000` (USB) or set EXPO_PUBLIC_API_BASE_URL to your PC LAN IP.'
    );
  }
  return `Cannot reach API at ${base}. Check that the backend is running and reachable from this device.`;
}

function isFormDataBody(body: BodyInit | null | undefined): boolean {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const details = body && typeof body === 'object' ? body : { detail: body };
    let message =
      typeof details === 'object' &&
      details !== null &&
      'detail' in details &&
      typeof (details as { detail?: unknown }).detail === 'string'
        ? String((details as { detail: string }).detail)
        : typeof body === 'string'
          ? body
          : `Request failed with status ${response.status}`;

    if (response.status === 401) {
      message = 'Please sign in again to use this feature.';
    }

    throw new NetworkError(message);
  }

  return body;
}

export type BackendFetchOptions = RequestInit & {
  /** When true, skips JSON Content-Type (used for FormData uploads). */
  multipart?: boolean;
};

export async function backendFetch<T>(path: string, options?: BackendFetchOptions): Promise<T> {
  if (!hasApiBaseUrl()) {
    throw new NetworkError(
      'API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL in your environment.',
    );
  }

  const { multipart, headers: optionHeaders, ...rest } = options ?? {};
  const useMultipart = multipart || isFormDataBody(rest.body);

  const headers: Record<string, string> = {
    ...(optionHeaders as Record<string, string>),
  };

  if (!useMultipart && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // RN FormData must set its own multipart boundary — never force Content-Type.
  if (useMultipart) {
    delete headers['Content-Type'];
  }

  const authHeaders = await getAuthorizationHeader();
  if (!authHeaders.Authorization) {
    throw new NetworkError('Please sign in again to use this feature.');
  }

  const url = buildUrl(path);

  if (__DEV__) {
    console.log('[backendFetch]', rest.method ?? 'GET', url, {
      hasAuth: true,
      multipart: useMultipart,
    });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        ...headers,
        ...authHeaders,
      },
    });

    return parseResponse(response) as Promise<T>;
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request cancelled.');
    }

    throw new NetworkError(unreachableMessage());
  }
}
