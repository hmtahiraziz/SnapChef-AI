import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ENV, hasPrivacyPolicyUrl } from '@/constants/env';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Who we are',
    body: 'SnapChef AI (“we”, “us”) helps you turn ingredients into recipes using on-device capture and cloud AI. This policy explains what we collect, how we use it, and your choices.',
  },
  {
    title: 'Information we collect',
    body: 'Account data (name, email, profile photo) via Clerk authentication. Ingredient photos you choose to capture or upload for scanning. Preference data such as cuisine/country. Favorites and shopping-list items you save in the app. Technical data needed to run the service (device/app version, crash diagnostics when available).',
  },
  {
    title: 'How we use information',
    body: 'We use your data to create and secure your account, extract ingredients from photos, generate recipes, sync favorites when signed in, and improve reliability and support. Photos sent for scanning are processed to return ingredient suggestions and are not used to train models on your behalf beyond what our AI providers state in their own policies.',
  },
  {
    title: 'Third-party services',
    body: 'Clerk (authentication and account management), our API host (backend), MongoDB (favorites storage when signed in), and OpenAI (vision and recipe generation). Each provider processes data under their own terms and privacy policies.',
  },
  {
    title: 'Permissions',
    body: 'Camera and photo library access are used only when you choose to scan ingredients or update your profile photo. We do not record audio.',
  },
  {
    title: 'Data retention & deletion',
    body: 'You can sign out anytime. You can delete your account in Settings → Account → Delete account. That removes your Clerk account and stops cloud sync of favorites tied to that account. Local device data may remain until you clear app storage.',
  },
  {
    title: 'Your choices',
    body: 'You may decline camera/library permissions (text ingredient entry still works). You may update profile details in Account. You may request account deletion in-app as described above.',
  },
  {
    title: 'Children',
    body: 'SnapChef AI is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect personal information from children.',
  },
  {
    title: 'Changes',
    body: 'We may update this policy as the product evolves. Continued use after changes means you accept the updated policy. Material changes will be reflected in the app and, when available, at our public privacy policy URL.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy: contact the SnapChef AI support channel listed on the app’s store listing, or the developer email associated with the Play Store / App Store listing.',
  },
];

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  const openHostedPolicy = async () => {
    if (!hasPrivacyPolicyUrl()) return;
    await openBrowserAsync(ENV.privacyPolicyUrl, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  return (
    <ScreenContainer scroll withTabInset={false} gradient edges={['bottom', 'left', 'right']}>
      <Text style={[styles.updated, { color: theme.textSecondary }]}>Last updated: October 1, 2026</Text>
      <Text style={[styles.intro, { color: theme.text }]}>
        Please read this Privacy Policy before using SnapChef AI. By using the app, you agree to this policy.
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.heading, { color: theme.text }]}>{section.title}</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>{section.body}</Text>
        </View>
      ))}

      {hasPrivacyPolicyUrl() ? (
        <Pressable
          onPress={() => void openHostedPolicy()}
          style={[styles.linkBtn, { borderColor: theme.border }]}
          accessibilityRole="link"
          accessibilityLabel="Open hosted privacy policy"
        >
          <Text style={[styles.linkText, { color: theme.tint }]}>View online version</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  updated: { fontSize: 12, marginBottom: Spacing.one },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.three, fontWeight: '600' },
  section: { marginBottom: Spacing.three, gap: 6 },
  heading: { fontSize: 16, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21 },
  linkBtn: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1.5,
  },
  linkText: { fontSize: 15, fontWeight: '700' },
});
