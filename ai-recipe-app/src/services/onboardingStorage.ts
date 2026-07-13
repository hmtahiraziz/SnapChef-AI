import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@ai_recipe_app/has_seen_onboarding';
const countrySetupKey = (userId: string) => `@ai_recipe_app/country_setup/${userId}`;

type CountrySetupListener = (userId: string, done: boolean) => void;
const countrySetupListeners = new Set<CountrySetupListener>();

export function subscribeCountrySetup(listener: CountrySetupListener): () => void {
  countrySetupListeners.add(listener);
  return () => {
    countrySetupListeners.delete(listener);
  };
}

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(seen = true): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, seen ? '1' : '0');
}

export async function getHasCompletedCountrySetup(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const value = await AsyncStorage.getItem(countrySetupKey(userId));
    return value === '1';
  } catch {
    return false;
  }
}

export async function setHasCompletedCountrySetup(userId: string, done = true): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(countrySetupKey(userId), done ? '1' : '0');
  countrySetupListeners.forEach((listener) => listener(userId, done));
}
