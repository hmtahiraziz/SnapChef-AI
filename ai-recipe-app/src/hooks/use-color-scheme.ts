import { useColorScheme as useSystemColorScheme } from 'react-native';

import { usePreferencesOptional } from '@/context/PreferencesContext';

/**
 * Resolves light/dark from user preference, falling back to the system scheme.
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useSystemColorScheme();
  const preferences = usePreferencesOptional();
  const preference = preferences?.theme ?? 'system';

  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}
