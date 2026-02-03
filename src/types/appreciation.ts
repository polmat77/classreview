export type AppreciationTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

export const toneConfig: Record<AppreciationTone, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  severe: {
    label: 'Sévère',
    icon: 'AlertTriangle',
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-600',
  },
  standard: {
    label: 'Standard',
    icon: 'BarChart3',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-600',
  },
  encourageant: {
    label: 'Encourageant',
    icon: 'ThumbsUp',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
  },
  elogieux: {
    label: 'Élogieux',
    icon: 'Star',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500',
  },
};
