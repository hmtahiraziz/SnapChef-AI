import { type Href, router } from 'expo-router';

/**
 * Prefer stack history; otherwise fall back to a known safe route.
 */
export function smartBack(fallback: Href = '/') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}

export function goHome() {
  router.replace('/');
}

export function goToRecipesSearch(ingredients: string[], country: string) {
  router.push({
    pathname: '/recipes',
    params: {
      ingredients: JSON.stringify(ingredients),
      country,
    },
  });
}
