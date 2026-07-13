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
  getPreferences,
  resetPreferences,
  setPreferenceCountry,
  setPreferenceTheme,
  type AppPreferences,
  type ThemePreference,
} from '@/services/preferencesStorage';

type PreferencesContextValue = {
  country: string;
  theme: ThemePreference;
  isReady: boolean;
  setCountry: (country: string) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  resetToDefaults: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>({
    country: 'Pakistan',
    theme: 'system',
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

  const resetToDefaults = useCallback(async () => {
    const defaults = await resetPreferences();
    setPrefs(defaults);
  }, []);

  const value = useMemo(
    () => ({
      country: prefs.country,
      theme: prefs.theme,
      isReady,
      setCountry,
      setTheme,
      resetToDefaults,
    }),
    [prefs.country, prefs.theme, isReady, setCountry, setTheme, resetToDefaults],
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
