import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  AuthOtpInput,
  AuthPrimaryButton,
  AuthScreenShell,
  BRAND_NAME,
  getClerkErrorMessage,
} from '@/features/auth';
import { useCodeTimers } from '@/features/auth/hooks/useCodeTimers';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendHint, setResendHint] = useState('');

  const { isExpired, canResend, expiryLabel, resendLabel, restartAfterResend } =
    useCodeTimers();

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;
    if (isExpired) {
      setError('This code has expired. Please resend a new one.');
      return;
    }
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
      } else {
        setError('Verification incomplete. Try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Verification failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive, isExpired]);

  const onResend = useCallback(async () => {
    if (!isLoaded || !canResend || resendLoading) return;
    setResendLoading(true);
    setError('');
    setResendHint('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setCode('');
      restartAfterResend();
      setResendHint('A new code was sent. Check your inbox.');
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Failed to resend code.'));
    } finally {
      setResendLoading(false);
    }
  }, [isLoaded, signUp, canResend, resendLoading, restartAfterResend]);

  return (
    <AuthScreenShell compact showBackButton>
      <Text className="text-title text-ink mb-1">Verify Email</Text>
      <Text className="text-body text-muted mb-2">
        Enter the 6-digit code sent to {email || 'your email'} for {BRAND_NAME}.
      </Text>
      <Text
        className={`text-[13px] font-semibold mb-5 ${
          isExpired ? 'text-[#c62828]' : 'text-muted'
        }`}>
        {isExpired
          ? 'Code expired — resend to get a new one.'
          : `Code expires in ${expiryLabel}`}
      </Text>

      <View className="gap-4">
        <AuthOtpInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          autoFocus
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
          disabled={resendLoading || isExpired}
        />

        <TouchableOpacity
          className="self-center p-2"
          onPress={() => void onResend()}
          disabled={!canResend || resendLoading || loading}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code">
          <Text
            className={`text-sm font-semibold ${
              !canResend || resendLoading ? 'text-muted' : 'text-primary'
            }`}>
            {resendLoading ? 'Sending…' : resendLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}
