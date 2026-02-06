// ============================================================
// PDF Text Cleaning Utility
// Removes parasitic text from PRONOTE parsing and formatting issues
// ============================================================

/**
 * Cleans text before inserting into PDF to remove:
 * - Icon prefixes in brackets like [VUE], [Moy], [Med], etc.
 * - PRONOTE PDF parsing artifacts like pole names
 * - Teacher names in CAPS followed by M./Mme
 * - Multiple consecutive spaces
 * - Incomplete ellipsis
 */
export function nettoyerTexteAvantPDF(texte: string | undefined | null): string {
  if (!texte) return '';
  
  return texte
    // Remove prefixes in brackets (misinterpreted icons) - EXPANDED list
    .replace(/\[(VUE|Moy|Med|ET|OK|Elv|Mat|\+|-|!|>|#|i|1er|2e|3e|\*|Abs|Ret|NE)\]\s*/gi, '')
    
    // Remove PRONOTE PDF parsing artifacts - pole names (expanded)
    .replace(/POLE\s+(LITTERAIRE|LITTERAIRES|SCIENCES|SCIENTIFIQUE|SCIENTIFIQUES|ARTISTIQUE|ARTISTIQUES|EXPRESSION|LANGUES|SPORT)/gi, '')
    
    // Remove subject names in caps followed by M./Mme (teacher identifiers)
    .replace(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜ\s\-]{3,}\s+(M\.|Mme)\s*/g, '')
    
    // Remove class name patterns that might slip through
    .replace(/\bla\s+classe\s+de\s+\d+[eè](?:me)?\d*\b/gi, '')
    .replace(/\bcette\s+classe\s+de\s+\d+[eè](?:me)?\b/gi, '')
    .replace(/\bles\s+élèves\s+de\s+\d+[eè](?:me)?\b/gi, '')
    
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, ' ')
    
    // Fix incomplete ellipsis
    .replace(/\.{2}(?!\.)/g, '...')
    
    // Clean orphan punctuation
    .replace(/,\s*,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    
    // Trim
    .trim();
}

/**
 * Validates and cleans the professeur principal field
 * Returns empty string if it looks like parsing artifacts (phone numbers, emails, etc.)
 */
export function nettoyerProfesseurPrincipal(nomPP: string | undefined | null): string {
  if (!nomPP || nomPP.trim() === '') {
    return '';
  }
  
  const cleaned = nomPP.trim();
  
  // Check for phone number patterns (French format)
  if (/\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/.test(cleaned)) {
    return '';
  }
  
  // Check for email patterns
  if (/email|@|mail/i.test(cleaned)) {
    return '';
  }
  
  // Check if mostly numbers (likely garbage data)
  const digitCount = (cleaned.match(/\d/g) || []).length;
  if (digitCount > cleaned.length * 0.4) {
    return '';
  }
  
  // Check for garbage strings (too short or too long)
  if (cleaned.length < 3 || cleaned.length > 100) {
    return '';
  }
  
  // Check for common garbage patterns
  if (/^[0-9\s\-\.]+$/.test(cleaned)) {
    return '';
  }
  
  return cleaned;
}

/**
 * Clean section titles by removing bracket prefixes and normalizing
 */
export function nettoyerTitrePDF(titre: string): string {
  if (!titre) return '';
  
  return titre
    .replace(/^\[(VUE|Moy|Med|ET|OK|Elv|Mat|\+|-|!|>|#|i|1er|2e|3e|\*|Abs|Ret|NE)\]\s*/gi, '')
    .trim();
}

// Clean title mappings for PDF sections (ALL WITHOUT BRACKETS)
export const TITRES_PROPRES = {
  // Executive Summary
  vueEnsemble: 'VUE D\'ENSEMBLE',
  pointsPositifs: 'POINTS POSITIFS',
  pointsVigilance: 'POINTS DE VIGILANCE',
  appreciationGenerale: 'APPRÉCIATION GÉNÉRALE DU CONSEIL',
  decisionConseil: 'DÉCISIONS DU CONSEIL',
  syntheseConseil: 'SYNTHÈSE DU CONSEIL DE CLASSE',
  
  // Statistics
  statistiquesGenerales: 'STATISTIQUES GÉNÉRALES',
  moyenneGenerale: 'Moyenne générale',
  ecartType: 'Écart-type',
  tauxReussite: 'Taux de réussite',
  elevesEvalues: 'Élèves évalués',
  repartitionMoyenne: 'Répartition par tranche de moyenne',
  
  // Subjects
  pointsForts: 'Points forts (moyenne ≥ 14)',
  aRenforcer: 'À renforcer (moyenne < 12)',
  analyseMatiere: 'ANALYSE PAR MATIÈRE',
  resultatsMatiere: 'RÉSULTATS PAR MATIÈRE',
  
  // Podium and ranking
  podium: 'Podium des 3 meilleurs élèves',
  classementEleves: 'CLASSEMENT DES ÉLÈVES',
  
  // Monitoring
  elevesSurveiller: 'Élèves à surveiller (moyenne < 10)',
  recommandations: 'Recommandations pour le conseil de classe',
  valoriser: 'Points à valoriser',
  attention: 'Points d\'attention',
  actions: 'Actions suggérées',
  
  // Appreciations
  appreciationConseil: 'APPRÉCIATION DU CONSEIL',
  appreciationsIndividuelles: 'APPRÉCIATIONS INDIVIDUELLES',
  appreciationSection: 'APPRÉCIATION DU CONSEIL',
  
  // Report
  bulletinConseil: 'BULLETIN DU CONSEIL DE CLASSE',
  resultatsGeneraux: 'RÉSULTATS GÉNÉRAUX',
};

// Medal emojis for podium (jsPDF text approximation - used as fallback)
export const PODIUM_MEDALS = {
  first: '🥇',
  second: '🥈', 
  third: '🥉',
};

// Explicit statistics display labels (NO ICONS, CLEAR TEXT)
export const STATS_LABELS = {
  elevesAuDessus10: 'Élèves avec moyenne ≥ 10/20',
  elevesEnDifficulte: 'Élèves avec moyenne < 10/20',
  excellentLabel: 'Excellent (≥16)',
  tresBienLabel: 'Très bien (14-16)',
  bienLabel: 'Bien (12-14)',
  moyenLabel: 'Moyen (10-12)',
  insuffisantLabel: 'Insuffisant (8-10)',
  grandeDifficulteLabel: 'Grande difficulté (<8)',
};
