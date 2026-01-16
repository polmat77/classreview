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
    color: 'text-destructive',
    bgColor: 'bg-destructive',
    borderColor: 'border-destructive',
  },
  standard: {
    label: 'Standard',
    icon: 'Minus',
    color: 'text-muted-foreground',
    bgColor: 'bg-secondary',
    borderColor: 'border-secondary',
  },
  caring: {
    label: 'Bienveillant',
    icon: 'Heart',
    color: 'text-success',
    bgColor: 'bg-success',
    borderColor: 'border-success',
  },
  praising: {
    label: 'Élogieux',
    icon: 'Trophy',
    color: 'text-warning',
    bgColor: 'bg-warning',
    borderColor: 'border-warning',
  },
};
