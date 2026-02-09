export const STRIPE_PLANS = {
  one_class: {
    price_id: 'price_PLACEHOLDER_ONE_CLASS',  // ← REMPLACER par le vrai Price ID Stripe
    name: '1 Classe',
    students: 35,
    price: 499,
  },
  four_classes: {
    price_id: 'price_PLACEHOLDER_FOUR_CLASSES',  // ← REMPLACER
    name: '4 Classes',
    students: 140,
    price: 1499,
  },
  year: {
    price_id: 'price_PLACEHOLDER_YEAR',  // ← REMPLACER
    name: 'Année complète',
    students: 500,
    price: 2999,
  },
  all_classes: {
    price_id: 'price_PLACEHOLDER_ALL_CLASSES',  // ← REMPLACER
    name: 'Toutes les classes',
    students: 2000,
    price: 3999,
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
