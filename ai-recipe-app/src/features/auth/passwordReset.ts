type ClerkFactor = {
  strategy: string;
  emailAddressId?: string;
};

type SignInLike = {
  create: (params: { identifier: string }) => Promise<{
    supportedFirstFactors?: ClerkFactor[] | null;
  }>;
  prepareFirstFactor: (params: {
    strategy: 'reset_password_email_code';
    emailAddressId: string;
  }) => Promise<unknown>;
};

/**
 * Clerk Expo v2 / Core 2 password-reset start:
 * 1) create sign-in with email identifier
 * 2) prepareFirstFactor with reset_password_email_code
 *
 * More reliable than passing strategy into create(), and surfaces
 * clearer failures when the account can't reset via email.
 */
export async function requestPasswordResetEmailCode(
  signIn: SignInLike,
  rawEmail: string
): Promise<void> {
  const identifier = rawEmail.trim().toLowerCase();

  const created = await signIn.create({ identifier });

  const resetFactor = created.supportedFirstFactors?.find(
    (factor) => factor.strategy === 'reset_password_email_code'
  );

  if (!resetFactor?.emailAddressId) {
    const err = new Error(
      'Password reset is not available for this account. If you signed up with Google, use Continue with Google instead.'
    ) as Error & { errors?: { code: string; longMessage: string }[] };
    err.errors = [
      {
        code: 'reset_password_unavailable',
        longMessage: err.message,
      },
    ];
    throw err;
  }

  await signIn.prepareFirstFactor({
    strategy: 'reset_password_email_code',
    emailAddressId: resetFactor.emailAddressId,
  });
}
