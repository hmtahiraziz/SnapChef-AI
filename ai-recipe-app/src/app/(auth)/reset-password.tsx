import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import {
  AuthPrimaryButton,
  AuthScreenShell,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
} from '@/features/auth';

const RESEND_COOLDOWN_SEC = 45;

export default function ResetPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onResetPassword = useCallback(async () => {
    if (!isLoaded) return;
    if (!code.trim()) {
      setError('Please enter the verification code.');
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
  }, [isLoaded, signIn, code, password, confirmPassword, setActive]);

  const onResend = useCallback(async () => {
    if (!isLoaded || !email || cooldown > 0) return;
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Failed to resend code.'));
    }
  }, [isLoaded, signIn, email, cooldown]);

  const goBackToLogin = () =>
    router.replace({
      pathname: '/sign-in',
      params: returnTo ? { returnTo } : undefined,
    });

  return (
    <AuthScreenShell compact>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {email
          ? `Enter the code sent to ${email} and choose a new ${BRAND_NAME} password.`
          : `Enter the code sent to your email and choose a new ${BRAND_NAME} password.`}
      </Text>

      <View style={styles.form}>
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
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AuthPrimaryButton label="Reset Password" onPress={onResetPassword} loading={loading} />

        <TouchableOpacity
          style={styles.link}
          onPress={() => void onResend()}
          disabled={cooldown > 0 || !email}
          hitSlop={8}>
          <Text style={[styles.linkText, cooldown > 0 && styles.linkMuted]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive a code? Resend"}
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
  subtitle: { fontSize: 14, color: '#6B6575', marginBottom: 20, lineHeight: 20 },
  form: { gap: 14 },
  error: { color: '#c62828', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  link: { alignSelf: 'center', paddingVertical: 6 },
  linkText: { fontSize: 14, fontWeight: '600', color: '#8966FA' },
  linkMuted: { color: '#6B6575' },
  backText: { fontSize: 14, fontWeight: '700', color: '#0A0116' },
});
