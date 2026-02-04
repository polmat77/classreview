import { BulletinEleveData } from './pdfParser';
import { StudentAnalysis, analyzeStudentBulletin } from './studentBulletinAnalyzer';
import {
  StudentBulletinAnalysis,
  BulletinJustification,
  BulletinEvolution,
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
  ALERT_KEYWORDS
} from '@/types/bulletinAnalysis';

/**
 * Format a number with French decimal notation
 */
const formatFrenchNumber = (num: number): string => {
  return num.toFixed(2).replace('.', ',');
};

/**
 * Identify and categorize keywords in text
 */
const identifyKeywords = (text: string): { word: string; type: 'positif' | 'negatif' | 'alerte' }[] => {
  const keywords: { word: string; type: 'positif' | 'negatif' | 'alerte' }[] = [];
  const lowerText = text.toLowerCase();
  
  POSITIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      keywords.push({ word, type: 'positif' });
    }
  });
  
  NEGATIVE_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      keywords.push({ word, type: 'negatif' });
    }
  });
  
  ALERT_KEYWORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase())) {
      keywords.push({ word, type: 'alerte' });
    }
  });
  
  return keywords;
};

/**
 * Extract justifications from bulletin appreciations organized by category
 */
const extractJustifications = (
  bulletin: BulletinEleveData,
  analysis: StudentAnalysis
): BulletinJustification[] => {
  const justifications: BulletinJustification[] = [];
  
  // Process each subject appreciation
  bulletin.matieres.forEach(matiere => {
    const appr = matiere.appreciation?.trim();
    if (!appr) return;
    
    const lowerAppr = appr.toLowerCase();
    const keywords = identifyKeywords(appr);
    
    // Categorize based on content
    // Results
    if (/résultat|moyenne|note|niveau|performance/i.test(appr)) {
      justifications.push({
        categorie: 'resultats',
        matiere: matiere.nom,
        extrait: appr,
        motsCles: keywords
      });
    }
    
    // Work and seriousness
    if (/travail|sérieux|appliqué|leçon|devoir|exercice|effort|régulier|irrégulier|négligent/i.test(appr)) {
      justifications.push({
        categorie: 'travail',
        matiere: matiere.nom,
        extrait: appr,
        motsCles: keywords
      });
    }
    
    // Behavior
    if (/bavard|dissipé|agité|perturbateur|insolent|comportement|attitude|calme|concentré|attentif/i.test(appr)) {
      justifications.push({
        categorie: 'comportement',
        matiere: matiere.nom,
        extrait: appr,
        motsCles: keywords
      });
    }
    
    // Positive points
    if (/excellent|félicitations|bravo|remarquable|brillant|très bien|progrès|encourageant/i.test(appr)) {
      justifications.push({
        categorie: 'positif',
        matiere: matiere.nom,
        extrait: appr,
        motsCles: keywords
      });
    }
    
    // Negative/Concerning points
    if (/insuffisant|préoccupant|grave|inacceptable|en difficulté|fragile|lacunes/i.test(appr)) {
      justifications.push({
        categorie: 'negatif',
        matiere: matiere.nom,
        extrait: appr,
        motsCles: keywords
      });
    }
  });
  
  // Attendance justification
  const absences = bulletin.absences || 0;
  const retards = bulletin.retards || 0;
  
  if (absences > 5 || retards > 3) {
    justifications.push({
      categorie: 'assiduite',
      matiere: 'Vie scolaire',
      extrait: `${absences} demi-journée(s) d'absence${retards > 0 ? ` et ${retards} retard(s)` : ''}`,
      motsCles: absences > 10 ? [{ word: 'absences importantes', type: 'alerte' }] : []
    });
  }
  
  // Deduplicate by matiere within same category
  const uniqueJustifications: BulletinJustification[] = [];
  const seen = new Set<string>();
  
  justifications.forEach(j => {
    const key = `${j.categorie}-${j.matiere}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJustifications.push(j);
    }
  });
  
  return uniqueJustifications;
};

/**
 * Generate the oral presentation text for a student
 */
const generateAnalysisText = (
  bulletin: BulletinEleveData,
  analysis: StudentAnalysis,
  moyenneGenerale: number,
  evolution?: BulletinEvolution
): string => {
  const sentences: string[] = [];
  const prenom = bulletin.prenom;
  
  // 1. Evolution of average (only if available)
  if (evolution) {
    const diff = Math.abs(evolution.difference);
    if (evolution.direction === 'hausse') {
      sentences.push(`La moyenne générale de ${prenom} est en hausse de ${formatFrenchNumber(diff)} point${diff > 1 ? 's' : ''} par rapport au trimestre précédent.`);
    } else if (evolution.direction === 'baisse') {
      sentences.push(`La moyenne générale de ${prenom} est en baisse de ${formatFrenchNumber(diff)} point${diff > 1 ? 's' : ''} par rapport au trimestre précédent.`);
    } else {
      sentences.push(`La moyenne générale de ${prenom} reste stable par rapport au trimestre précédent.`);
    }
  }
  
  // 2. General results assessment
  let levelDesc = '';
  if (moyenneGenerale >= 16) {
    levelDesc = 'Les résultats sont excellents dans l\'ensemble des disciplines.';
  } else if (moyenneGenerale >= 14) {
    levelDesc = 'Les résultats sont très satisfaisants.';
  } else if (moyenneGenerale >= 12) {
    levelDesc = 'Les résultats sont globalement satisfaisants.';
  } else if (moyenneGenerale >= 10) {
    levelDesc = 'Les résultats sont justes et nécessitent plus de régularité.';
  } else {
    levelDesc = 'Les résultats sont fragiles et nécessitent un effort soutenu.';
  }
  
  // Add strong/weak subjects
  if (analysis.strongSubjects.length > 0) {
    const strongNames = analysis.strongSubjects.slice(0, 2).map(s => s.matiere).join(' et ');
    levelDesc += ` ${strongNames} ${analysis.strongSubjects.length > 1 ? 'sont' : 'est'} particulièrement réussi${analysis.strongSubjects.length > 1 ? 's' : ''}.`;
  }
  if (analysis.weakSubjects.length > 0) {
    const weakNames = analysis.weakSubjects.slice(0, 2).map(s => s.matiere).join(' et ');
    levelDesc += ` Un effort particulier est attendu en ${weakNames}.`;
  }
  
  sentences.push(levelDesc);
  
  // 3. Seriousness and work
  const seriousCount = analysis.seriousKeywords.filter(k => k === 'sérieux').length;
  const negligentCount = analysis.seriousKeywords.filter(k => k === 'négligent').length;
  
  if (seriousCount >= 2) {
    sentences.push('Le travail est sérieux et régulier.');
  } else if (negligentCount >= 2) {
    sentences.push('Le travail manque de sérieux et de régularité.');
  } else if (analysis.recurringIssues.some(i => i.type === 'travail non fait')) {
    sentences.push('Le travail personnel n\'est pas toujours effectué.');
  }
  
  // 4. Behavior problems (if any)
  const bavardages = analysis.recurringIssues.find(i => i.type === 'bavardages');
  const insolence = analysis.recurringIssues.find(i => i.type === 'insolence');
  
  if (bavardages && bavardages.count >= 2) {
    sentences.push(`Des bavardages sont signalés par ${bavardages.count} professeurs.`);
  }
  if (insolence && insolence.count >= 1) {
    sentences.push('Des problèmes de comportement ont été relevés.');
  }
  
  // 5. Attendance (if significant)
  const absences = bulletin.absences || 0;
  const retards = bulletin.retards || 0;
  
  if (absences > 5) {
    sentences.push(`À noter : ${absences} demi-journée${absences > 1 ? 's' : ''} d'absence ce trimestre.`);
  } else if (retards > 3) {
    sentences.push(`${retards} retards ont été enregistrés.`);
  }
  
  // 6. Positive points (efforts/progress)
  const progressCount = analysis.effortKeywords.filter(k => k === 'progrès').length;
  if (progressCount >= 2) {
    sentences.push('Des efforts et des progrès sont à souligner.');
  }
  
  // Active participation
  const activeCount = analysis.participationKeywords.filter(k => k === 'actif').length;
  if (activeCount >= 2) {
    sentences.push('La participation en classe est active.');
  }
  
  return sentences.join(' ');
};

/**
 * Main function: Generate complete bulletin analysis for a student
 */
export const generateBulletinAnalysis = (
  bulletin: BulletinEleveData,
  moyenneGenerale: number,
  moyennePrecedente?: number,
  trimestre?: number
): StudentBulletinAnalysis => {
  // Analyze the bulletin
  const analysis = analyzeStudentBulletin(bulletin, moyenneGenerale);
  
  // Calculate evolution if available
  let evolution: BulletinEvolution | undefined;
  if (moyennePrecedente !== undefined && trimestre && trimestre > 1) {
    const diff = moyenneGenerale - moyennePrecedente;
    evolution = {
      difference: diff,
      direction: diff > 0.5 ? 'hausse' : diff < -0.5 ? 'baisse' : 'stable',
      moyennePrecedente,
      moyenneActuelle: moyenneGenerale
    };
  }
  
  // Extract justifications
  const justifications = extractJustifications(bulletin, analysis);
  
  // Generate analysis text
  const analyseTexte = generateAnalysisText(bulletin, analysis, moyenneGenerale, evolution);
  
  return {
    evolutionMoyenne: evolution,
    analyseTexte,
    justifications
  };
};

/**
 * Group justifications by category for display
 */
export const groupJustificationsByCategory = (
  justifications: BulletinJustification[]
): Record<string, BulletinJustification[]> => {
  const grouped: Record<string, BulletinJustification[]> = {};
  
  justifications.forEach(j => {
    if (!grouped[j.categorie]) {
      grouped[j.categorie] = [];
    }
    grouped[j.categorie].push(j);
  });
  
  return grouped;
};
