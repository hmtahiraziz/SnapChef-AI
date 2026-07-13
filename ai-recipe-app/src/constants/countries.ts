export const DEFAULT_COUNTRY = 'Pakistan';

export const COUNTRIES = [
  'Pakistan',
  'India',
  'Bangladesh',
  'Turkey',
  'Italy',
  'Mexico',
  'China',
  'Japan',
  'Thailand',
  'France',
  'USA',
  'UK',
  'Lebanon',
  'Iran',
  'Spain',
  'Korea',
  'Others',
] as const;

export type CountryName = (typeof COUNTRIES)[number];

export const COUNTRY_FLAGS: Record<string, string> = {
  Pakistan: '🇵🇰',
  India: '🇮🇳',
  Bangladesh: '🇧🇩',
  Turkey: '🇹🇷',
  Italy: '🇮🇹',
  Mexico: '🇲🇽',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Thailand: '🇹🇭',
  France: '🇫🇷',
  USA: '🇺🇸',
  UK: '🇬🇧',
  Lebanon: '🇱🇧',
  Iran: '🇮🇷',
  Spain: '🇪🇸',
  Korea: '🇰🇷',
  Others: '🌍',
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🌍';
}
