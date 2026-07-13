import { getClerkInstance, useAuth } from '@clerk/clerk-expo';

import { ENV, hasApiBaseUrl } from '@/constants/env';
import { NetworkError } from '@/services/errors';

async function getAuthorizationHeader(): Promise<Record<string, string>> {
  try {
    const clerk = getClerkInstance();
    const token = await clerk.session?.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    console.warn('[backendFetch] unable to read clerk session token', error);
  }

  return {};
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV.apiBaseUrl}${normalizedPath}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const details = body && typeof body === 'object' ? body : { detail: body };
    const message =
      typeof details === 'object' && details !== null && 'detail' in details && typeof (details as { detail?: unknown }).detail === 'string'
        ? String((details as { detail: string }).detail)
        : typeof body === 'string'
        ? body
        : `Request failed with status ${response.status}`;
    throw new NetworkError(message);
  }

  return body;
}

export async function backendFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl()) {
    throw new NetworkError('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL in your environment.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const authHeaders = await getAuthorizationHeader();
  console.log('[backendFetch] request', {
    url: buildUrl(path),
    method: options?.method ?? 'GET',
    hasAuth: Boolean(authHeaders.Authorization),
  });

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        ...headers,
        ...authHeaders,
      },
    });

    return parseResponse(response) as Promise<T>;
  } catch (error) {
    console.error('[backendFetch] request failed', error);
    throw error;
  }
}
