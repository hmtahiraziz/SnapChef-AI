import AsyncStorage from '@react-native-async-storage/async-storage';

import { COUNTRIES, DEFAULT_COUNTRY, type CountryName } from '@/constants/countries';

export type ThemePreference = 'system' | 'light' | 'dark';

export type CookingMode = 'Creative & Gourmet' | 'Quick & Simple' | 'Healthy Focus';

export const COOKING_MODES: CookingMode[] = [
  'Creative & Gourmet',
  'Quick & Simple',
  'Healthy Focus',
];

export const DIETARY_OPTIONS = [
  'Halal',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut-Free',
  'Dairy-Free',
  'Keto',
] as const;

export type DietaryOption = (typeof DIETARY_OPTIONS)[number];

export type AppPreferences = {
  country: string;
  theme: ThemePreference;
  cookingMode: CookingMode;
  dietary: DietaryOption[];
  recipeAlerts: boolean;
};

const COUNTRY_KEY = '@ai_recipe_app/selected_country';
const THEME_KEY = '@ai_recipe_app/theme_preference';
const COOKING_MODE_KEY = '@ai_recipe_app/cooking_mode';
const DIETARY_KEY = '@ai_recipe_app/dietary';
const RECIPE_ALERTS_KEY = '@ai_recipe_app/recipe_alerts';

export const DEFAULT_PREFERENCES: AppPreferences = {
  country: DEFAULT_COUNTRY,
  theme: 'light',
  cookingMode: 'Creative & Gourmet',
  dietary: ['Halal', 'Nut-Free'],
  recipeAlerts: true,
};

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isCookingMode(value: string | null): value is CookingMode {
  return value !== null && (COOKING_MODES as string[]).includes(value);
}

function parseDietary(raw: string | null): DietaryOption[] {
  if (!raw) return [...DEFAULT_PREFERENCES.dietary];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_PREFERENCES.dietary];
    return parsed.filter((item): item is DietaryOption =>
      DIETARY_OPTIONS.includes(item as DietaryOption),
    );
  } catch {
    return [...DEFAULT_PREFERENCES.dietary];
  }
}

export async function getPreferences(): Promise<AppPreferences> {
  try {
    const [country, theme, cookingMode, dietary, recipeAlerts] = await Promise.all([
      AsyncStorage.getItem(COUNTRY_KEY),
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(COOKING_MODE_KEY),
      AsyncStorage.getItem(DIETARY_KEY),
      AsyncStorage.getItem(RECIPE_ALERTS_KEY),
    ]);

    return {
      country:
        country && COUNTRIES.includes(country as CountryName) ? country : DEFAULT_COUNTRY,
      // Theme preference is retained for storage compatibility; UI is light-only.
      theme: isThemePreference(theme) ? theme : 'light',
      cookingMode: isCookingMode(cookingMode) ? cookingMode : DEFAULT_PREFERENCES.cookingMode,
      dietary: parseDietary(dietary),
      recipeAlerts: recipeAlerts === null ? true : recipeAlerts === 'true',
    };
  } catch {
    return { ...DEFAULT_PREFERENCES, dietary: [...DEFAULT_PREFERENCES.dietary] };
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

export async function setPreferenceCookingMode(mode: CookingMode): Promise<void> {
  await AsyncStorage.setItem(COOKING_MODE_KEY, mode);
}

export async function setPreferenceDietary(dietary: DietaryOption[]): Promise<void> {
  await AsyncStorage.setItem(DIETARY_KEY, JSON.stringify(dietary));
}

export async function setPreferenceRecipeAlerts(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(RECIPE_ALERTS_KEY, enabled ? 'true' : 'false');
}

export async function resetPreferences(): Promise<AppPreferences> {
  const defaults = {
    ...DEFAULT_PREFERENCES,
    dietary: [...DEFAULT_PREFERENCES.dietary],
  };
  await Promise.all([
    AsyncStorage.setItem(COUNTRY_KEY, DEFAULT_COUNTRY),
    AsyncStorage.setItem(THEME_KEY, 'light'),
    AsyncStorage.setItem(COOKING_MODE_KEY, defaults.cookingMode),
    AsyncStorage.setItem(DIETARY_KEY, JSON.stringify(defaults.dietary)),
    AsyncStorage.setItem(RECIPE_ALERTS_KEY, 'true'),
  ]);
  return defaults;
}

export function formatDietarySummary(dietary: DietaryOption[]): string {
  if (dietary.length === 0) return 'None selected';
  return dietary.join(', ');
}
