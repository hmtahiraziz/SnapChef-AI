import type { IngredientCategory } from '@/utils/ingredientCategory';

export const SLSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const SLRadii = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const SLColors = {
  primary: '#8966FA',
  danger: '#EF4444',
  progressTrack: 'rgba(137, 102, 250, 0.14)',
  progressFill: '#8966FA',
} as const;

/** One category → color map. Used for card fill + label (no index alternating). */
export const categoryColors: Record<
  IngredientCategory,
  { bg: string; text: string; check: string; darkBg: string; darkText: string }
> = {
  produce: {
    bg: '#EEFBF4',
    text: '#0F6B45',
    check: '#10B981',
    darkBg: 'rgba(16, 185, 129, 0.16)',
    darkText: '#6EE7B7',
  },
  meat: {
    bg: '#FEF2F2',
    text: '#B91C1C',
    check: '#EF4444',
    darkBg: 'rgba(239, 68, 68, 0.16)',
    darkText: '#FCA5A5',
  },
  dairy: {
    bg: '#FFF8EB',
    text: '#92400E',
    check: '#F59E0B',
    darkBg: 'rgba(245, 158, 11, 0.16)',
    darkText: '#FCD34D',
  },
  pantry: {
    bg: '#F3EFFF',
    text: '#5B21B6',
    check: '#8B5CF6',
    darkBg: 'rgba(139, 92, 246, 0.18)',
    darkText: '#C4B5FD',
  },
  spices: {
    bg: '#FFF4EC',
    text: '#C2410C',
    check: '#F97316',
    darkBg: 'rgba(249, 115, 22, 0.18)',
    darkText: '#FDBA74',
  },
  frozen: {
    bg: '#EEF6FE',
    text: '#1D4ED8',
    check: '#3B82F6',
    darkBg: 'rgba(96, 165, 250, 0.18)',
    darkText: '#93C5FD',
  },
  bakery: {
    bg: '#FFF8E8',
    text: '#A16207',
    check: '#D97706',
    darkBg: 'rgba(217, 119, 6, 0.18)',
    darkText: '#FBBF24',
  },
  beverages: {
    bg: '#EAF9FB',
    text: '#0E7490',
    check: '#06B6D4',
    darkBg: 'rgba(6, 182, 212, 0.18)',
    darkText: '#67E8F9',
  },
  other: {
    bg: '#F5F5F7',
    text: '#4B5563',
    check: '#8966FA',
    darkBg: 'rgba(107, 114, 128, 0.2)',
    darkText: '#D1D5DB',
  },
};

export function getCategoryTint(category: IngredientCategory, isDark: boolean) {
  const c = categoryColors[category];
  return isDark
    ? { backgroundColor: c.darkBg, color: c.darkText, check: c.check }
    : { backgroundColor: c.bg, color: c.text, check: c.check };
}

export const CARD_MIN_HEIGHT = 64;
export const TOUCH_MIN = 44;
