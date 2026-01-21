// Types for ReportCardAI application

export interface Student {
  id: number;
  lastName: string;
  firstName: string;
  average: number | null;
  seriousness?: number | null; // Note "Sérieux général en classe"
  participation?: number | null; // Note "Participation orale"
  absences?: number;
  nonRendus?: number; // "N.Rdu" count
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

export interface GeneratedAppreciation {
  studentId: number;
  text: string;
  characterCount: number;
  isEditing: boolean;
  isGenerating: boolean;
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
}

export interface ReportCardState {
  students: Student[];
  classMetadata: ClassMetadata | null;
  observations: StudentObservations;
  appreciations: GeneratedAppreciation[];
  classSummary: ClassSummary;
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
