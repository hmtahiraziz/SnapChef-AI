import AsyncStorage from '@react-native-async-storage/async-storage';

import { COUNTRIES, DEFAULT_COUNTRY, type CountryName } from '@/constants/countries';

export type ThemePreference = 'system' | 'light' | 'dark';

export type AppPreferences = {
  country: string;
  theme: ThemePreference;
};

const COUNTRY_KEY = '@ai_recipe_app/selected_country';
const THEME_KEY = '@ai_recipe_app/theme_preference';

export const DEFAULT_PREFERENCES: AppPreferences = {
  country: DEFAULT_COUNTRY,
  theme: 'system',
};

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function getPreferences(): Promise<AppPreferences> {
  try {
    const [country, theme] = await Promise.all([
      AsyncStorage.getItem(COUNTRY_KEY),
      AsyncStorage.getItem(THEME_KEY),
    ]);

    return {
      country:
        country && COUNTRIES.includes(country as CountryName) ? country : DEFAULT_COUNTRY,
      theme: isThemePreference(theme) ? theme : 'system',
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function setPreferenceCountry(country: string): Promise<void> {
  if (!COUNTRIES.includes(country as CountryName)) {
    return;
  }
  await AsyncStorage.setItem(COUNTRY_KEY, country);
}

export async function setPreferenceTheme(theme: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

export async function resetPreferences(): Promise<AppPreferences> {
  await Promise.all([
    AsyncStorage.setItem(COUNTRY_KEY, DEFAULT_COUNTRY),
    AsyncStorage.setItem(THEME_KEY, 'system'),
  ]);
  return { ...DEFAULT_PREFERENCES };
}
