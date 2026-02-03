import { 
  Attribution, 
  WorkLevel, 
  ConductLevel, 
  ConductAnalysis 
} from '@/types/attribution';
import { AppreciationTone } from '@/types/appreciation';

// ========== CONDUCT KEYWORDS ==========
// Strong keywords: 1 occurrence = automatic warning
const conductKeywordsStrong = [
  "insolence", "insolent", "insolente",
  "irrespectueux", "irrespectueuse",
  "perturbateur", "perturbe la classe", "perturbatrice",
  "comportement inacceptable",
  "attitude déplorable",
  "refus d'autorité",
  "provocation",
  "insulte", "insultes",
  "violence", "violent", "violente",
  "exclusion de cours",
  "renvoi",
  "sanction", "sanctions"
];

// Moderate keywords: 2+ different = warning
const conductKeywordsModerate = [
  "bavardages excessifs", "bavardages incessants", "bavardages répétés",
  "ne respecte pas les règles",
  "gêne ses camarades",
  "manque de respect",
  "attitude négative",
  "prise de parole anarchique",
  "ne se tient pas correctement",
  "posture inadaptée"
];

// ========== WORK KEYWORDS ==========
// 3+ occurrences = work warning
const workWarningKeywords = [
  "travail insuffisant",
  "manque de travail",
  "devoirs non rendus", "devoirs non faits",
  "leçons non apprises", "leçons non sues",
  "aucun effort",
  "investissement insuffisant",
  "ne travaille pas",
  "résultats en baisse",
  "lacunes importantes",
  "travail bâclé",
  "ne fournit pas les efforts",
  "démobilisé", "démobilisée",
  "passif", "passive"
];

// ========== ENCOURAGEMENT KEYWORDS ==========
// 2+ occurrences = encouragement
const encouragementKeywords = [
  "progrès", "progression",
  "efforts notables", "fait des efforts",
  "bonne volonté",
  "s'améliore",
  "travail sérieux",
  "investissement positif",
  "participation active",
  "motivé", "motivée"
];

// ========== CONGRATULATIONS KEYWORDS ==========
// 1+ occurrence = congratulations
const congratulationsKeywords = [
  "excellent", "excellente", "excellents résultats",
  "remarquable",
  "brillant", "brillante",
  "tête de classe",
  "très bon travail",
  "résultats exceptionnels"
];

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
 * Count keyword occurrences in text (case-insensitive)
 */
