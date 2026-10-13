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

type ClerkErrorItem = {
  code?: string;
  longMessage?: string;
  message?: string;
};

const CLERK_ERROR_COPY: Record<string, string> = {
  form_identifier_not_found: 'No account found for this email.',
  form_identifier_invalid: 'No account found for this email.',
  form_param_format_invalid: 'Please enter a valid email address.',
  form_param_nil: 'Please enter your email address.',
  form_code_incorrect: 'That verification code is incorrect. Try again.',
  form_password_pwned:
    'This password has appeared in a data breach. Please choose a different password.',
  form_password_length_too_short: 'Password must be at least 8 characters.',
  form_password_incorrect: 'Incorrect password. Try again or reset it.',
  too_many_requests: 'Too many attempts. Please wait a moment and try again.',
  reset_password_unavailable:
    'Password reset is not available for this account. If you signed up with Google, use Continue with Google instead.',
};

export function getClerkErrorCode(err: unknown): string | undefined {
  const anyErr = err as { errors?: ClerkErrorItem[]; code?: string };
  return anyErr?.errors?.[0]?.code ?? anyErr?.code;
}

export function getClerkErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { errors?: ClerkErrorItem[]; message?: string };
  const first = anyErr?.errors?.[0];
  const code = first?.code;

  if (code && CLERK_ERROR_COPY[code]) {
    return CLERK_ERROR_COPY[code];
  }

  const raw = first?.longMessage ?? first?.message ?? anyErr?.message ?? '';
  // Normalize Clerk's vague "Identifier is invalid" wording.
  if (/identifier is invalid/i.test(raw)) {
    return 'No account found for this email.';
  }

  return raw || fallback;
}
