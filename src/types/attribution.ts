export type Attribution = 
  | 'warning_work' 
  | 'warning_conduct' 
  | 'warning_both' 
  | 'encouragement' 
  | 'honor' 
  | 'congratulations';

export type WorkLevel = 'excellent' | 'good' | 'average' | 'insufficient';
export type ConductLevel = 'good' | 'problematic';

export interface AttributionConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  isNegative: boolean;
}

export const attributionConfig: Record<Attribution, AttributionConfig> = {
  warning_work: {
    label: 'Avertissement Travail',
    shortLabel: 'Avert. Travail',
    color: 'hsl(24, 95%, 53%)', // Orange #F97316
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    icon: 'AlertTriangle',
    isNegative: true,
  },
  warning_conduct: {
    label: 'Avertissement Conduite',
    shortLabel: 'Avert. Conduite',
    color: 'hsl(0, 84%, 60%)', // Rouge #EF4444
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    icon: 'AlertCircle',
    isNegative: true,
  },
  warning_both: {
    label: 'Avertissement Travail & Conduite',
    shortLabel: 'Avert. Travail & Conduite',
    color: 'hsl(0, 72%, 51%)', // Rouge foncé #DC2626
    bgColor: 'bg-red-600',
    borderColor: 'border-red-600',
    icon: 'XCircle',
    isNegative: true,
  },
  encouragement: {
    label: 'Encouragements',
    shortLabel: 'Encouragements',
    color: 'hsl(217, 91%, 60%)', // Bleu #3B82F6
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    icon: 'ThumbsUp',
    isNegative: false,
  },
  honor: {
    label: 'Tableau d\'honneur',
    shortLabel: 'Tableau d\'honneur',
    color: 'hsl(160, 84%, 39%)', // Vert #10B981
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    icon: 'Star',
    isNegative: false,
  },
  congratulations: {
    label: 'Félicitations',
    shortLabel: 'Félicitations',
    color: 'hsl(258, 90%, 66%)', // Violet #8B5CF6
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-500',
    icon: 'Trophy',
    isNegative: false,
  },
};

export interface ConductAnalysis {
  hasConductIssues: boolean;
  detectedKeywords: string[];
  relevantExcerpts: { subject: string; excerpt: string; keyword: string }[];
}

export interface StudentAttribution {
  attribution: Attribution | null;
  suggestedAttribution: Attribution | null;
  isManuallySet: boolean;
  conductAnalysis: ConductAnalysis;
}
