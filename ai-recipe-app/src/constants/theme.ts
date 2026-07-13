/**
 * SnapChef AI design tokens — aligned with auth/onboarding lavender language.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const SnapChef = {
  primary: '#8966FA',
  secondary: '#FFE100',
  ink: '#0A0116',
  lavender: '#D8CFFF',
  lavenderDeep: '#C9B8FF',
  muted: '#6B6575',
  field: '#F3F1F6',
  fieldBorder: '#E8E4EF',
  mint: '#D8F5E3',
  cream: '#FFF6D6',
  peach: '#FFE8F0',
  white: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    text: SnapChef.ink,
    background: '#FAFAFD',
    backgroundElement: SnapChef.white,
    backgroundSelected: '#EDE7FF',
    textSecondary: SnapChef.muted,
    tint: SnapChef.primary,
    border: SnapChef.fieldBorder,
    success: '#2F6B4F',
    warning: '#B86E1A',
    gradientStart: '#FAFAFD',
    gradientEnd: '#F0EDF6',
  },
  dark: {
    text: '#F5F2FF',
    background: '#120F1A',
    backgroundElement: '#1C1826',
    backgroundSelected: '#2A2438',
    textSecondary: '#A8A0B8',
    tint: '#A78BFA',
    border: '#3A3348',
    success: '#6FBF95',
    warning: '#E0A05A',
    gradientStart: '#120F1A',
    gradientEnd: '#1E1830',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'DMSans_500Medium',
    serif: 'Fraunces_600SemiBold',
    rounded: 'DMSans_500Medium',
    mono: 'ui-monospace',
    display: 'Fraunces_600SemiBold',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
  },
  default: {
    sans: 'DMSans_500Medium',
    serif: 'Fraunces_600SemiBold',
    rounded: 'DMSans_500Medium',
    mono: 'monospace',
    display: 'Fraunces_600SemiBold',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    display: 'Fraunces_600SemiBold',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Extra inset for floating liquid-glass tab bar */
export const BottomTabInset = Platform.select({ ios: 92, android: 100 }) ?? 92;
export const MaxContentWidth = 920;
