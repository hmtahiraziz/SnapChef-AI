import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  formatDietarySummary,
  getPreferences,
  resetPreferences,
  setPreferenceCookingMode,
  setPreferenceCountry,
  setPreferenceDietary,
  setPreferenceRecipeAlerts,
  setPreferenceTheme,
  type AppPreferences,
  type CookingMode,
  type DietaryOption,
  type ThemePreference,
} from '@/services/preferencesStorage';

type PreferencesContextValue = {
  country: string;
  theme: ThemePreference;
  cookingMode: CookingMode;
  dietary: DietaryOption[];
  dietarySummary: string;
  recipeAlerts: boolean;
  isReady: boolean;
  setCountry: (country: string) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setCookingMode: (mode: CookingMode) => Promise<void>;
  setDietary: (dietary: DietaryOption[]) => Promise<void>;
  setRecipeAlerts: (enabled: boolean) => Promise<void>;
  resetToDefaults: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>({
    country: 'Pakistan',
    theme: 'system',
    cookingMode: 'Creative & Gourmet',
    dietary: ['Halal', 'Nut-Free'],
    recipeAlerts: true,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await getPreferences();
      if (active) {
        setPrefs(stored);
        setIsReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setCountry = useCallback(async (country: string) => {
    setPrefs((current) => ({ ...current, country }));
    await setPreferenceCountry(country);
  }, []);

  const setTheme = useCallback(async (theme: ThemePreference) => {
    setPrefs((current) => ({ ...current, theme }));
    await setPreferenceTheme(theme);
  }, []);

  const setCookingMode = useCallback(async (cookingMode: CookingMode) => {
    setPrefs((current) => ({ ...current, cookingMode }));
    await setPreferenceCookingMode(cookingMode);
  }, []);

  const setDietary = useCallback(async (dietary: DietaryOption[]) => {
    setPrefs((current) => ({ ...current, dietary }));
    await setPreferenceDietary(dietary);
  }, []);

  const setRecipeAlerts = useCallback(async (recipeAlerts: boolean) => {
    setPrefs((current) => ({ ...current, recipeAlerts }));
    await setPreferenceRecipeAlerts(recipeAlerts);
  }, []);

  const resetToDefaults = useCallback(async () => {
    const defaults = await resetPreferences();
    setPrefs(defaults);
  }, []);

  const value = useMemo(
    () => ({
      country: prefs.country,
      theme: prefs.theme,
      cookingMode: prefs.cookingMode,
      dietary: prefs.dietary,
      dietarySummary: formatDietarySummary(prefs.dietary),
      recipeAlerts: prefs.recipeAlerts,
      isReady,
      setCountry,
      setTheme,
      setCookingMode,
      setDietary,
      setRecipeAlerts,
      resetToDefaults,
    }),
    [
      prefs.country,
      prefs.theme,
      prefs.cookingMode,
      prefs.dietary,
      prefs.recipeAlerts,
      isReady,
      setCountry,
      setTheme,
      setCookingMode,
      setDietary,
      setRecipeAlerts,
      resetToDefaults,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

export function usePreferencesOptional() {
  return useContext(PreferencesContext);
}
