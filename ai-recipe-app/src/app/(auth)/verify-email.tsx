import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  AuthPrimaryButton,
  AuthScreenShell,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
} from '@/features/auth';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendHint, setResendHint] = useState('');

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;
    const trimmed = code.trim();
    if (trimmed.length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    setError('');
    setResendHint('');
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: trimmed,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        // AuthGate → select-country (new users) or home.
      } else {
        setError('Verification incomplete. Try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Verification failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive]);

  const onResend = useCallback(async () => {
    if (!isLoaded) return;
    setResendLoading(true);
    setError('');
    setResendHint('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendHint('A new code was sent. Check your inbox.');
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Failed to resend code.'));
    } finally {
      setResendLoading(false);
    }
  }, [isLoaded, signUp]);

  return (
    <AuthScreenShell compact showBackButton>
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
        {resendHint ? (
          <Text className="text-primary text-[13px] text-center font-semibold">{resendHint}</Text>
        ) : null}

        <AuthPrimaryButton
          label="Verify Code"
          onPress={onVerify}
          loading={loading}
          disabled={resendLoading}
        />

        <TouchableOpacity
          className="self-center p-2"
          onPress={() => void onResend()}
          disabled={resendLoading || loading}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code">
          <Text className="text-primary text-sm font-semibold">
            {resendLoading ? 'Sending…' : "Didn't receive a code? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}
