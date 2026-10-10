import {
  Award,
  Baby,
  Banknote,
  Bike,
  Book,
  Briefcase,
  Building2,
  Bus,
  Car,
  Coffee,
  Coins,
  CreditCard,
  Droplets,
  Dumbbell,
  Film,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Target,
  Train,
  TrendingUp,
  Tv,
  Umbrella,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react'

// Category icons.
//
// A curated, statically imported set — never lucide's `DynamicIcon`,
// `dynamicIconImports` or the `icons` map, which pull ~4k modules into the
// graph and defeat tree-shaking. The `id`s are persisted in `categories.icon`,
// so they never change; only the component behind an id may.
//
// Icons are a SECOND cue next to the name, never a replacement for it
// (decisions.md 2026-09-28: colour — and now icon — is never the sole carrier
// of category identity).
export const CATEGORY_ICONS = [
  { id: 'utensils', Icon: UtensilsCrossed, label: 'Food' },
  { id: 'cart', Icon: ShoppingCart, label: 'Groceries' },
  { id: 'coffee', Icon: Coffee, label: 'Coffee' },
  { id: 'home', Icon: House, label: 'Home' },
  { id: 'sofa', Icon: Sofa, label: 'Furniture' },
  { id: 'zap', Icon: Zap, label: 'Electricity' },
  { id: 'droplets', Icon: Droplets, label: 'Water' },
  { id: 'flame', Icon: Flame, label: 'Gas' },
  { id: 'wifi', Icon: Wifi, label: 'Internet' },
  { id: 'phone', Icon: Smartphone, label: 'Phone' },
  { id: 'car', Icon: Car, label: 'Car' },
  { id: 'fuel', Icon: Fuel, label: 'Fuel' },
  { id: 'bus', Icon: Bus, label: 'Bus' },
  { id: 'train', Icon: Train, label: 'Train' },
  { id: 'bike', Icon: Bike, label: 'Bike' },
  { id: 'plane', Icon: Plane, label: 'Travel' },
  { id: 'bag', Icon: ShoppingBag, label: 'Shopping' },
  { id: 'shirt', Icon: Shirt, label: 'Clothes' },
  { id: 'scissors', Icon: Scissors, label: 'Personal care' },
  { id: 'health', Icon: HeartPulse, label: 'Health' },
  { id: 'pill', Icon: Pill, label: 'Medicine' },
  { id: 'dumbbell', Icon: Dumbbell, label: 'Fitness' },
  { id: 'film', Icon: Film, label: 'Movies' },
  { id: 'tv', Icon: Tv, label: 'Subscriptions' },
  { id: 'music', Icon: Music, label: 'Music' },
  { id: 'game', Icon: Gamepad2, label: 'Games' },
  { id: 'book', Icon: Book, label: 'Books' },
  { id: 'education', Icon: GraduationCap, label: 'Education' },
  { id: 'baby', Icon: Baby, label: 'Kids' },
  { id: 'pet', Icon: PawPrint, label: 'Pets' },
  { id: 'gift', Icon: Gift, label: 'Gifts' },
  { id: 'heart', Icon: Heart, label: 'Charity' },
  { id: 'wrench', Icon: Wrench, label: 'Repairs' },
  { id: 'receipt', Icon: Receipt, label: 'Bills' },
  { id: 'card', Icon: CreditCard, label: 'Card' },
  { id: 'bank', Icon: Landmark, label: 'Bank' },
  { id: 'umbrella', Icon: Umbrella, label: 'Insurance' },
  { id: 'shield', Icon: ShieldCheck, label: 'Emergency' },
  { id: 'briefcase', Icon: Briefcase, label: 'Salary' },
  { id: 'laptop', Icon: Laptop, label: 'Freelance' },
  { id: 'building', Icon: Building2, label: 'Business' },
  { id: 'trending', Icon: TrendingUp, label: 'Investment' },
  { id: 'coins', Icon: Coins, label: 'Interest' },
  { id: 'hand-coins', Icon: HandCoins, label: 'Refund' },
  { id: 'banknote', Icon: Banknote, label: 'Cash' },
  { id: 'wallet', Icon: Wallet, label: 'Wallet' },
  { id: 'award', Icon: Award, label: 'Bonus' },
  { id: 'piggy', Icon: PiggyBank, label: 'Savings' },
  { id: 'target', Icon: Target, label: 'Goal' },
  { id: 'sparkles', Icon: Sparkles, label: 'Fun' },
  { id: 'tag', Icon: Tag, label: 'Other' },
]

export const FALLBACK_ICON_ID = 'tag'

const ICONS_BY_ID = new Map(CATEGORY_ICONS.map((icon) => [icon.id, icon]))

export function isValidIconId(id) {
  return typeof id === 'string' && ICONS_BY_ID.has(id)
}

// Ordered: the first matching rule wins, so more specific words come first
// ("fuel" before "car", "grocer" before "food"). Matching is on lower-case
// substrings so "Food & Dining", "Groceries" and "Uber rides" all resolve.
const KEYWORD_RULES = [
  // Before 'rent'/'home' ('premium' contains 'emi') and 'car' ('card').
  [['insurance', 'premium'], 'umbrella'],
  [['credit card', 'card'], 'card'],
  [['grocer', 'supermarket', 'vegetable', 'kirana'], 'cart'],
  [['coffee', 'cafe', 'tea'], 'coffee'],
  [['food', 'dining', 'restaurant', 'eat', 'lunch', 'dinner', 'breakfast', 'swiggy', 'zomato', 'snack'], 'utensils'],
  [['rent', 'home', 'house', 'housing', 'mortgage', 'emi'], 'home'],
  [['furniture', 'decor', 'household'], 'sofa'],
  [['electric', 'power', 'utilit'], 'zap'],
  [['water'], 'droplets'],
  [['gas', 'lpg', 'cylinder'], 'flame'],
  [['internet', 'wifi', 'broadband'], 'wifi'],
  [['phone', 'mobile', 'recharge'], 'phone'],
  [['fuel', 'petrol', 'diesel'], 'fuel'],
  [['bus', 'metro'], 'bus'],
  [['train', 'rail'], 'train'],
  [['bike', 'scooter', 'cycle'], 'bike'],
  [['transport', 'cab', 'taxi', 'uber', 'auto', 'car', 'parking', 'commute'], 'car'],
  [['travel', 'flight', 'trip', 'holiday', 'vacation', 'hotel'], 'plane'],
  [['cloth', 'apparel', 'fashion'], 'shirt'],
  [['shopping', 'amazon', 'flipkart'], 'bag'],
  [['salon', 'haircut', 'grooming', 'personal care', 'beauty'], 'scissors'],
  [['medicine', 'pharma', 'chemist'], 'pill'],
  [['health', 'medical', 'doctor', 'hospital'], 'health'],
  [['gym', 'fitness', 'sport', 'yoga'], 'dumbbell'],
  [['movie', 'cinema', 'entertainment', 'outing'], 'film'],
  [['subscription', 'netflix', 'streaming', 'tv'], 'tv'],
  [['music', 'spotify'], 'music'],
  [['game', 'gaming'], 'game'],
  [['book'], 'book'],
  [['education', 'school', 'college', 'course', 'tuition', 'fees'], 'education'],
  [['kid', 'child', 'baby'], 'baby'],
  [['pet', 'dog', 'cat'], 'pet'],
  [['gift', 'present'], 'gift'],
  [['charity', 'donation'], 'heart'],
  [['repair', 'maintenance', 'service'], 'wrench'],
  [['bill'], 'receipt'],
  [['emergency'], 'shield'],
  [['salary', 'payroll', 'wage', 'job'], 'briefcase'],
  [['freelance', 'consult', 'side'], 'laptop'],
  [['business'], 'building'],
  [['invest', 'stock', 'mutual', 'sip', 'dividend', 'share'], 'trending'],
  [['interest'], 'coins'],
  [['refund', 'cashback', 'reimburse'], 'hand-coins'],
  [['bonus', 'award', 'prize'], 'award'],
  [['cash'], 'banknote'],
  [['saving', 'fd', 'deposit', 'ppf'], 'piggy'],
  [['goal'], 'target'],
  [['fun', 'party', 'leisure'], 'sparkles'],
  [['bank'], 'bank'],
]

/** Best-guess icon id for a category name. Always returns a valid id. */
export function defaultIconForName(name, { isSavings = false } = {}) {
  const lower = String(name ?? '').trim().toLowerCase()
  if (lower) {
    for (const [words, id] of KEYWORD_RULES) {
      if (words.some((word) => lower.includes(word))) return id
    }
  }
  return isSavings ? 'piggy' : FALLBACK_ICON_ID
}

/**
 * Icon id for a category-like object `{ icon?, name?, is_savings?, goal_id? }`.
 * A stored id wins; an unknown or missing one falls back to the name default,
 * so older rows, deleted categories (snapshot only) and old backups all render.
 */
export function getCategoryIconId(category) {
  if (!category) return FALLBACK_ICON_ID
  if (isValidIconId(category.icon)) return category.icon
  if (category.goal_id) return 'target'
  return defaultIconForName(category.name, { isSavings: Boolean(category.is_savings) })
}

export function getCategoryIconComponent(category) {
  return ICONS_BY_ID.get(getCategoryIconId(category))?.Icon ?? Tag
}

export function getIconComponentById(id) {
  return ICONS_BY_ID.get(id)?.Icon ?? Tag
}
