// ============================================================
// PDF Text Cleaning Utility
// Removes parasitic text from PRONOTE parsing and formatting issues
// ============================================================

/**
 * Cleans text before inserting into PDF to remove:
 * - Icon prefixes in brackets like [VUE], [Moy], etc.
 * - PRONOTE PDF parsing artifacts like pole names
 * - Teacher names in CAPS followed by M./Mme
 * - Multiple consecutive spaces
 * - Incomplete ellipsis
 */
export function nettoyerTexteAvantPDF(texte: string | undefined | null): string {
  if (!texte) return '';
  
  return texte
    // Remove prefixes in brackets (misinterpreted icons)
    .replace(/\[(VUE|Moy|Med|ET|OK|Elv|Mat|\+|-|!|>|#|i|1er|2e|3e|\*)\]\s*/gi, '')
    
    // Remove PRONOTE PDF parsing artifacts - pole names
    .replace(/POLE\s+(LITTERAIRE|LITTERAIRES|SCIENCES|SCIENTIFIQUE|SCIENTIFIQUES|ARTISTIQUE|ARTISTIQUES|EXPRESSION)/gi, '')
    
    // Remove subject names in caps followed by M./Mme (teacher identifiers)
    .replace(/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜ\s\-]{3,}\s+(M\.|Mme)\s*/g, '')
    
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, ' ')
    
    // Fix incomplete ellipsis
    .replace(/\.{2}(?!\.)/g, '...')
    
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
  
  // Check for phone number patterns
  if (/\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/.test(cleaned)) {
    return '';
  }
  
  // Check for email patterns
  if (/email|@|mail/i.test(cleaned)) {
    return '';
  }
  
  // Check if mostly numbers
  const digitCount = (cleaned.match(/\d/g) || []).length;
  if (digitCount > cleaned.length * 0.4) {
    return '';
  }
  
  // Check for garbage strings
  if (cleaned.length < 3 || cleaned.length > 100) {
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
    .replace(/^\[(VUE|Moy|Med|ET|OK|Elv|Mat|\+|-|!|>|#|i|1er|2e|3e|\*)\]\s*/gi, '')
    .trim();
}

// Clean title mappings for PDF sections
export const TITRES_PROPRES = {
  vueEnsemble: 'VUE D\'ENSEMBLE',
  pointsPositifs: 'POINTS POSITIFS',
  pointsVigilance: 'POINTS DE VIGILANCE',
  appreciationGenerale: 'APPRÉCIATION GÉNÉRALE DU CONSEIL',
  moyenneGenerale: 'Moyenne générale',
  ecartType: 'Écart-type',
  tauxReussite: 'Taux de réussite',
  elevesEvalues: 'Élèves évalués',
  pointsForts: 'Points forts (moyenne ≥ 14)',
  aRenforcer: 'À renforcer (moyenne < 12)',
  podium: 'Podium des 3 meilleurs élèves',
  elevesSurveiller: 'Élèves à surveiller (moyenne < 10)',
  recommandations: 'Recommandations pour le conseil de classe',
  valoriser: 'Points à valoriser',
  attention: 'Points d\'attention',
  actions: 'Actions suggérées',
  decisionConseil: 'DÉCISIONS DU CONSEIL',
  syntheseConseil: 'SYNTHÈSE DU CONSEIL DE CLASSE',
  statistiquesGenerales: 'Statistiques générales',
  repartitionMoyenne: 'Répartition par tranche de moyenne',
  classementEleves: 'Classement des élèves',
  analyseMatiere: 'Analyse par matière',
  appreciationConseil: 'Appréciation du conseil de classe',
  appreciationsIndividuelles: 'Appréciations individuelles',
  resultatsGeneraux: 'RÉSULTATS GÉNÉRAUX',
  resultatsMatiere: 'RÉSULTATS PAR MATIÈRE',
  appreciationSection: 'APPRÉCIATION DU CONSEIL',
  bulletinConseil: 'BULLETIN DU CONSEIL DE CLASSE',
};

// Medal emojis for podium (jsPDF text approximation)
export const PODIUM_MEDALS = {
  first: '🥇',
  second: '🥈', 
  third: '🥉',
};

// Statistics display with explicit labels
export const STATS_LABELS = {
  elevesAuDessus10: '✅ Élèves avec moyenne ≥ 10/20',
  elevesEnDifficulte: '⚠️ Élèves avec moyenne < 10/20',
};
