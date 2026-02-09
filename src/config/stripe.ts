export const STRIPE_PLANS = {
  one_class: {
    price_id: "prod_TwtXiTZCBGuerE", // ← REMPLACER par le vrai Price ID Stripe
    name: "1 Classe",
    students: 35,
    price: 499,
  },
  four_classes: {
    price_id: "prod_TwtYFuAFTREVP8", // ← REMPLACER
    name: "4 Classes",
    students: 140,
    price: 1499,
  },
  year: {
    price_id: "prod_TwtZB0ob9lcmws", // ← REMPLACER
    name: "Année complète",
    students: 500,
    price: 2999,
  },
  all_classes: {
    price_id: "prod_Twta1BPo7XLZ91", // ← REMPLACER
    name: "Toutes les classes",
    students: 2000,
    price: 3999,
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
