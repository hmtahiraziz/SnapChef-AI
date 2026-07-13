/**
 * Client-side ingredient auto-category classifier.
 * Pure function — no API calls, works fully offline.
 */

export type IngredientCategory =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'pantry'
  | 'spices'
  | 'frozen'
  | 'bakery'
  | 'beverages'
  | 'other';

export type CategoryMeta = {
  label: string;
  emoji: string;
  color: string;
};

export const CATEGORY_META: Record<IngredientCategory, CategoryMeta> = {
  produce:   { label: 'Produce',    emoji: '🥬', color: '#10B981' },
  meat:      { label: 'Meat & Fish', emoji: '🥩', color: '#EF4444' },
  dairy:     { label: 'Dairy',      emoji: '🧀', color: '#F59E0B' },
  pantry:    { label: 'Pantry',     emoji: '🫙', color: '#8B5CF6' },
  spices:    { label: 'Spices',     emoji: '🌶️', color: '#F97316' },
  frozen:    { label: 'Frozen',     emoji: '🧊', color: '#60A5FA' },
  bakery:    { label: 'Bakery',     emoji: '🍞', color: '#D97706' },
  beverages: { label: 'Beverages',  emoji: '🧃', color: '#06B6D4' },
  other:     { label: 'Other',      emoji: '🛒', color: '#6B7280' },
};

const KEYWORDS: Record<IngredientCategory, string[]> = {
  produce: [
    'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower',
    'carrot', 'celery', 'cucumber', 'zucchini', 'eggplant', 'aubergine', 'capsicum',
    'pepper', 'bell pepper', 'chilli', 'chili', 'tomato', 'potato', 'sweet potato',
    'yam', 'onion', 'shallot', 'leek', 'garlic', 'ginger', 'mushroom', 'asparagus',
    'corn', 'peas', 'bean', 'lentil', 'chickpea', 'apple', 'banana', 'orange',
    'lemon', 'lime', 'mango', 'pineapple', 'strawberry', 'blueberry', 'raspberry',
    'avocado', 'grape', 'watermelon', 'cherry', 'peach', 'pear', 'plum', 'kiwi',
    'coconut', 'beet', 'beetroot', 'radish', 'fennel', 'artichoke', 'okra', 'bok choy',
    'spring onion', 'scallion', 'cilantro', 'parsley', 'basil', 'mint', 'dill',
    'rosemary', 'thyme', 'sage', 'chive',
  ],
  meat: [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'goat',
    'mutton', 'bacon', 'ham', 'sausage', 'salami', 'prosciutto', 'pancetta',
    'guanciale', 'chorizo', 'pepperoni', 'mince', 'ground beef', 'ground pork',
    'steak', 'brisket', 'ribs', 'thigh', 'breast', 'wing', 'drumstick',
    'fillet', 'tenderloin', 'loin', 'shank',
    'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'trout', 'bass', 'snapper',
    'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'clam', 'mussel', 'oyster',
    'anchovy', 'sardine', 'mackerel', 'herring', 'squid', 'octopus',
  ],
  dairy: [
    'milk', 'cream', 'heavy cream', 'half and half', 'butter', 'ghee',
    'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'brie', 'gouda',
    'ricotta', 'cream cheese', 'cottage cheese', 'mascarpone', 'gruyere',
    'yogurt', 'sour cream', 'creme fraiche', 'buttermilk', 'condensed milk',
    'evaporated milk', 'whipping cream', 'egg', 'egg yolk', 'egg white',
  ],
  pantry: [
    'rice', 'pasta', 'noodle', 'spaghetti', 'penne', 'fusilli', 'linguine',
    'flour', 'bread crumb', 'cornstarch', 'cornflour', 'baking powder', 'baking soda',
    'yeast', 'sugar', 'brown sugar', 'honey', 'maple syrup', 'molasses',
    'oil', 'olive oil', 'vegetable oil', 'sesame oil', 'canola oil', 'coconut oil',
    'vinegar', 'soy sauce', 'fish sauce', 'oyster sauce', 'hoisin', 'worcestershire',
    'hot sauce', 'ketchup', 'mustard', 'mayonnaise', 'tahini', 'miso',
    'tomato paste', 'tomato sauce', 'canned tomato', 'stock', 'broth', 'bouillon',
    'canned', 'tinned', 'beans', 'lentils', 'chickpeas', 'quinoa', 'oats', 'oatmeal',
    'cereal', 'granola', 'nut', 'almond', 'walnut', 'cashew', 'pecan', 'peanut',
    'peanut butter', 'almond butter', 'seed', 'sesame', 'sunflower seed', 'pumpkin seed',
    'coconut milk', 'coconut cream',
  ],
  spices: [
    'salt', 'pepper', 'black pepper', 'white pepper', 'cumin', 'coriander',
    'turmeric', 'paprika', 'smoked paprika', 'cayenne', 'chili powder', 'chilli powder',
    'garam masala', 'curry powder', 'curry paste', 'za\'atar', 'sumac', 'cardamom',
    'cinnamon', 'clove', 'nutmeg', 'allspice', 'star anise', 'bay leaf',
    'oregano', 'thyme', 'rosemary', 'sage', 'tarragon', 'marjoram', 'basil dried',
    'dill dried', 'chive dried', 'onion powder', 'garlic powder', 'ginger powder',
    'mustard seed', 'fennel seed', 'caraway', 'saffron', 'vanilla', 'anise',
  ],
  frozen: [
    'frozen', 'ice cream', 'gelato', 'sorbet', 'frozen peas', 'frozen corn',
    'frozen spinach', 'frozen berries', 'frozen shrimp', 'frozen chicken', 'ice',
  ],
  bakery: [
    'bread', 'sourdough', 'baguette', 'pita', 'naan', 'flatbread', 'tortilla',
    'roll', 'bun', 'bagel', 'croissant', 'muffin', 'cake', 'biscuit', 'cookie',
    'cracker', 'wafer', 'pie crust', 'pastry', 'phyllo', 'puff pastry',
  ],
  beverages: [
    'water', 'juice', 'coffee', 'tea', 'wine', 'beer', 'vodka', 'rum', 'gin',
    'whiskey', 'brandy', 'champagne', 'soda', 'cola', 'lemonade', 'smoothie',
    'milk tea', 'kombucha', 'coconut water',
  ],
  other: [],
};

const _cache = new Map<string, IngredientCategory>();

export function categorizeIngredient(name: string): IngredientCategory {
  const key = name.toLowerCase().trim();
  if (_cache.has(key)) {
    return _cache.get(key)!;
  }

  for (const [cat, words] of Object.entries(KEYWORDS) as [IngredientCategory, string[]][]) {
    if (cat === 'other') continue;
    for (const word of words) {
      if (key.includes(word)) {
        _cache.set(key, cat);
        return cat;
      }
    }
  }

  _cache.set(key, 'other');
  return 'other';
}
