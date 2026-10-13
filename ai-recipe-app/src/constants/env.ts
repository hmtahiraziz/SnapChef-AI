import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

const DEFAULT_API_PORT = '8000';

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

/** Host machine IP as seen by Metro / the running JS bundle (LAN preferred). */
function readDevMachineHost(): string | null {
  const candidates: Array<string | null | undefined> = [
    Constants.expoConfig?.hostUri,
    // Expo Router / modern manifests
    (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }).manifest2?.extra
      ?.expoClient?.hostUri,
    // Legacy classic manifest
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost,
    // Bundle URL — most reliable on device when Metro is connected
    NativeModules.SourceCode?.scriptURL as string | undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const withoutScheme = candidate.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    const hostPort = withoutScheme.split('/')[0] ?? '';
    const host = hostPort.split(':')[0]?.replace(/^\[|\]$/g, '');

    if (host && !isLoopbackHost(host)) {
      return host;
    }
  }

  return null;
}

function rewriteLoopbackForNativeDevice(baseUrl: string): string {
  if (Platform.OS === 'web') {
    return baseUrl;
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  if (!isLoopbackHost(url.hostname)) {
    return baseUrl.replace(/\/$/, '');
  }

  // Physical device / simulator on LAN: point at the machine running Metro.
  const machineHost = readDevMachineHost();
  if (machineHost) {
    url.hostname = machineHost;
    return url.toString().replace(/\/$/, '');
  }

  // Android emulator maps the host loopback to 10.0.2.2.
  // Physical USB + `adb reverse tcp:8000 tcp:8000` can keep 127.0.0.1.
  if (Platform.OS === 'android') {
    // Prefer explicit 127.0.0.1 over "localhost" (some Android stacks resolve localhost poorly).
    url.hostname = '127.0.0.1';
  }

  return url.toString().replace(/\/$/, '');
}

function resolveApiBaseUrl(): string {
  const configured = (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (extra.apiBaseUrl as string) ||
    ''
  )
    .trim()
    .replace(/\/$/, '');

  const base = configured || `http://127.0.0.1:${DEFAULT_API_PORT}`;
  return rewriteLoopbackForNativeDevice(base);
}

const resolvedApiBaseUrl = resolveApiBaseUrl();

if (__DEV__) {
  console.log('[ENV] apiBaseUrl =', resolvedApiBaseUrl);
}

export const ENV = {
  apiBaseUrl: resolvedApiBaseUrl,
  clerkPublishableKey: (process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? extra.clerkPublishableKey ?? '') as string,
  /** Public HTTPS URL for Play Console / Store listing. In-app screen is always available at /legal/privacy. */
  privacyPolicyUrl: (
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ||
    (extra.privacyPolicyUrl as string) ||
    ''
  ).trim(),
} as const;

export function hasApiBaseUrl(): boolean {
  return ENV.apiBaseUrl.length > 0;
}

export function isApiBaseLoopback(): boolean {
  try {
    return isLoopbackHost(new URL(ENV.apiBaseUrl).hostname);
  } catch {
    return false;
  }
}

export function hasClerkPublishableKey(): boolean {
  return ENV.clerkPublishableKey.length > 0;
}

export function hasPrivacyPolicyUrl(): boolean {
  return ENV.privacyPolicyUrl.length > 0;
}
