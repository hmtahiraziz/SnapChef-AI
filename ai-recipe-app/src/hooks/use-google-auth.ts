import { useOAuth } from '@clerk/clerk-expo';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl = makeRedirectUri({ path: '/oauth-callback' });
      const runtimeLink = Linking.createURL('/', { scheme: 'airecipeapp' });
      console.log('[GoogleOAuth] redirectUrl', redirectUrl);
      console.log('[GoogleOAuth] runtimeLink', runtimeLink);

      const result = await startOAuthFlow({ redirectUrl });
      console.log('[GoogleOAuth] startOAuthFlow result', result);
      console.log('[GoogleOAuth] startOAuthFlow details', {
        createdSessionId: result?.createdSessionId,
        hasSetActive: typeof result?.setActive === 'function',
        hasSignIn: Boolean(result?.signIn),
        hasSignUp: Boolean(result?.signUp),
      });

      if (result?.createdSessionId && result?.setActive) {
        console.log('[GoogleOAuth] before setActive', { createdSessionId: result.createdSessionId });
        await result.setActive({ session: result.createdSessionId });
        console.log('[GoogleOAuth] after setActive');
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace('/');
      }
    } catch (err) {
      console.error('Google OAuth Error:', err);
    }
  }, [router, startOAuthFlow]);

  return { signInWithGoogle };
}
