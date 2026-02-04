// Types for bulletin analysis (oral presentation for class council)

export interface BulletinAnalysisCategory {
  id: 'resultats' | 'travail' | 'comportement' | 'assiduite' | 'positif' | 'negatif';
  label: string;
  icon: string;
  color: string; // semantic color class
}

export interface BulletinJustification {
  categorie: BulletinAnalysisCategory['id'];
  matiere: string;
  extrait: string;
  motsCles: { word: string; type: 'positif' | 'negatif' | 'alerte' }[];
}

export interface BulletinEvolution {
  difference: number;
  direction: 'hausse' | 'baisse' | 'stable';
  moyennePrecedente: number;
  moyenneActuelle: number;
}

export interface StudentBulletinAnalysis {
  evolutionMoyenne?: BulletinEvolution;
  analyseTexte: string; // Generated oral presentation text (3-6 sentences)
  justifications: BulletinJustification[];
}

// Category configuration
export const ANALYSIS_CATEGORIES: Record<BulletinAnalysisCategory['id'], BulletinAnalysisCategory> = {
  resultats: {
    id: 'resultats',
    label: 'Résultats',
    icon: '📊',
    color: 'text-blue-600'
  },
  travail: {
    id: 'travail',
    label: 'Travail personnel',
    icon: '📝',
    color: 'text-slate-600'
  },
  comportement: {
    id: 'comportement',
    label: 'Comportement',
    icon: '⚠️',
    color: 'text-amber-600'
  },
  assiduite: {
    id: 'assiduite',
    label: 'Assiduité',
    icon: '📅',
    color: 'text-purple-600'
  },
  positif: {
    id: 'positif',
    label: 'Points positifs',
    icon: '✨',
    color: 'text-emerald-600'
  },
  negatif: {
    id: 'negatif',
    label: 'Points de vigilance',
    icon: '🔴',
    color: 'text-red-600'
  }
};

// Keywords for highlighting
export const POSITIVE_KEYWORDS = [
  'excellent', 'félicitations', 'progrès', 'sérieux', 'investi', 'brillant',
  'remarquable', 'très bien', 'satisfaisant', 'encourageant', 'appliqué',
  'travailleur', 'motivé', 'volontaire', 'assidu', 'impliqué', 'dynamique',
  'actif', 'consciencieux', 'régulier', 'persévérant'
];

export const NEGATIVE_KEYWORDS = [
  'insuffisant', 'bavardages', 'difficultés', 'fragile', 'dissipé',
  'distrait', 'irrégulier', 'passif', 'négligent', 'superficiel',
  'léger', 'en retrait', 'manque', 'faible', 'lacunes'
];

export const ALERT_KEYWORDS = [
  'irrespect', 'absence', 'non rendu', 'inacceptable', 'insolent',
  'perturbateur', 'provocateur', 'irrespectueux', 'avertissement',
  'grave', 'préoccupant', 'déplorable', 'inadmissible'
];
