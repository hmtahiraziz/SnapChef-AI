import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useGoogleAuth } from '@/hooks/use-google-auth';
import { GoogleAuthButton } from '@/components/google-auth-button';

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

export type AuthMode = 'sign-in' | 'sign-up';

type AuthEntryScreenProps = {
  initialMode: AuthMode;
};

const TIMING = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

export function AuthEntryScreen({ initialMode }: AuthEntryScreenProps) {
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { signInWithGoogle } = useGoogleAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;
  const modeParam = typeof params.mode === 'string' ? params.mode : undefined;
  const { width: windowWidth } = useWindowDimensions();
  const stackNames = windowWidth < 380;

  const resolvedInitial: AuthMode =
    modeParam === 'sign-up' || modeParam === 'sign-in' ? modeParam : initialMode;

  const [mode, setMode] = useState<AuthMode>(resolvedInitial);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // 0 = sign-in, 1 = sign-up — drives smooth in-place transitions (no remount / flicker).
  const progress = useSharedValue(resolvedInitial === 'sign-up' ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(mode === 'sign-up' ? 1 : 0, TIMING);
  }, [mode, progress]);

  const switchMode = useCallback((next: AuthMode) => {
    setMode((current) => {
      if (current === next) return current;
      setError('');
      return next;
    });
  }, []);

  const onSignIn = useCallback(async () => {
    if (!signInLoaded) return;

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
        await setSignInActive({ session: result.createdSessionId });
      } else {
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, 'Sign in failed.'));
    } finally {
      setLoading(false);
    }
  }, [signInLoaded, signIn, email, password, setSignInActive]);

  const onSignUp = useCallback(async () => {
    if (!signUpLoaded) return;

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
        await setSignUpActive({ session: created.createdSessionId });
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
  }, [
    signUpLoaded,
    signUp,
    email,
    password,
    firstName,
    lastName,
    router,
    returnTo,
    setSignUpActive,
  ]);

  const onGoogle = useCallback(async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(
        getClerkErrorMessage(
          err,
          mode === 'sign-in' ? 'Google sign in failed.' : 'Google sign up failed.'
        )
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle, mode]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-14, 14])
    .onEnd((e) => {
      const distance = e.translationX;
      const fling = Math.abs(e.velocityX) > 700;
      if (distance < -56 || (fling && e.velocityX < 0)) {
        runOnJS(switchMode)('sign-up');
      } else if (distance > 56 || (fling && e.velocityX > 0)) {
        runOnJS(switchMode)('sign-in');
      }
    });

  const nameFieldsStyle = useAnimatedStyle(() => {
    const open = progress.value;
    return {
      opacity: open,
      maxHeight: interpolate(open, [0, 1], [0, stackNames ? 180 : 100]),
      marginBottom: interpolate(open, [0, 1], [0, 16]),
      overflow: 'hidden' as const,
      transform: [{ translateY: interpolate(open, [0, 1], [-6, 0]) }],
    };
  });

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45, 1], [1, 0.55, 1]),
  }));

  const isSignIn = mode === 'sign-in';

  return (
    <AuthScreenShell>
      <AuthSegmentToggle
        active={mode}
        onSignIn={() => switchMode('sign-in')}
        onSignUp={() => switchMode('sign-up')}
      />

      <GestureHandlerRootView style={styles.clipRoot}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.clip}>
            <Animated.View style={copyStyle}>
              <Text style={styles.title}>
                {isSignIn ? `Log In with ${BRAND_NAME}` : `Sign Up with ${BRAND_NAME}`}
              </Text>
              <Text style={styles.subtitle}>
                {isSignIn ? AUTH_COPY.signInSubtitle : AUTH_COPY.signUpSubtitle}
              </Text>
            </Animated.View>

            <View style={styles.form}>
              <Animated.View style={nameFieldsStyle} pointerEvents={isSignIn ? 'none' : 'auto'}>
                <View style={stackNames ? styles.nameFieldsStacked : styles.nameFieldsRow}>
                  <AuthTextField
                    label="First Name"
                    placeholder="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    textContentType="givenName"
                    autoCapitalize="words"
                    flex
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
                    flex
                    accessibilityLabel="Last name"
                  />
                </View>
              </Animated.View>

              <View style={styles.fieldsBlock}>
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
                  autoComplete={isSignIn ? 'password' : 'new-password'}
                  textContentType={isSignIn ? 'password' : 'newPassword'}
                  accessibilityLabel="Password"
                  showPasswordToggle
                  passwordVisible={showPassword}
                  onTogglePassword={() => setShowPassword((v) => !v)}
                  rightLabel={isSignIn ? 'Forgot Password?' : undefined}
                  onRightLabelPress={
                    isSignIn
                      ? () =>
                          router.push({
                            pathname: '/forgot-password',
                            params: {
                              ...(returnTo ? { returnTo } : {}),
                              ...(email.trim() ? { email: email.trim() } : {}),
                            },
                          })
                      : undefined
                  }
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <AuthPrimaryButton
                  label={isSignIn ? 'Log In' : 'Sign Up'}
                  onPress={isSignIn ? onSignIn : onSignUp}
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
                  loading={googleLoading}
                  disabled={loading}
                  variant="compact"
                />

                <TouchableOpacity
                  onPress={() => switchMode(isSignIn ? 'sign-up' : 'sign-in')}
                  style={styles.footerLink}
                  hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}>
                  <Text style={styles.footerText}>
                    {isSignIn ? (
                      <>
                        New to {BRAND_NAME}?{' '}
                        <Text style={styles.footerTextBold}>Sign Up</Text>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <Text style={styles.footerTextBold}>Log In</Text>
                      </>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  clipRoot: {
    width: '100%',
    maxWidth: '100%',
  },
  clip: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
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
    width: '100%',
  },
  fieldsBlock: {
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
