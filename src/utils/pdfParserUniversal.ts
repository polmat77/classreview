/**
 * Module utilitaire universel pour le parsing de bulletins PRONOTE
 * Fonctionne pour N'IMPORTE QUEL établissement français (collège, lycée, REP ou non)
 */

// =============================================================================
// CONSTANTES STRUCTURELLES - Mots PRONOTE qui ne sont JAMAIS des noms d'élèves
// =============================================================================

/**
 * Mots structurels PRONOTE à toujours ignorer lors de l'extraction de noms
 */
export const STRUCTURAL_WORDS = new Set([
  // Structure PRONOTE
  'TRIMESTRE', 'BULLETIN', 'SCOLAIRE', 'ANNEE', 'PERIODE',
  'MOYENNES', 'GENERALES', 'GENERALE', 'MOYENNE', 'BILAN',
  'APPRECIATION', 'CONSEIL', 'CLASSE', 'ELEVES', 'ELEVE',
  'PROFESSEUR', 'PRINCIPAL', 'PROFESSEURS', 'ENSEIGNANTS',
  'COMPETENCES', 'ACQUISES', 'ACQUISITION',
  
  // Pôles et catégories
  'POLE', 'SCIENCES', 'LITTERAIRE', 'SCIENTIFIQUE', 'ARTISTIQUE',
  'CULTURELLE', 'CULTUREL', 'EXPRESSION', 'DOMAINES',
  
  // Statuts élèves
  'DEMI', 'PENSIONNAIRE', 'EXTERNE', 'INTERNE', 'INTERNAT',
  'DEMI-PENSIONNAIRE', 'EXTERNAT',
  
  // Types d'établissement
  'COLLEGE', 'LYCEE', 'ECOLE', 'PROFESSIONNEL', 'GENERAL',
  'TECHNOLOGIQUE', 'POLYVALENT', 'PRIVE', 'PUBLIC',
  'ACADEMIE', 'ETABLISSEMENT', 'INSTITUTION', 'GROUPE',
  
  // Types de voies françaises (adresses)
  'RUE', 'AVENUE', 'BOULEVARD', 'IMPASSE', 'PLACE', 'CHEMIN',
  'ROUTE', 'PASSAGE', 'SQUARE', 'COURS', 'QUAI', 'ALLEE',
  'VOIE', 'SENTIER', 'RUELLE', 'COUR', 'PARVIS', 'ESPLANADE',
  'PROMENADE', 'RESIDENCE', 'CITE', 'LOTISSEMENT', 'HAMEAU',
  'LIEU-DIT', 'ZONE', 'PARC', 'MAIL', 'GALERIE',
  
  // Matières scolaires (ne pas confondre avec des noms)
  'MATHEMATIQUES', 'FRANCAIS', 'ANGLAIS', 'ESPAGNOL', 'ITALIEN',
  'ALLEMAND', 'PORTUGAIS', 'CHINOIS', 'JAPONAIS', 'ARABE', 'RUSSE',
  'HISTOIRE', 'GEOGRAPHIE', 'PHYSIQUE', 'CHIMIE', 'TECHNOLOGIE',
  'ARTS', 'PLASTIQUES', 'MUSIQUE', 'MUSICALE', 'EDUCATION',
  'SPORT', 'SPORTIVE', 'CIVIQUE', 'MORAL', 'MORALE',
  'LATIN', 'GREC', 'ANCIEN', 'PHILOSOPHIE', 'ECONOMIQUE', 'SOCIALE',
  'NUMERIQUE', 'INFORMATIQUE', 'SCIENCES',
  
  // Termes administratifs
  'VIE', 'SCOLAIRE', 'ABSENCES', 'RETARDS', 'ATTENTION',
  'EMAIL', 'TEL', 'TELEPHONE', 'FAX', 'ADRESSE',
  'SIGNATURE', 'DATE', 'MENTIONS', 'LEGALES',
  
  // Mots courants en majuscules dans les bulletins
  'DANS', 'POUR', 'AVEC', 'SANS', 'CHEZ', 'VERS',
  'SECTION', 'OPTION', 'OPTIONS', 'ATELIER', 'PROJET',
]);

/**
 * Liste étendue des matières scolaires françaises (collège + lycée)
 * Utilisée pour la détection structurelle
 */
