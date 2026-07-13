import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// Resolve API base URL with auto-detection
let resolvedApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || (extra.apiBaseUrl as string) || '';

if (!resolvedApiBaseUrl) {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      resolvedApiBaseUrl = `http://${host}:8000`;
    }
  }
}

if (!resolvedApiBaseUrl) {
  resolvedApiBaseUrl = 'http://localhost:8000';
}

export const ENV = {
  apiBaseUrl: resolvedApiBaseUrl,
  clerkPublishableKey: (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? extra.clerkPublishableKey ?? '') as string,
} as const;

export function hasApiBaseUrl(): boolean {
  return ENV.apiBaseUrl.length > 0;
}

export function hasClerkPublishableKey(): boolean {
  return ENV.clerkPublishableKey.length > 0;
}
