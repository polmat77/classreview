import { ClasseDataCSV, EleveData } from '@/utils/csvParser';
import { calculateClassAverage, calculateStdDev, getSubjectAverages } from '@/utils/statisticsCalculations';

export interface ClassMetadata {
  className: string;
  period: string;
  studentCount: number;
  mainTeacher: string;
}

export interface GradeTranche {
  min: number;
  max: number;
  label: string;
  count: number;
}

export interface ClassSummaryData {
  metadata: ClassMetadata;
  averageGeneral: number;
  standardDeviation: number;
  tranches: GradeTranche[];
  topSubjects: { name: string; average: number }[];
  weakSubjects: { name: string; average: number }[];
  totalAbsences: number;
  totalDelays: number;
  maxAbsences: number;
}

/**
 * Extract metadata from PDF text lines
 */
export function extractMetadataFromPDF(rawText: string): Partial<ClassMetadata> {
  const metadata: Partial<ClassMetadata> = {};
  
  // Extract class name - patterns like "Classe : 53" or "Classe : 5E3" or "5ème 3"
  const classeMatch = rawText.match(/Classe\s*[:\-]?\s*([^\n]+)/i);
  if (classeMatch) {
    let className = classeMatch[1].trim();
    // Normalize class codes: "53" → "5e3", "42" → "4e2"
    const codeMatch = className.match(/^(\d)(\d)$/);
    if (codeMatch) {
      className = `${codeMatch[1]}e${codeMatch[2]}`;
    }
    // Normalize "5ème 3" or "5E3"
    const altMatch = className.match(/(\d)(?:ème|e|E)\s*(\d)/i);
    if (altMatch) {
      className = `${altMatch[1]}e${altMatch[2]}`;
    }
    metadata.className = className;
  }
  
  // Extract period - patterns like "Période : Trimestre 1"
  const periodeMatch = rawText.match(/Période\s*[:\-]?\s*([^\n]+)/i);
  if (periodeMatch) {
    metadata.period = periodeMatch[1].trim();
  }
  
  // Extract student count - patterns like "23 élèves"
  const elevesMatch = rawText.match(/(\d+)\s*élèves?/i);
  if (elevesMatch) {
    metadata.studentCount = parseInt(elevesMatch[1]);
  }
  
  // Extract main teacher - patterns like "Professeur principal : M. DUPONT"
  const ppMatch = rawText.match(/Professeur\s+principal\s*[:\-]?\s*([^\n]+)/i);
  if (ppMatch) {
    metadata.mainTeacher = ppMatch[1].trim();
  }
  
  return metadata;
}

/**
 * Calculate grade distribution by tranches
 */
export function calculateGradeTranches(eleves: EleveData[]): GradeTranche[] {
  const validEleves = eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null);
  
  const tranches: GradeTranche[] = [
    { min: 0, max: 8, label: "en grande difficulté (moins de 8)", count: 0 },
    { min: 8, max: 10, label: "en dessous de 10", count: 0 },
    { min: 10, max: 12, label: "entre 10 et 12", count: 0 },
    { min: 12, max: 14, label: "entre 12 et 14", count: 0 },
    { min: 14, max: 16, label: "entre 14 et 16", count: 0 },
    { min: 16, max: 20, label: "au-dessus de 16", count: 0 }
  ];
  
  validEleves.forEach(eleve => {
    const avg = eleve.moyenneGenerale;
    for (const tranche of tranches) {
      if (tranche.max === 20) {
        // Special case for >= 16
        if (avg >= tranche.min) {
          tranche.count++;
          break;
        }
      } else if (avg >= tranche.min && avg < tranche.max) {
        tranche.count++;
        break;
      }
    }
  });
  
  return tranches;
}

/**
 * Get homogeneity description based on standard deviation
 */
export function getHomogeneityLabel(stdDev: number): string {
  if (stdDev < 1.5) {
    return "La classe est homogène";
  } else if (stdDev < 2.5) {
    return "La classe présente une certaine hétérogénéité";
  } else {
    return "La classe est très hétérogène";
  }
}

/**
 * Generate automatic class summary (3-5 sentences)
 */
