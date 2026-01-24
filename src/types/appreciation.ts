export type AppreciationTone = 'severe' | 'standard' | 'caring' | 'praising';

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
    icon: 'Minus',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600',
    borderColor: 'border-slate-600',
  },
  caring: {
    label: 'Bienveillant',
    icon: 'Heart',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
  },
  praising: {
    label: 'Élogieux',
    icon: 'Award',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500',
  },
};
