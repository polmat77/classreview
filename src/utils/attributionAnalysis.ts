import { 
  Attribution, 
  WorkLevel, 
  ConductLevel, 
  ConductAnalysis 
} from '@/types/attribution';
import { AppreciationTone } from '@/types/appreciation';

// Mots-clés pour détecter les problèmes de conduite
const conductKeywords = {
  negative: [
    // Bavardage
    "bavard", "bavarde", "bavardages", "bavardage excessif", "trop bavard",
    "parle trop", "parle beaucoup trop", "discussions incessantes",
    
    // Perturbation
    "perturbateur", "perturbatrice", "perturbe", "perturbe le cours",
    "dérange", "dérangeant", "gêne ses camarades", "dissipé", "dissipée",
    "agité", "agitée", "agitation",
    
    // Attention
    "inattentif", "inattentive", "manque d'attention", "distrait", "distraite",
    "n'écoute pas", "ne suit pas", "absent en cours", "dans la lune",
    "déconcentré", "déconcentrée",
    
    // Attitude
    "attitude inadaptée", "attitude déplacée", "comportement inadapté",
    "comportement inapproprié", "insolent", "insolente", "insolence",
    "irrespectueux", "irrespectueuse", "manque de respect",
    "impertinent", "impertinente", "impertinence",
    "provocateur", "provocatrice", "provocation",
    
    // Travail en classe
    "ne travaille pas en classe", "passif", "passive", "passivité",
    "ne participe pas", "aucune participation", "refuse de travailler",
    "fainéant", "paresseux", "paresseuse",
    
    // Matériel et organisation
    "sans matériel", "oublie ses affaires", "jamais son matériel",
    "travail non fait", "devoirs non faits", "leçons non apprises",
    
    // Retards et absences
    "retards fréquents", "souvent en retard", "absences injustifiées",
    "absentéisme",
    
    // Avertissements explicites
    "avertissement", "mise en garde", "doit changer", "comportement à revoir",
    "efforts de comportement", "attitude à améliorer"
  ],
  severe: [
    "insolent", "insolente", "insolence",
    "irrespectueux", "irrespectueuse", "manque de respect",
    "avertissement", "comportement inacceptable"
  ]
};

/**
 * Analyse le niveau de travail basé sur la moyenne
 */
export function analyzeWorkFromAverage(average: number): WorkLevel {
  if (average >= 16) return 'excellent';
  if (average >= 14) return 'good';
  if (average >= 10) return 'average';
  return 'insufficient';
}

/**
 * Analyse les appréciations pour détecter les problèmes de conduite
 */
export function analyzeConductFromComments(
  subjects: { name: string; appreciation?: string }[]
): ConductAnalysis {
  const relevantExcerpts: ConductAnalysis['relevantExcerpts'] = [];
  const detectedKeywords: string[] = [];
  
  for (const subject of subjects) {
    if (!subject.appreciation) continue;
    
    const commentLower = subject.appreciation.toLowerCase();
    
    for (const keyword of conductKeywords.negative) {
      if (commentLower.includes(keyword.toLowerCase())) {
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
        
        // Extraire un extrait pertinent autour du mot-clé
        const keywordIndex = commentLower.indexOf(keyword.toLowerCase());
        const start = Math.max(0, keywordIndex - 20);
        const end = Math.min(subject.appreciation.length, keywordIndex + keyword.length + 30);
        let excerpt = subject.appreciation.substring(start, end).trim();
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < subject.appreciation.length) excerpt = excerpt + '...';
        
        // Éviter les doublons d'extraits pour la même matière
        const existingForSubject = relevantExcerpts.find(
          e => e.subject === subject.name && e.keyword === keyword
        );
        
        if (!existingForSubject) {
          relevantExcerpts.push({
            subject: subject.name,
            excerpt,
            keyword
          });
        }
      }
    }
  }
  
  // Déterminer s'il y a des problèmes de conduite
  const hasSevereIssue = conductKeywords.severe.some(
    kw => detectedKeywords.some(dk => dk.toLowerCase().includes(kw.toLowerCase()))
  );
  
  const hasConductIssues = detectedKeywords.length >= 2 || hasSevereIssue;
  
  return {
    hasConductIssues,
    detectedKeywords,
    relevantExcerpts
  };
}

/**
 * Analyse la conduite à partir d'une liste d'appréciations simples
 */
export function analyzeConductLevel(
  subjects: { name: string; appreciation?: string }[]
): ConductLevel {
  const analysis = analyzeConductFromComments(subjects);
  return analysis.hasConductIssues ? 'problematic' : 'good';
}

/**
 * Suggère une attribution basée sur la moyenne et l'analyse de conduite
 */
export function suggestAttribution(
  average: number,
  subjects: { name: string; appreciation?: string }[]
): Attribution | null {
  const workLevel = analyzeWorkFromAverage(average);
  const conductAnalysis = analyzeConductFromComments(subjects);
  const conductLevel = conductAnalysis.hasConductIssues ? 'problematic' : 'good';
  
  // Cas négatifs (prioritaires)
  if (workLevel === 'insufficient' && conductLevel === 'problematic') {
    return 'warning_both';
  }
  
  if (conductLevel === 'problematic' && workLevel !== 'insufficient') {
    return 'warning_conduct';
  }
  
  if (workLevel === 'insufficient' && conductLevel === 'good') {
    return 'warning_work';
  }
  
  // Cas positifs (seulement si pas de problème de conduite)
  if (conductLevel === 'good') {
    if (workLevel === 'excellent') {
      return 'congratulations';
    }
    if (workLevel === 'good') {
      return 'honor';
    }
    if (workLevel === 'average') {
      return 'encouragement';
    }
  }
  
  return null;
}

/**
 * Suggère un ton basé sur l'attribution
 */
export function suggestToneFromAttribution(attribution: Attribution | null): AppreciationTone {
  if (!attribution) return 'standard';
  
  switch (attribution) {
    case 'warning_work':
    case 'warning_conduct':
    case 'warning_both':
      return 'severe';
    case 'encouragement':
    case 'honor':
      return 'caring';
    case 'congratulations':
      return 'praising';
    default:
      return 'standard';
  }
}

/**
 * Génère un résumé des suggestions d'attribution pour un groupe d'élèves
 */
export function generateAttributionSummary(
  attributions: (Attribution | null)[]
): Record<Attribution | 'none', number> {
  const summary: Record<Attribution | 'none', number> = {
    congratulations: 0,
    honor: 0,
    encouragement: 0,
    warning_work: 0,
    warning_conduct: 0,
    warning_both: 0,
    none: 0
  };
  
  for (const attr of attributions) {
    if (attr === null) {
      summary.none++;
    } else {
      summary[attr]++;
    }
  }
  
  return summary;
}