export function generateClassSummary(
  classeData: ClasseDataCSV,
  metadata: ClassMetadata
): string {
  const sentences: string[] = [];
  
  const validEleves = classeData.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null);
  const averageGeneral = calculateClassAverage(classeData.eleves);
  const stdDev = calculateStdDev(classeData.eleves);
  const tranches = calculateGradeTranches(classeData.eleves);
  
  // Phrase 1: General average and student count
  const classLabel = metadata.className || "cette classe";
  sentences.push(
    `La classe de ${classLabel} affiche une moyenne générale de ${averageGeneral.toFixed(2).replace('.', ',')}/20 avec ${validEleves.length} élèves évalués.`
  );
  
  // Phrase 2: Grade distribution by tranches (only non-empty)
  const nonEmptyTranches = tranches.filter(t => t.count > 0);
  if (nonEmptyTranches.length > 0) {
    const tranchesTextParts = nonEmptyTranches.map(t => 
      `${t.count} élève${t.count > 1 ? 's' : ''} ${t.label}`
    );
    
    // Join with commas and "et" for the last item
    let tranchesText: string;
    if (tranchesTextParts.length === 1) {
      tranchesText = tranchesTextParts[0];
    } else {
      const allButLast = tranchesTextParts.slice(0, -1);
      const last = tranchesTextParts[tranchesTextParts.length - 1];
      tranchesText = allButLast.join(', ') + ' et ' + last;
    }
    
    sentences.push(`La répartition est la suivante : ${tranchesText}.`);
  }
  
  // Phrase 3: Homogeneity based on std dev
  const homogeneityLabel = getHomogeneityLabel(stdDev);
  sentences.push(
    `${homogeneityLabel} avec un écart-type de ${stdDev.toFixed(2).replace('.', ',')}.`
  );
  
  // Phrase 4: Strong and weak subjects
  const subjectStats = getSubjectAverages(classeData);
  if (subjectStats.length >= 4) {
    const sortedSubjects = [...subjectStats].sort((a, b) => b.currentAvg - a.currentAvg);
    const topSubjects = sortedSubjects.slice(0, 2);
    const weakSubjects = sortedSubjects.slice(-2).reverse();
    
    // Shorten subject names if needed
    const formatSubjectName = (name: string) => {
      const shortNames: Record<string, string> = {
        'HISTOIRE-GÉOGRAPHIE': 'Histoire-géographie',
        'PHYSIQUE-CHIMIE': 'Physique-chimie',
        'ÉDUCATION MUSICALE': 'Éducation musicale',
        'ARTS PLASTIQUES': 'Arts plastiques',
        'MATHEMATIQUES': 'Mathématiques',
        'FRANÇAIS': 'Français',
        'ANGLAIS LV1': 'Anglais',
        'ESPAGNOL LV2': 'Espagnol',
        'TECHNOLOGIE': 'Technologie',
        'EPS': 'EPS',
        'SVT': 'SVT',
      };
      return shortNames[name.toUpperCase()] || name.charAt(0) + name.slice(1).toLowerCase();
    };
    
    sentences.push(
      `${formatSubjectName(topSubjects[0].name)} (${topSubjects[0].currentAvg.toFixed(2).replace('.', ',')}) et ${formatSubjectName(topSubjects[1].name)} (${topSubjects[1].currentAvg.toFixed(2).replace('.', ',')}) sont les points forts, tandis que ${formatSubjectName(weakSubjects[1].name)} (${weakSubjects[1].currentAvg.toFixed(2).replace('.', ',')}) et ${formatSubjectName(weakSubjects[0].name)} (${weakSubjects[0].currentAvg.toFixed(2).replace('.', ',')}) nécessitent un renforcement.`
    );
  }
  
  // Phrase 5: Attendance (conditional)
  const totalAbsences = classeData.statistiques.totalAbsences;
  const totalDelays = classeData.statistiques.totalRetards;
  const maxAbsences = Math.max(...classeData.eleves.map(e => e.absences || 0));
  
  // Calculate approximate absence rate
  const absenceRate = totalAbsences / (validEleves.length * 100);
  const hasSignificantAbsences = 
    absenceRate > 0.15 || 
    totalDelays > 30 || 
    maxAbsences > 50;
  
  if (hasSignificantAbsences && totalAbsences > 0) {
    const absenceDetails: string[] = [];
    if (maxAbsences > 50) {
      absenceDetails.push(`dont ${maxAbsences} demi-journées pour un élève`);
    }
    if (totalDelays > 30) {
      absenceDetails.push(`${totalDelays} retards cumulés`);
    }
    
    const detailText = absenceDetails.length > 0 ? ` (${absenceDetails.join(' et ')})` : '';
    sentences.push(
      `L'assiduité est préoccupante avec ${totalAbsences} demi-journées d'absence${detailText}.`
    );
  }
  
  return sentences.join(' ');
}
