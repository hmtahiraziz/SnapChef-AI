import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import {
  AUTH_COPY,
  AuthPrimaryButton,
  AuthScreenShell,
  AuthSegmentToggle,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
  isValidEmail,
} from '@/features/auth';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { GoogleAuthButton } from '@/components/google-auth-button';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signInWithGoogle } = useGoogleAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignIn = useCallback(async () => {
    if (!isLoaded) return;

    const identifier = email.trim();
    if (!identifier) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(identifier)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({
        identifier,
        password,
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Sign in failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive]);

  const onGoogle = useCallback(async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Google sign in failed.'));
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  const goSignUp = () =>
    router.replace({
      pathname: '/sign-up',
      params: returnTo ? { returnTo } : undefined,
    });

  return (
    <AuthScreenShell>
      <AuthSegmentToggle active="sign-in" onSignIn={() => undefined} onSignUp={goSignUp} />

      <Text style={styles.title}>Log In with {BRAND_NAME}</Text>
      <Text style={styles.subtitle}>{AUTH_COPY.signInSubtitle}</Text>

      <View style={styles.form}>
        <AuthTextField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Email address"
        />

        <AuthTextField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          accessibilityLabel="Password"
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
          rightLabel="Forgot Password?"
          onRightLabelPress={() =>
            router.push({
              pathname: '/forgot-password',
              params: {
                ...(returnTo ? { returnTo } : {}),
                ...(email.trim() ? { email: email.trim() } : {}),
              },
            })
          }
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthPrimaryButton
          label="Log In"
          onPress={onSignIn}
          loading={loading}
          disabled={googleLoading}
        />

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <GoogleAuthButton
          onPress={onGoogle}
          disabled={googleLoading || loading}
          variant="compact"
        />

        <TouchableOpacity
          onPress={goSignUp}
          style={styles.footerLink}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
          <Text style={styles.footerText}>
            New to {BRAND_NAME}? <Text style={styles.footerTextBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A0116',
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B6575',
    lineHeight: 20,
    marginBottom: 20,
  },
  form: {
    gap: 16,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  footerLink: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6B6575',
    textAlign: 'center',
  },
  footerTextBold: {
    fontWeight: '700',
    color: '#0A0116',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E4EF',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A94A5',
    paddingHorizontal: 12,
    textTransform: 'lowercase',
  },
});
