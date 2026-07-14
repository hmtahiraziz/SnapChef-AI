import { useOAuth } from '@clerk/clerk-expo';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth via Clerk. After setActive, AuthGate routes to
 * select-country (first time) or home — do not navigate manually.
 */
export function useGoogleAuth() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const signInWithGoogle = useCallback(async () => {
    const redirectUrl = makeRedirectUri({ path: '/oauth-callback' });
    const runtimeLink = Linking.createURL('/', { scheme: 'airecipeapp' });
    if (__DEV__) {
      console.log('[GoogleOAuth] redirectUrl', redirectUrl);
      console.log('[GoogleOAuth] runtimeLink', runtimeLink);
    }

    const result = await startOAuthFlow({ redirectUrl });

    if (result?.createdSessionId && result?.setActive) {
      await result.setActive({ session: result.createdSessionId });
      // AuthGate watches isSignedIn + countrySetupDone and navigates.
      return;
    }

    // User closed the browser / cancelled — not an error.
    if (!result?.createdSessionId) return;

    throw new Error('Google sign-in did not complete. Please try again.');
  }, [startOAuthFlow]);

  return { signInWithGoogle };
}
