export const STRIPE_PLANS = {
  one_class: {
    price_id: "price_1SyzkKBsH9cVZe17ws1axyhF",
    name: "1 Classe",
    students: 35,
    price: 499,
  },
  four_classes: {
    price_id: "price_1SyzlBBsH9cVZe17yfOTVIos",
    name: "4 Classes",
    students: 140,
    price: 1499,
  },
  year: {
    price_id: "price_1Syzm3BsH9cVZe17rosOCOW2",
    name: "Année complète",
    students: 500,
    price: 2999,
  },
  all_classes: {
    price_id: "price_1SyzmqBsH9cVZe17kcjdAFy4",
    name: "Toutes les classes",
    students: 2000,
    price: 3999,
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
