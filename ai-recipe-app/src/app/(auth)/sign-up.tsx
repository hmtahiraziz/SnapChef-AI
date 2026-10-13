import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Keep /sign-up as a stable entry URL, but land on the unified auth screen
 * so Log In ↔ Sign Up toggles never remount the shell (no flicker).
 */
export default function SignUpRedirect() {
  const params = useLocalSearchParams();
  const returnTo = typeof params.returnTo === 'string' ? params.returnTo : undefined;

  return (
    <Redirect
      href={{
        pathname: '/sign-in',
        params: returnTo ? { mode: 'sign-up', returnTo } : { mode: 'sign-up' },
      }}
    />
  );
}
