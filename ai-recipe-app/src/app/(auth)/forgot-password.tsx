import { useSignIn } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

import {
  AuthPrimaryButton,
  AuthScreenShell,
  AuthTextField,
  BRAND_NAME,
  getClerkErrorMessage,
  isValidEmail,
  requestPasswordResetEmailCode,
} from "@/features/auth";

function readParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = readParam(params.returnTo) || undefined;
  const initialEmail = readParam(params.email);

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onRequestReset = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    const identifier = email.trim().toLowerCase();
    if (!identifier) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(identifier)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await requestPasswordResetEmailCode(signIn, identifier);
      setSent(true);
      router.push({
        pathname: "/reset-password",
        params: returnTo
          ? { email: identifier, returnTo }
          : { email: identifier },
      });
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Failed to send reset code."));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email, router, returnTo]);

  const goBackToLogin = () =>
    router.replace({
      pathname: "/sign-in",
      params: returnTo ? { returnTo } : undefined,
    });

  return (
    <AuthScreenShell compact showBackButton>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we&apos;ll send a reset code for your {BRAND_NAME}{" "}
        account.
      </Text>

      <View style={styles.form}>
        <AuthTextField
          label="Email address"
          placeholder="Enter your email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError("");
            setSent(false);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Email address"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {sent && !error ? (
          <Text style={styles.success}>Code sent — check your inbox.</Text>
        ) : null}

        <AuthPrimaryButton
          label="Send Reset Code"
          onPress={onRequestReset}
          loading={loading}
        />
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: "#0A0116", marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    color: "#6B6575",
    marginBottom: 20,
    lineHeight: 20,
  },
  form: { gap: 16 },
  error: {
    color: "#c62828",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  success: {
    color: "#2F6B4F",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  backLink: { alignSelf: "center", paddingVertical: 8 },
  backText: { fontSize: 14, fontWeight: "700", color: "#8966FA" },
});