export const MATIERES_SCOLAIRES = [
  // Sciences
  'MATHEMATIQUES', 'MATHS',
  'PHYSIQUE-CHIMIE', 'PHYSIQUE CHIMIE', 'SC. PHYSIQUES', 'SCIENCES PHYSIQUES',
  'SCIENCES VIE & TERRE', 'S.V.T.', 'SVT', 'SCIENCES DE LA VIE ET DE LA TERRE',
  'TECHNOLOGIE', 'TECHNO',
  'SCIENCES NUMERIQUES', 'SNT', 'S.N.T.',
  'NSI', 'N.S.I.', 'NUMERIQUE ET SCIENCES INFORMATIQUES',
  'ATELIER SCIENTIFIQUE',
  
  // Langues vivantes
  'FRANCAIS', 'FRANÇAIS',
  'ANGLAIS LV1', 'ANGLAIS LV2', 'ANGLAIS',
  'ESPAGNOL LV1', 'ESPAGNOL LV2', 'ESPAGNOL',
  'ALLEMAND LV1', 'ALLEMAND LV2', 'ALLEMAND',
  'ITALIEN LV1', 'ITALIEN LV2', 'ITALIEN',
  'PORTUGAIS LV1', 'PORTUGAIS LV2', 'PORTUGAIS',
  'CHINOIS LV1', 'CHINOIS LV2', 'CHINOIS',
  'JAPONAIS LV1', 'JAPONAIS LV2', 'JAPONAIS',
  'ARABE LV1', 'ARABE LV2', 'ARABE',
  'RUSSE LV1', 'RUSSE LV2', 'RUSSE',
  
  // Langues anciennes
  'LATIN', 'GREC ANCIEN', 'GREC',
  
  // Humanités
  'HISTOIRE-GEOGRAPHIE', 'HISTOIRE GEOGRAPHIE', 'HISTOIRE-GEO', 'HIST-GEO',
  'HISTOIRE', 'GEOGRAPHIE',
  'EMC', 'E.M.C.', 'ENSEIGNEMENT MORAL ET CIVIQUE', 'EDUCATION CIVIQUE',
  'PHILOSOPHIE', 'PHILO',
  
  // Arts et culture
  'ARTS PLASTIQUES', 'ARTS',
  'EDUCATION MUSICALE', 'MUSIQUE',
  'THEATRE', 'DANSE', 'CINEMA', 'AUDIOVISUEL',
  'HISTOIRE DES ARTS',
  
  // Sport
  'ED.PHYSIQUE & SPORT.', 'EPS', 'E.P.S.', 'EDUCATION PHYSIQUE',
  'EDUCATION PHYSIQUE ET SPORTIVE',
  
  // Options lycée
  'SES', 'S.E.S.', 'SCIENCES ECONOMIQUES ET SOCIALES',
  'HLP', 'H.L.P.', 'HUMANITES LITTERATURE PHILOSOPHIE',
  'HGGSP', 'H.G.G.S.P.', 'HISTOIRE GEOGRAPHIE GEOPOLITIQUE SCIENCES POLITIQUES',
  'LLCER', 'L.L.C.E.R.', 'LANGUES LITTERATURES CULTURES ETRANGERES',
  'LLCA', 'L.L.C.A.', 'LANGUES LITTERATURES CULTURES ANTIQUITE',
  'SI', 'SCIENCES DE L\'INGENIEUR',
  'STMG', 'ECONOMIE DROIT', 'MANAGEMENT',
  
  // DNL et sections européennes
  'DNL', 'D.N.L.', 'DISCIPLINE NON LINGUISTIQUE',
  'SECTION EURO', 'SECTION EUROPEENNE', 'EURO',
  'SECTION INTERNATIONALE',
  
  // Enseignement professionnel
  'ENSEIGNEMENT PROFESSIONNEL', 'ATELIER', 'PRATIQUE PROFESSIONNELLE',
  'PSE', 'P.S.E.', 'PREVENTION SANTE ENVIRONNEMENT',
  'DEVOIRS FAITS', 'OPTION DECOUVERTE', 'ACCOMPAGNEMENT PERSONNALISE',
];

/**
 * Patterns à ignorer lors de l'extraction des noms d'élèves
 */
export const IGNORE_NAME_PATTERNS = [
  /DEMI-PENSIONNAIRE/i,
  /PENSIONNAIRE/i,
  /EXTERNE/i,
  /ETABLISSEMENT/i,
  /Née?\s+le/i,
  /Professeur/i,
  /attention\s+de/i,
  /POLE\s+(LITTERAIRE|SCIENCES|ARTISTIQUE)/i,
  /EXPRESSION\s+ARTISTIQUE/i,
  /DANS\s+L/i,
  /^DANS$/i,
  /DEMI\s+PENSIONNAIRE/i,
  /MOYENNES?\s+GENERALES?/i,
  /CONSEIL\s+DE\s+CLASSE/i,
  /VIE\s+SCOLAIRE/i,
  /BILAN\s+(?:GLOBAL|PERIODIQUE)/i,
];

