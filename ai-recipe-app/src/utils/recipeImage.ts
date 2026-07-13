/**
 * Deterministic food hero images for generated recipes (no API key required).
 * Matches title/cuisine keywords to curated Unsplash food photos.
 */

const FOOD_LIBRARY: { keys: string[]; url: string }[] = [
  {
    keys: ['biryani', 'pulao', 'pilaf', 'rice'],
    url: 'https://images.unsplash.com/photo-1563379091339-03b544ead772?w=900&q=80',
  },
  {
    keys: ['chicken', 'karahi', 'tikka', 'wings'],
    url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900&q=80',
  },
  {
    keys: ['beef', 'steak', 'meat', 'lamb', 'mutton', 'nihari'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
  },
  {
    keys: ['fish', 'seafood', 'prawn', 'shrimp', 'salmon'],
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80',
  },
  {
    keys: ['salad', 'bowl', 'greens', 'avocado'],
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
  },
  {
    keys: ['pasta', 'noodle', 'spaghetti', 'macaroni'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&q=80',
  },
  {
    keys: ['pizza', 'flatbread'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80',
  },
  {
    keys: ['soup', 'stew', 'dal', 'daal', 'broth', 'haleem'],
    url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80',
  },
  {
    keys: ['curry', 'masala', 'gravy', 'korma'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=80',
  },
  {
    keys: ['burger', 'sandwich', 'wrap'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
  },
  {
    keys: ['egg', 'omelette', 'breakfast'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80',
  },
  {
    keys: ['dessert', 'sweet', 'cake', 'kheer', 'halwa'],
    url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&q=80',
  },
  {
    keys: ['bread', 'roti', 'naan', 'paratha'],
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
  },
  {
    keys: ['vegetable', 'veggie', 'vegan', 'paneer'],
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=80',
  },
];

const FALLBACKS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=900&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&q=80',
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRecipeImageUrl(input: {
  id?: string;
  title?: string;
  cuisine?: string | null;
  country?: string | null;
  imageUrl?: string | null;
}): string {
  if (
    input.imageUrl &&
    (/^https?:\/\//i.test(input.imageUrl) ||
      /^file:\/\//i.test(input.imageUrl) ||
      /^content:\/\//i.test(input.imageUrl) ||
      input.imageUrl.startsWith('data:image/'))
  ) {
    return input.imageUrl;
  }

  const haystack = `${input.title ?? ''} ${input.cuisine ?? ''} ${input.country ?? ''}`.toLowerCase();

  for (const entry of FOOD_LIBRARY) {
    if (entry.keys.some((key) => haystack.includes(key))) {
      return entry.url;
    }
  }

  const seed = hashSeed(input.id || input.title || 'snapchef');
  return FALLBACKS[seed % FALLBACKS.length];
}
