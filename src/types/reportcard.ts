// Types for ReportCardAI application

export interface StudentStats {
  totalNotes: number;      // Total valid grades
  nonRendus: number;       // "N.Rdu" count
  notesAbove10: number;    // Grades >= 10
  notesBelow10: number;    // Grades < 10
}

export interface Student {
  id: number;
  lastName: string;
  firstName: string;
  average: number | null;
  grades?: (number | string)[];  // Individual grades from PDF
  stats?: StudentStats;          // Calculated statistics
  seriousness?: number | null;   // Note "Sérieux général en classe"
  participation?: number | null; // Note "Participation orale"
  absences?: number;
  nonRendus?: number;            // "N.Rdu" count (legacy, now in stats)
  appreciations?: string[];
}

export interface ClassMetadata {
  className: string;
  subject: string;
  teacher: string;
  period: string;
  classAverage?: number;
}

export interface BehaviorObservation {
  studentIds: number[];
  description: string;
  individualNotes?: Record<number, string>; // Notes individuelles par élève
}

export interface TalkativeObservation {
  studentIds: number[];
}

export interface SpecificObservation {
  studentId: number;
  observation: string;
}

export interface StudentObservations {
  behavior: BehaviorObservation | null;
  talkative: TalkativeObservation | null;
  specific: SpecificObservation[];
}

export type AppreciationTone = 'neutre' | 'encourageant' | 'constructif' | 'ferme' | 'bienveillant';

export interface ToneOption {
  value: AppreciationTone;
  label: string;
  description: string;
}

export const toneOptions: ToneOption[] = [
  { value: 'neutre', label: 'Neutre et factuel', description: 'Ton professionnel et objectif, basé sur les faits' },
  { value: 'encourageant', label: 'Encourageant', description: 'Souligne les points positifs et motive l\'élève' },
  { value: 'constructif', label: 'Constructif', description: 'Met l\'accent sur les axes d\'amélioration avec bienveillance' },
  { value: 'ferme', label: 'Ferme mais juste', description: 'Ton plus direct pour les situations problématiques' },
  { value: 'bienveillant', label: 'Bienveillant', description: 'Ton chaleureux et empathique, adapté aux élèves fragiles' },
];

export interface AppreciationSettings {
  maxCharacters: number;
  defaultTone: AppreciationTone;
  individualTones: Record<number, AppreciationTone>;
}

export interface GeneratedAppreciation {
  studentId: number;
  text: string;
  characterCount: number;
  isEditing: boolean;
  isGenerating: boolean;
  tone?: AppreciationTone;
}

export interface ClassSummaryOptions {
  workLevel: 'serious' | 'average' | 'scattered' | 'lack' | null;
  behavior: 'respectful' | 'talkative' | 'turbulent' | 'disrespectful' | null;
  participation: 'active' | 'inconsistent' | 'insufficient' | 'passive' | null;
  progression: 'improving' | 'stagnant' | 'declining' | 'disparate' | null;
}

export interface ClassSummary {
  options: ClassSummaryOptions;
  generatedText: string;
  isEditing: boolean;
  tone?: AppreciationTone;
  maxCharacters?: number;
}

export interface ReportCardState {
  students: Student[];
  classMetadata: ClassMetadata | null;
  observations: StudentObservations;
  appreciations: GeneratedAppreciation[];
  classSummary: ClassSummary;
  appreciationSettings: AppreciationSettings;
  currentStep: number;
  subject?: string;
  teacherName?: string;
}

// Labels for class summary options (French)
export const workLevelLabels: Record<string, string> = {
  serious: 'Sérieuse et impliquée',
  average: 'Moyennement investie',
  scattered: 'Dispersée et peu rigoureuse',
  lack: 'Manque total de sérieux',
};

export const behaviorLabels: Record<string, string> = {
  respectful: 'Respectueuse et attentive',
  talkative: 'Bavarde mais travailleuse',
  turbulent: 'Turbulente et peu disciplinée',
  disrespectful: 'Manque de respect fréquent',
};

export const participationLabels: Record<string, string> = {
  active: 'Participation active et pertinente',
  inconsistent: 'Participation correcte mais inconstante',
  insufficient: 'Participation insuffisante',
  passive: 'Classe amorphe et passive',
};

export const progressionLabels: Record<string, string> = {
  improving: 'En progression continue',
  stagnant: 'Stagnation dans les résultats',
  declining: 'Baisse inquiétante des résultats',
  disparate: 'Forte disparité entre les élèves',
};

// Quick observation suggestions
export const quickObservationSuggestions = [
  "fait des efforts",
  "très passif",
  "souvent en retard",
  "excellente progression",
  "manque de travail personnel",
  "très investi à l'oral",
  "travail irrégulier",
  "élève sérieux",
  "difficultés persistantes",
  "bonne attitude",
];
