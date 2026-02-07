import { ClasseDataCSV, EleveData } from "@/utils/csvParser";
import { BulletinClasseData } from "@/utils/pdfParser";
import { calculateClassAverage, calculateStdDev, getSubjectAverages } from "@/utils/statisticsCalculations";

/**
 * Themes identified from teacher appreciations
 */
export interface AppreciationThemes {
  // Academic results
  fragile: number;
  solide: number;
  heterogene: number;
  progressif: number;

  // Work atmosphere
  serieux: number;
  bavardages: number;
  participation: number;
  concentration: number;
  investissement: number;
  passif: number;
  difficile: number;

  // Student relations
  bonneAmbiance: number;
  cohesion: number;
  tensions: number;
  respect: number;

  // Points of attention
  absences: number;
  retards: number;
  travail: number;
  comportement: number;
}

/**
 * Exceptional subjects identified
 */
export interface ExceptionalSubjects {
  exceptional: string[];
  struggling: string[];
}

/**
 * Keywords for each theme (French educational context)
 */
const themeKeywords: Record<keyof AppreciationThemes, string[]> = {
  fragile: ["fragile", "difficultés", "en difficulté", "faible", "lacunes", "insuffisant"],
  solide: ["solide", "bon niveau", "satisfaisant", "correct", "acquis", "maîtrisé"],
  heterogene: ["hétérogène", "disparités", "écarts", "inégal", "différences", "contrasté"],
  progressif: ["progrès", "progression", "amélioration", "évolution positive", "avance"],
  serieux: ["sérieux", "appliqué", "studieux", "travailleur", "rigoureux", "consciencieux"],
  bavardages: ["bavard", "bavardages", "agité", "dissipé", "remuant", "perturbateur"],
  participation: ["participe", "participation", "actif", "timide", "discret", "intervient"],
  concentration: ["concentré", "attentif", "distrait", "inattentif", "écoute"],
  investissement: ["investi", "motivé", "impliqué", "engagé", "volontaire"],
  passif: ["passif", "peu impliqué", "effacé", "en retrait", "démotivé"],
  difficile: ["difficile", "pénible", "compliqué", "problématique", "classe difficile"],
  bonneAmbiance: ["bonne ambiance", "agréable", "sympathique", "climat positif", "cordial"],
  cohesion: ["cohésion", "solidaire", "entraide", "groupe soudé", "équipe"],
  tensions: ["tensions", "conflits", "difficultés relationnelles", "disputes", "incident"],
  respect: ["respectueux", "poli", "insolent", "irrespectueux", "courtois"],
  absences: ["absences", "absentéisme", "absent", "manque"],
  retards: ["retards", "ponctualité", "en retard", "régularité"],
  travail: ["travail non fait", "devoirs non rendus", "devoir manquant", "travail insuffisant"],
  comportement: ["comportement", "attitude", "conduite", "discipline"],
};

/**
 * Analyze teacher appreciations to extract themes
 * Accepts either a string array or BulletinClasseData
 */
export function analyzeTeacherAppreciations(input: string[] | BulletinClasseData): AppreciationThemes {
  const themes: AppreciationThemes = {
    fragile: 0,
    solide: 0,
    heterogene: 0,
    progressif: 0,
    serieux: 0,
    bavardages: 0,
    participation: 0,
    concentration: 0,
    investissement: 0,
    passif: 0,
    difficile: 0,
    bonneAmbiance: 0,
    cohesion: 0,
    tensions: 0,
    respect: 0,
    absences: 0,
    retards: 0,
    travail: 0,
    comportement: 0,
  };

  // Extract appreciations from input
  let appreciations: string[] = [];
  if (Array.isArray(input)) {
    appreciations = input;
  } else if (input && typeof input === 'object' && 'matieres' in input) {
    // BulletinClasseData - extract appreciations from each matière
    appreciations = input.matieres.map(m => m.appreciation).filter(Boolean);
  }

  appreciations.forEach((appreciation) => {
    if (!appreciation) return;
    const lower = appreciation.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, words]) => {
      words.forEach((word) => {
        if (lower.includes(word)) {
          themes[theme as keyof AppreciationThemes]++;
        }
      });
    });
  });

  return themes;
}

/**
 * Identify subjects that are exceptionally different from the class average
 * Accepts either ClasseDataCSV or BulletinClasseData
 */