// =============================================================================
// FONCTIONS UTILITAIRES UNIVERSELLES
// =============================================================================

/**
 * Extrait dynamiquement les mots de l'en-tête PDF à ignorer
 * Identifie la zone AVANT le premier code postal et extrait tous les mots en majuscules
 * 
 * @param fullText - Texte complet du PDF
 * @returns Set de mots à ignorer (combinaison structurels + dynamiques)
 */
export function extractHeaderWordsToIgnore(fullText: string): Set<string> {
  const dynamicWords = new Set<string>();
  
  // Normaliser le texte
  const normalizedText = fullText.replace(/\s+/g, ' ');
  
  // Trouver la position du premier code postal (5 chiffres)
  const postalCodeMatch = normalizedText.match(/\d{5}/);
  
  if (postalCodeMatch && postalCodeMatch.index !== undefined) {
    // Extraire la zone d'en-tête (tout AVANT le code postal)
    const headerZone = normalizedText.substring(0, postalCodeMatch.index);
    
    // Extraire tous les mots en MAJUSCULES de cette zone
    const uppercaseWords = headerZone.match(/\b[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]{3,}\b/g);
    
    if (uppercaseWords) {
      uppercaseWords.forEach(word => {
        // Ignorer les mots trop courts ou les nombres
        if (word.length >= 3 && !/^\d+$/.test(word)) {
          dynamicWords.add(word);
        }
      });
    }
    
    // Extraire aussi le nom de la ville APRÈS le code postal
    // Pattern: code postal + ville (peut être composée avec tirets/espaces)
    const cityMatch = normalizedText.match(
      /\d{5}\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+(?:[-\s][A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+)*)/
    );
    
    if (cityMatch && cityMatch[1]) {
      // Ajouter tous les composants du nom de ville
      const cityParts = cityMatch[1].split(/[-\s]+/);
      cityParts.forEach(part => {
        if (part.length >= 2) {
          dynamicWords.add(part);
        }
      });
    }
  }
  
  console.log('🏫 Mots d\'en-tête dynamiques détectés:', Array.from(dynamicWords).join(', '));
  
  // Combiner avec les mots structurels
  return new Set([...STRUCTURAL_WORDS, ...dynamicWords]);
}

/**
 * Pattern regex universel pour code postal + ville française
 * Gère les villes composées (SAINT-ETIENNE, AIX-EN-PROVENCE, etc.)
 */
export const POSTAL_CODE_CITY_PATTERN = 
  /(\d{5})\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+(?:[-\s][A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+)*)/;

/**
 * Vérifie si un mot doit être ignoré (n'est pas un nom d'élève)
 */
export function shouldIgnoreWord(word: string, dynamicIgnoreWords?: Set<string>): boolean {
  if (!word || word.length < 2) return true;
  
  const upper = word.toUpperCase().trim();
  
  // Vérifier dans les mots structurels
  if (STRUCTURAL_WORDS.has(upper)) return true;
  
  // Vérifier dans les mots dynamiques si fournis
  if (dynamicIgnoreWords && dynamicIgnoreWords.has(upper)) return true;
  
  return false;
}

/**
 * Vérifie si un texte correspond à un pattern à ignorer
 */
export function isIgnoredName(text: string, dynamicIgnoreWords?: Set<string>): boolean {
  if (!text) return true;
  
  // Vérifier les patterns regex
  if (IGNORE_NAME_PATTERNS.some(pattern => pattern.test(text))) {
    return true;
  }
  
  // Vérifier si le texte est composé uniquement de mots à ignorer
  const words = text.toUpperCase().split(/\s+/);
  const allIgnored = words.every(word => 
    STRUCTURAL_WORDS.has(word) || (dynamicIgnoreWords && dynamicIgnoreWords.has(word))
  );
  
  return allIgnored;
}

/**
 * Vérifie si un intitulé est une matière valide (pas un faux positif)
 */
export function isValidMatiereIntitule(intitule: string): boolean {
  const upper = intitule.toUpperCase().trim();
  
  // Faux positifs connus
  const FALSE_POSITIVES = [
    'POLE', 'MOYENNES GENERALES', 'MOYENNE GENERALE', 'BULLETIN',
    'VIE SCOLAIRE', 'CONSEIL', 'BILAN', 'APPRECIATIONS',
    'COMPETENCES', 'MENTIONS', 'SIGNATURE', 'DATE',
  ];
  
  if (FALSE_POSITIVES.some(fp => upper.includes(fp))) {
    return false;
  }
  
  // Vérifier si c'est dans la liste des matières connues
  return MATIERES_SCOLAIRES.some(m => 
    upper.includes(m.toUpperCase()) || m.toUpperCase().includes(upper)
  );
}

