import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  AuthPrimaryButton,
  AuthScreenShell,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
} from '@/features/auth';

function normalizeInternalHref(href: string): string {
  const [rawPath, rawQuery] = href.split('?');
  const normalizedPathSegments = rawPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
    .filter((segment) => segment !== 'index');

  const normalizedPath =
    normalizedPathSegments.length === 0 ? '/' : `/${normalizedPathSegments.join('/')}`;
  if (!rawQuery || rawQuery.length === 0) return normalizedPath;
  return `${normalizedPath}?${rawQuery}`;
}

function sanitizeReturnTo(raw: unknown): string | null {
  const value = typeof raw === 'string' ? raw : null;
  if (!value || value.length === 0) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;

  const normalized = normalizeInternalHref(value);
  const [pathOnly] = normalized.split('?');
  const authPaths = new Set([
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ]);
  if (authPaths.has(pathOnly)) return null;

  return normalized;
}

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const returnTo = sanitizeReturnTo(params.returnTo);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace((returnTo ?? '/') as any);
      } else {
        setError('Verification incomplete. Try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Verification failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive, router, returnTo]);

  const onResend = useCallback(async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Failed to resend code.'));
    }
  }, [isLoaded, signUp]);

  return (
    <AuthScreenShell compact>
      <Text className="text-title text-ink mb-1">Verify Email</Text>
      <Text className="text-body text-muted mb-5">
        Enter the 6-digit code sent to {email || 'your email'} for {BRAND_NAME}.
      </Text>

      <View className="gap-4">
        <AuthTextField
          label="Verification code"
          placeholder="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoCapitalize="none"
          maxLength={6}
          accessibilityLabel="Verification code"
        />

        {error ? <Text className="text-[#c62828] text-[13px] text-center">{error}</Text> : null}

        <AuthPrimaryButton label="Verify Code" onPress={onVerify} loading={loading} />

        <TouchableOpacity className="self-center p-2" onPress={onResend}>
          <Text className="text-primary text-sm font-semibold">Didn&apos;t receive a code? Resend</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}