export function identifyExceptionalSubjects(
  classeData: ClasseDataCSV | BulletinClasseData,
  threshold: number = 4,
): ExceptionalSubjects {
  const exceptional: string[] = [];
  const struggling: string[] = [];

  // Handle ClasseDataCSV type
  if ('eleves' in classeData && 'poles' in classeData) {
    const subjects = getSubjectAverages(classeData as ClasseDataCSV);
    const generalAverage = calculateClassAverage((classeData as ClasseDataCSV).eleves);

    subjects.forEach((subject) => {
      const diff = subject.currentAvg - generalAverage;

      if (diff >= threshold) {
        exceptional.push(subject.name);
      }
      if (diff <= -threshold) {
        struggling.push(subject.name);
      }
    });
  } 
  // Handle BulletinClasseData type
  else if ('matieres' in classeData) {
    const bulletinData = classeData as BulletinClasseData;
    const validMatieres = bulletinData.matieres.filter(m => m.moyenne !== undefined && !isNaN(m.moyenne));
    
    if (validMatieres.length > 0) {
      const generalAverage = validMatieres.reduce((sum, m) => sum + (m.moyenne || 0), 0) / validMatieres.length;
      
      validMatieres.forEach((matiere) => {
        const diff = (matiere.moyenne || 0) - generalAverage;

        if (diff >= threshold) {
          exceptional.push(matiere.nom);
        }
        if (diff <= -threshold) {
          struggling.push(matiere.nom);
        }
      });
    }
  }

  return { exceptional, struggling };
}

/**
 * Derive themes from statistical data when teacher appreciations are not available
 */
export function deriveThemesFromStats(classeData: ClasseDataCSV): AppreciationThemes {
  const themes: AppreciationThemes = {
    fragile: 0,
    solide: 0,
    heterogene: 0,
    progressif: 0,
    serieux: 0,
    bavardages: 0,
    participation: 0,
    concentration: 0,
    investissement: 0,
    passif: 0,
    difficile: 0,
    bonneAmbiance: 0,
    cohesion: 0,
    tensions: 0,
    respect: 0,
    absences: 0,
    retards: 0,
    travail: 0,
    comportement: 0,
  };

  const average = calculateClassAverage(classeData.eleves);
  const stdDev = calculateStdDev(classeData.eleves);
  const validEleves = classeData.eleves.filter((e) => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null);

  // Academic results based on class average
  if (average >= 13) {
    themes.solide = 5;
    themes.serieux = 4;
  } else if (average >= 11) {
    themes.solide = 3;
    themes.serieux = 2;
  } else if (average >= 9) {
    themes.fragile = 2;
    themes.solide = 1;
  } else {
    themes.fragile = 5;
  }

  // Heterogeneity based on std dev
  if (stdDev >= 3) {
    themes.heterogene = 5;
  } else if (stdDev >= 2.5) {
    themes.heterogene = 3;
  } else if (stdDev >= 1.5) {
    themes.heterogene = 1;
  }

  // Absences and delays
  const avgAbsences = classeData.statistiques.totalAbsences / validEleves.length;
  const avgRetards = classeData.statistiques.totalRetards / validEleves.length;

  if (avgAbsences > 8) {
    themes.absences = 4;
  } else if (avgAbsences > 4) {
    themes.absences = 2;
  }

  if (avgRetards > 5) {
    themes.retards = 4;
  } else if (avgRetards > 2) {
    themes.retards = 2;
  }

  // Distribution analysis for participation
  const excellentCount = validEleves.filter((e) => e.moyenneGenerale >= 14).length;
  const strugglingCount = validEleves.filter((e) => e.moyenneGenerale < 10).length;

  if (excellentCount / validEleves.length > 0.3) {
    themes.investissement = 4;
    themes.participation = 3;
  } else if (excellentCount / validEleves.length > 0.15) {
    themes.investissement = 2;
    themes.participation = 2;
  }

  if (strugglingCount / validEleves.length > 0.4) {
    themes.passif = 3;
    themes.travail = 2;
  } else if (strugglingCount / validEleves.length > 0.25) {
    themes.passif = 1;
  }

  // Default positive atmosphere indicators for balanced classes
  if (average >= 10 && stdDev < 3) {
    themes.bonneAmbiance = 2;
    themes.respect = 2;
  }

  return themes;
}

/**
 * Format subject name for display
 */
export function formatSubjectName(name: string): string {
  const shortNames: Record<string, string> = {
    "HISTOIRE-GÉOGRAPHIE": "Histoire-géographie",
    "PHYSIQUE-CHIMIE": "Physique-chimie",
    "ÉDUCATION MUSICALE": "Éducation musicale",
    "ARTS PLASTIQUES": "Arts plastiques",
    MATHEMATIQUES: "Mathématiques",
    FRANÇAIS: "Français",
    "ANGLAIS LV1": "Anglais",
    "ESPAGNOL LV2": "Espagnol",
    TECHNOLOGIE: "Technologie",
    EPS: "EPS",
    SVT: "SVT",
  };
  return shortNames[name.toUpperCase()] || name.charAt(0) + name.slice(1).toLowerCase();
}