/**
 * Détermine le pôle d'une matière basé sur son nom
 */
export function determinePole(matiereName: string): string {
  const upper = matiereName.toUpperCase();
  
  // Pôle scientifique
  if (upper.match(/MATH|PHYSIQUE|CHIMIE|SVT|SCIENCES|TECHNO|NSI|SNT|SI|INGENIEUR/)) {
    return 'Sciences';
  }
  
  // Pôle littéraire
  if (upper.match(/FRANCAIS|ANGLAIS|ESPAGNOL|ALLEMAND|ITALIEN|HISTOIRE|GEO|LATIN|GREC|PHILO|EMC|CIVIQUE|SES|HLP|HGGSP|LLCER/)) {
    return 'Littéraire';
  }
  
  // Pôle artistique et culturel
  if (upper.match(/ARTS|PLASTIQUES|MUSIQUE|MUSICALE|EPS|SPORT|THEATRE|DANSE|CINEMA|AUDIOVISUEL/)) {
    return 'Artistique et culturelle';
  }
  
  return '';
}

/**
 * Extrait le nom et prénom d'un élève depuis le texte du bulletin PRONOTE
 * Version universelle utilisant la détection dynamique de l'en-tête
 */
export function extractStudentNameFromText(
  text: string, 
  dynamicIgnoreWords?: Set<string>
): { nom: string; prenom: string } | null {
  const normalizedText = text.replace(/\s+/g, ' ');
  
  console.log('🔍 Extraction nom élève (universel)...');
  
  // PATTERN PRINCIPAL: Code postal + Ville + NOM Prénom + "Né(e) le"
  // Pattern universel: \d{5} + VILLE + NOM(S) + Prénom + Né(e) le
  const mainPattern = normalizedText.match(
    /\d{5}\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+(?:[-\s][A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+)*)\s+(.+?)\s+Née?\s+le\s+\d{2}\/\d{2}\/\d{4}/i
  );
  
  if (mainPattern) {
    const ville = mainPattern[1]; // WAZIERS, SAINT-ETIENNE, AIX-EN-PROVENCE
    const nomPrenomBlock = mainPattern[2].trim();
    
    console.log('  Ville:', ville, '| Bloc nom/prénom:', nomPrenomBlock);
    
    // Séparer les parties du nom
    const parts = nomPrenomBlock.split(/\s+/);
    const lastNameParts: string[] = [];
    let firstName = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Vérifier si c'est tout en majuscules (partie du nom de famille)
      // ET que ce n'est pas un mot à ignorer
      if (part === part.toUpperCase() && part.length >= 2 && !shouldIgnoreWord(part, dynamicIgnoreWords)) {
        lastNameParts.push(part);
      } else if (part.length >= 2 && part[0] === part[0].toUpperCase()) {
        // Prénom: commence par majuscule, contient des minuscules
        firstName = parts.slice(i).join(' ');
        break;
      }
    }
    
    if (lastNameParts.length > 0 && firstName.length >= 2) {
      const result = {
        nom: lastNameParts.join(' '),
        prenom: firstName.split(' ')[0] // Prendre seulement le premier prénom
      };
      console.log('  ✓ Nom extrait:', result.nom, '| Prénom:', result.prenom);
      return result;
    }
  }
  
  // PATTERN FALLBACK 1: "NOM Prénom Né(e) le" sans code postal (pages de continuation)
  const fallbackNeeLe = normalizedText.match(
    /\b([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,}(?:\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,})*)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+(?:-[A-Za-zéèêëàâäôöùûüïîç]+)?)\s+Née?\s+le/i
  );
  
  if (fallbackNeeLe) {
    const potentialNom = fallbackNeeLe[1].trim();
    const potentialPrenom = fallbackNeeLe[2].trim();
    
    // Filtrer les mots ignorés
    const nomParts = potentialNom.split(/\s+/).filter(part => 
      !shouldIgnoreWord(part, dynamicIgnoreWords)
    );
    
    if (nomParts.length > 0 && !isIgnoredName(potentialPrenom, dynamicIgnoreWords)) {
      const result = { nom: nomParts.join(' '), prenom: potentialPrenom };
      console.log('  ✓ (fallback1) Nom:', result.nom, '| Prénom:', result.prenom);
      return result;
    }
  }
  
  // PATTERN FALLBACK 2: Après code postal + ville (pattern universel)
  const universalCityPattern = normalizedText.match(
    /\d{5}\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+(?:[-\s][A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎÇ]+)*\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,}(?:\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,})*)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+)/
  );
  
  if (universalCityPattern) {
    const potentialNom = universalCityPattern[1].trim();
    const potentialPrenom = universalCityPattern[2].trim();
    
    const nomParts = potentialNom.split(/\s+/).filter(part => 
      !shouldIgnoreWord(part, dynamicIgnoreWords)
    );
    
    if (nomParts.length > 0 && !isIgnoredName(potentialPrenom, dynamicIgnoreWords) && !isIgnoredName(nomParts.join(' '), dynamicIgnoreWords)) {
      const result = { nom: nomParts.join(' '), prenom: potentialPrenom };
      console.log('  ✓ (fallback2 universel) Nom:', result.nom, '| Prénom:', result.prenom);
      return result;
    }
  }
  
  console.log('  ❌ Aucun nom trouvé');
  return null;
}

