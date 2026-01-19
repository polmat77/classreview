export type AnonymizationLevel = 'standard' | 'maximal';

export const ANONYMIZATION_LEVELS = {
  standard: {
    id: 'standard',
    label: 'Standard',
    shortLabel: 'Standard',
    description: 'Le prénom est remplacé par {prénom} avant l\'envoi, puis réinjecté automatiquement.',
    icon: 'Shield',
    recommended: true
  },
  maximal: {
    id: 'maximal',
    label: 'Maximal',
    shortLabel: 'Maximal',
    description: 'Le prénom reste affiché comme {prénom}. Vous le remplacerez manuellement.',
    icon: 'ShieldCheck',
    recommended: false
  }
} as const;

export const FIRST_NAME_PLACEHOLDER = '{prénom}';
