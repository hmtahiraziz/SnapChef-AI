import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';

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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signInWithGoogle } = useGoogleAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;
  const { width } = useWindowDimensions();
  const stackNames = width < 380;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = useCallback(async () => {
    if (!isLoaded) return;

    const first = firstName.trim();
    const last = lastName.trim();
    const emailAddress = email.trim();

    if (!first) {
      setError('Please enter your first name.');
      return;
    }
    if (!last) {
      setError('Please enter your last name.');
      return;
    }
    if (!emailAddress) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(emailAddress)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const created = await signUp.create({
        emailAddress,
        password,
        firstName: first,
        lastName: last,
      });

      if (created.status === 'complete' && created.createdSessionId) {
        await setActive({ session: created.createdSessionId });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push({
        pathname: '/verify-email',
        params: returnTo
          ? { email: emailAddress, returnTo }
          : { email: emailAddress },
      });
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Sign up failed.'));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password, firstName, lastName, router, returnTo, setActive]);

  const onGoogle = useCallback(async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Google sign up failed.'));
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  const goSignIn = () =>
    router.replace({
      pathname: '/sign-in',
      params: returnTo ? { returnTo } : undefined,
    });

  return (
    <AuthScreenShell>
      <AuthSegmentToggle active="sign-up" onSignIn={goSignIn} onSignUp={() => undefined} />

      <Text style={styles.title}>Sign Up with {BRAND_NAME}</Text>
      <Text style={styles.subtitle}>{AUTH_COPY.signUpSubtitle}</Text>

      <View style={styles.form}>
        <View style={stackNames ? styles.nameFieldsStacked : styles.nameFieldsRow}>
          <AuthTextField
            label="First Name"
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            containerClassName={stackNames ? undefined : 'flex-1'}
            accessibilityLabel="First name"
          />
          <AuthTextField
            label="Last Name"
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            containerClassName={stackNames ? undefined : 'flex-1'}
            accessibilityLabel="Last name"
          />
        </View>

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
          autoComplete="new-password"
          textContentType="newPassword"
          accessibilityLabel="Password"
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthPrimaryButton
          label="Sign Up"
          onPress={onSignUp}
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
          onPress={goSignIn}
          style={styles.footerLink}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerTextBold}>Log In</Text>
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
  nameFieldsStacked: {
    gap: 16,
    width: '100%',
  },
  nameFieldsRow: {
    flexDirection: 'row',
    gap: 12,
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