function countKeywordOccurrences(text: string, keywords: string[]): { count: number; matchedKeywords: string[] } {
  const textLower = text.toLowerCase();
  const matchedKeywords: string[] = [];
  let count = 0;
  
  for (const keyword of keywords) {
    if (textLower.includes(keyword.toLowerCase())) {
      count++;
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
  }
  
  return { count, matchedKeywords };
}

/**
 * Analyse les appréciations pour détecter les problèmes de conduite
 * New logic: Strong keywords (1 = warning), Moderate keywords (2+ = warning)
 */
export function analyzeConductFromComments(
  subjects: { name: string; appreciation?: string }[]
): ConductAnalysis {
  const relevantExcerpts: ConductAnalysis['relevantExcerpts'] = [];
  const detectedKeywords: string[] = [];
  let hasStrongKeyword = false;
  let moderateKeywordCount = 0;
  
  for (const subject of subjects) {
    if (!subject.appreciation) continue;
    
    const commentLower = subject.appreciation.toLowerCase();
    
    // Check strong keywords
    for (const keyword of conductKeywordsStrong) {
      if (commentLower.includes(keyword.toLowerCase())) {
        hasStrongKeyword = true;
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
        
        // Extract excerpt
        const keywordIndex = commentLower.indexOf(keyword.toLowerCase());
        const start = Math.max(0, keywordIndex - 20);
        const end = Math.min(subject.appreciation.length, keywordIndex + keyword.length + 30);
        let excerpt = subject.appreciation.substring(start, end).trim();
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < subject.appreciation.length) excerpt = excerpt + '...';
        
        const existingForSubject = relevantExcerpts.find(
          e => e.subject === subject.name && e.keyword === keyword
        );
        
        if (!existingForSubject) {
          relevantExcerpts.push({ subject: subject.name, excerpt, keyword });
        }
      }
    }
    
    // Check moderate keywords
    for (const keyword of conductKeywordsModerate) {
      if (commentLower.includes(keyword.toLowerCase())) {
        moderateKeywordCount++;
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
        
        // Extract excerpt
        const keywordIndex = commentLower.indexOf(keyword.toLowerCase());
        const start = Math.max(0, keywordIndex - 20);
        const end = Math.min(subject.appreciation.length, keywordIndex + keyword.length + 30);
        let excerpt = subject.appreciation.substring(start, end).trim();
        
        if (start > 0) excerpt = '...' + excerpt;
        if (end < subject.appreciation.length) excerpt = excerpt + '...';
        
        const existingForSubject = relevantExcerpts.find(
          e => e.subject === subject.name && e.keyword === keyword
        );
        
        if (!existingForSubject) {
          relevantExcerpts.push({ subject: subject.name, excerpt, keyword });
        }
      }
    }
  }
  
  // Determine if there are conduct issues
  // Strong keyword = automatic issue
  // 2+ different moderate keywords = issue
  const hasConductIssues = hasStrongKeyword || moderateKeywordCount >= 2;
  
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
 * Count work warning keyword occurrences across all subjects
 */
function analyzeWorkWarningKeywords(
  subjects: { name: string; appreciation?: string }[]
): { count: number; matchedKeywords: string[] } {
  let totalCount = 0;
  const allMatchedKeywords: string[] = [];
  
  for (const subject of subjects) {
    if (!subject.appreciation) continue;
    const result = countKeywordOccurrences(subject.appreciation, workWarningKeywords);
    totalCount += result.count;
    result.matchedKeywords.forEach(kw => {
      if (!allMatchedKeywords.includes(kw)) {
        allMatchedKeywords.push(kw);
      }
    });
  }
  
  return { count: totalCount, matchedKeywords: allMatchedKeywords };
}

/**
 * Count encouragement keyword occurrences across all subjects
 */
function analyzeEncouragementKeywords(
  subjects: { name: string; appreciation?: string }[]
): { count: number; matchedKeywords: string[] } {
  let totalCount = 0;
  const allMatchedKeywords: string[] = [];
  
  for (const subject of subjects) {
    if (!subject.appreciation) continue;
    const result = countKeywordOccurrences(subject.appreciation, encouragementKeywords);
    totalCount += result.count;
    result.matchedKeywords.forEach(kw => {
      if (!allMatchedKeywords.includes(kw)) {
        allMatchedKeywords.push(kw);
      }
    });
  }
  
  return { count: totalCount, matchedKeywords: allMatchedKeywords };
}

/**
 * Count congratulations keyword occurrences across all subjects
 */
function analyzeCongratulationsKeywords(
  subjects: { name: string; appreciation?: string }[]
): { count: number; matchedKeywords: string[] } {
  let totalCount = 0;
  const allMatchedKeywords: string[] = [];
  
  for (const subject of subjects) {
    if (!subject.appreciation) continue;
    const result = countKeywordOccurrences(subject.appreciation, congratulationsKeywords);
    totalCount += result.count;
    result.matchedKeywords.forEach(kw => {
      if (!allMatchedKeywords.includes(kw)) {
        allMatchedKeywords.push(kw);
      }
    });
  }
  
  return { count: totalCount, matchedKeywords: allMatchedKeywords };
}

/**
 * Suggère une attribution basée sur la moyenne et l'analyse des appréciations
 * New logic:
 * - Conduct warning: 1 strong keyword OR 2+ moderate keywords
 * - Work warning: 3+ work warning keywords
 * - Encouragement: 2+ encouragement keywords
 * - Congratulations: 1+ congratulations keywords
 */
export function suggestAttribution(
  average: number,
  subjects: { name: string; appreciation?: string }[]
): Attribution | null {
  const conductAnalysis = analyzeConductFromComments(subjects);
  const hasConductIssues = conductAnalysis.hasConductIssues;
  
  const workWarningAnalysis = analyzeWorkWarningKeywords(subjects);
  const hasWorkIssues = workWarningAnalysis.count >= 3;
  
  const congratsAnalysis = analyzeCongratulationsKeywords(subjects);
  const hasCongratulations = congratsAnalysis.count >= 1;
  
  const encouragementAnalysis = analyzeEncouragementKeywords(subjects);
  const hasEncouragement = encouragementAnalysis.count >= 2;
  
  // Priority: Negative attributions first
  if (hasWorkIssues && hasConductIssues) {
    return 'warning_both';
  }
  
  if (hasConductIssues) {
    return 'warning_conduct';
  }
  
  if (hasWorkIssues) {
    return 'warning_work';
  }
  
  // Positive attributions (only if no issues)
  if (hasCongratulations) {
    return 'congratulations';
  }
  
  // Honor: good average + no issues
  if (average >= 14 && !hasConductIssues && !hasWorkIssues) {
    return 'honor';
  }
  
  if (hasEncouragement) {
    return 'encouragement';
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
      return 'encourageant';
    case 'congratulations':
      return 'elogieux';
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

/**
 * Truncate text intelligently at the last full sentence
 */
export function truncateIntelligently(text: string, limit: number): string {
  if (text.length <= limit) return text;
  
  const truncated = text.substring(0, limit);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastPunctuation = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  // If we find punctuation covering at least 70% of the limit, use it
  if (lastPunctuation > limit * 0.7) {
    return truncated.substring(0, lastPunctuation + 1);
  }
  
  // Otherwise, cut at the last space
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > limit * 0.5) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}
