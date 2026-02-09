export const STRIPE_PLANS = {
  one_class: {
    price_id: "price_1SywRVB5EuLkf750L4xWLKUe",
    name: "1 Classe",
    students: 35,
    price: 499,
  },
  four_classes: {
    price_id: "price_1SyzG8B5EuLkf750DHPT9R1J",
    name: "4 Classes",
    students: 140,
    price: 1499,
  },
  year: {
    price_id: "price_1SyzIAB5EuLkf750dqAkLNap",
    name: "Année complète",
    students: 500,
    price: 2999,
  },
  all_classes: {
    price_id: "price_1SyzIfB5EuLkf750CJrSragW",
    name: "Toutes les classes",
    students: 2000,
    price: 3999,
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
