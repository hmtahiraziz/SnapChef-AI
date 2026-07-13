import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

import { usePreferencesOptional } from '@/context/PreferencesContext';

/**
 * Web: hydrate after mount to avoid SSR mismatches, then honor preferences.
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const preferences = usePreferencesOptional();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return 'light';
  }

  const preference = preferences?.theme ?? 'system';
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}