/**
 * Extrait la moyenne générale depuis le texte brut de la page
 * Supporte plusieurs formats PRONOTE
 */
export function extractMoyenneGenerale(pageText: string): { studentAverage: number; classAverage: number } | null {
  const normalizedText = pageText.replace(/\s+/g, ' ');
  
  // Pattern 1: "Moyennes générales 11,55 13,29" (format PRONOTE standard)
  const moyennesMatch = normalizedText.match(
    /Moyennes?\s+g[eé]n[eé]rales?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/i
  );
  if (moyennesMatch) {
    console.log('✓ Moyenne générale trouvée:', moyennesMatch[1], '(élève) /', moyennesMatch[2], '(classe)');
    return {
      studentAverage: parseFloat(moyennesMatch[1].replace(',', '.')),
      classAverage: parseFloat(moyennesMatch[2].replace(',', '.'))
    };
  }
  
  // Pattern 2: "Moy. gén." (abrégé)
  const abrevMatch = normalizedText.match(
    /Moy\.?\s+g[eé]n\.?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/i
  );
  if (abrevMatch) {
    console.log('✓ Moyenne générale trouvée (abrégé):', abrevMatch[1]);
    return {
      studentAverage: parseFloat(abrevMatch[1].replace(',', '.')),
      classAverage: parseFloat(abrevMatch[2].replace(',', '.'))
    };
  }
  
  // Pattern 3: "MOYENNES GENERALES" (tout en majuscules)
  const upperMatch = normalizedText.match(
    /MOYENNES?\s+GENERALES?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/
  );
  if (upperMatch) {
    console.log('✓ Moyenne générale trouvée (majuscules):', upperMatch[1]);
    return {
      studentAverage: parseFloat(upperMatch[1].replace(',', '.')),
      classAverage: parseFloat(upperMatch[2].replace(',', '.'))
    };
  }
  
  // Pattern 4: Format avec séparateur "/" : "11,55 / 13,29"
  const slashMatch = normalizedText.match(
    /Moyennes?\s+g[eé]n[eé]rales?\s+(\d{1,2}[,\.]\d{1,2})\s*\/\s*(\d{1,2}[,\.]\d{1,2})/i
  );
  if (slashMatch) {
    console.log('✓ Moyenne générale trouvée (format /):', slashMatch[1]);
    return {
      studentAverage: parseFloat(slashMatch[1].replace(',', '.')),
      classAverage: parseFloat(slashMatch[2].replace(',', '.'))
    };
  }
  
  // Pattern 5: Moyenne unique (sans moyenne de classe)
  const simpleMatch = normalizedText.match(
    /Moyennes?\s+g[eé]n[eé]rales?\s*:?\s*(\d{1,2}[,\.]\d{1,2})/i
  );
  if (simpleMatch) {
    console.log('✓ Moyenne générale trouvée (format simple):', simpleMatch[1]);
    return {
      studentAverage: parseFloat(simpleMatch[1].replace(',', '.')),
      classAverage: 0
    };
  }
  
  // Pattern 6: Chercher dans le pied de page
  const footerMatch = normalizedText.match(
    /g[eé]n[eé]rales?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/i
  );
  if (footerMatch) {
    console.log('✓ Moyenne générale trouvée (footer):', footerMatch[1]);
    return {
      studentAverage: parseFloat(footerMatch[1].replace(',', '.')),
      classAverage: parseFloat(footerMatch[2].replace(',', '.'))
    };
  }
  
  return null;
}

/**
 * Crée une clé unique pour identifier un élève (normalisée)
 */
export function createStudentKey(nom: string, prenom: string): string {
  return `${nom}_${prenom}`
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .trim();
}
