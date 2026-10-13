import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import {
  AuthOtpInput,
  AuthPrimaryButton,
  AuthScreenShell,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
  requestPasswordResetEmailCode,
} from '@/features/auth';
import { useCodeTimers } from '@/features/auth/hooks/useCodeTimers';

function readParam(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}

export default function ResetPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = readParam(params.email).trim().toLowerCase();
  const returnTo = readParam(params.returnTo) || undefined;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendHint, setResendHint] = useState('');

  const {
    isExpired,
    canResend,
    expiryLabel,
    resendLabel,
    restartAfterResend,
  } = useCodeTimers();

  const onResetPassword = useCallback(async () => {
    if (!isLoaded) return;
    if (isExpired) {
      setError('This code has expired. Please resend a new one.');
      return;
    }
    if (!code.trim() || code.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Verification incomplete. Try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Reset password failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, code, password, confirmPassword, setActive, isExpired]);

  const onResend = useCallback(async () => {
    if (!isLoaded || !signIn || !email || !canResend || resendLoading) return;
    setResendLoading(true);
    setError('');
    setResendHint('');
    try {
      await requestPasswordResetEmailCode(signIn, email);
      setCode('');
      restartAfterResend();
      setResendHint('A new code was sent. Check your inbox.');
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Failed to resend code.'));
    } finally {
      setResendLoading(false);
    }
  }, [isLoaded, signIn, email, canResend, resendLoading, restartAfterResend]);

  const goBackToLogin = () =>
    router.replace({
      pathname: '/sign-in',
      params: returnTo ? { returnTo } : undefined,
    });

  return (
    <AuthScreenShell compact showBackButton>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {email
          ? `Enter the code sent to ${email} and choose a new ${BRAND_NAME} password.`
          : `Enter the code sent to your email and choose a new ${BRAND_NAME} password.`}
      </Text>
      <Text style={[styles.expiry, isExpired && styles.expiryExpired]}>
        {isExpired
          ? 'Code expired — resend to get a new one.'
          : `Code expires in ${expiryLabel}`}
      </Text>

      <View style={styles.form}>
        <AuthOtpInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          accessibilityLabel="Verification code"
        />

        <AuthTextField
          label="New password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          accessibilityLabel="New password"
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

        <AuthTextField
          label="Confirm password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          accessibilityLabel="Confirm new password"
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resendHint ? <Text style={styles.hint}>{resendHint}</Text> : null}

        <AuthPrimaryButton
          label="Reset Password"
          onPress={onResetPassword}
          loading={loading}
          disabled={resendLoading || isExpired}
        />

        <TouchableOpacity
          style={styles.link}
          onPress={() => void onResend()}
          disabled={!canResend || !email || resendLoading || loading}
          hitSlop={8}>
          <Text
            style={[
              styles.linkText,
              (!canResend || resendLoading) && styles.linkMuted,
            ]}>
            {resendLoading ? 'Sending…' : resendLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={goBackToLogin} hitSlop={8}>
          <Text style={styles.backText}>Back to Log In</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#0A0116', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6575', marginBottom: 8, lineHeight: 20 },
  expiry: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6575',
    marginBottom: 16,
  },
  expiryExpired: { color: '#c62828' },
  form: { gap: 14 },
  error: { color: '#c62828', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  hint: { color: '#8966FA', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  link: { alignSelf: 'center', paddingVertical: 6 },
  linkText: { fontSize: 14, fontWeight: '600', color: '#8966FA' },
  linkMuted: { color: '#6B6575' },
  backText: { fontSize: 14, fontWeight: '700', color: '#0A0116' },
});
