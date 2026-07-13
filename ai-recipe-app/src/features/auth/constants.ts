export const BRAND_NAME = 'SnapChef AI';

export const AUTH_COPY = {
  tagline: 'Snap ingredients. Cook smarter.',
  description: 'Turn your ingredients into delicious meals with AI.',
  signInSubtitle:
    'Snap ingredients. Cook smarter. Sign in to unlock personalized AI recipes.',
  signUpSubtitle:
    'Sign up with SnapChef AI to turn your ingredients into delicious meals with AI.',
  onboardingTitle: 'Quick &\nEasy\nRecipes!',
  onboardingBody: 'Quick and easy recipes save time, taste great, and bring smiles.',
} as const;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getClerkErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { errors?: { longMessage?: string; message?: string }[]; message?: string };
  return anyErr?.errors?.[0]?.longMessage ?? anyErr?.errors?.[0]?.message ?? anyErr?.message ?? fallback;
}
