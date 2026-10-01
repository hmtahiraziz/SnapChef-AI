/**
 * SnapChef AI design tokens — lavender brand with a clean light/dark system.
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
    field: SnapChef.field,
    fieldBorder: SnapChef.fieldBorder,
    iconMuted: 'rgba(10, 1, 22, 0.45)',
    overlay: 'rgba(10, 1, 22, 0.45)',
    cardBorder: 'rgba(255, 255, 255, 0.75)',
    cardHighlight: 'rgba(255, 255, 255, 0.85)',
  },
  dark: {
    text: '#F3F2F7',
    background: '#0B0B0F',
    backgroundElement: '#15151C',
    backgroundSelected: '#242430',
    textSecondary: '#9B98A8',
    tint: '#B49BFF',
    border: '#2C2C38',
    success: '#6FBF95',
    warning: '#E0A05A',
    gradientStart: '#0B0B0F',
    gradientEnd: '#12121A',
    field: '#1A1A22',
    fieldBorder: '#2E2E3A',
    iconMuted: 'rgba(243, 242, 247, 0.45)',
    overlay: 'rgba(0, 0, 0, 0.58)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardHighlight: 'rgba(255, 255, 255, 0.1)',
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

/**
 * Soft stadium radii — match floating navbar language (not harsh full capsules).
 */
export const Radii = {
  /** Floating tab bar outer pill */
  nav: 36,
  /** Primary action pills / CTAs */
  pill: 28,
  /** Compact chips / small controls */
  chip: 20,
  /** Cards / sheets */
  card: 28,
} as const;

/**
 * Extra inset for floating liquid-glass tab bar.
 * Sized for the protruding center scan control + home-indicator clearance.
 * Narrow phones use a slightly smaller bar; keep this on the generous side.
 */
export const BottomTabInset = Platform.select({ ios: 96, android: 104 }) ?? 96;
export const MaxContentWidth = 920;
