import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure le worker avec l'URL correcte pour Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface BulletinClasseData {
  etablissement: string;
  classe: string;
  trimestre: string;
  anneeScolaire: string;
  professeurPrincipal: string;
  matieres: {
    nom: string;
    moyenne: number;
    appreciation: string;
    pole: string;
  }[];
}

export interface BulletinEleveData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  classe: string;
  trimestre: string;
  matieres: {
    nom: string;
    moyenneEleve: number;
    moyenneClasse: number;
    appreciation: string;
    pole: string;
  }[];
  appreciationGenerale?: string;
  absences?: number;
  retards?: number;
  moyenneGenerale?: number; // Moyenne générale de l'élève (ligne "Moyennes générales")
  pageCount?: number; // Nombre de pages du bulletin (pour les bulletins multi-pages)
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    throw new Error('Impossible de lire le fichier PDF. Vérifiez que le fichier n\'est pas corrompu.');
  }
}

export async function extractTextFromPDFByPage(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pages: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      pages.push(pageText);
    }
    
    return pages;
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    throw new Error('Impossible de lire le fichier PDF. Vérifiez que le fichier n\'est pas corrompu.');
  }
}

export function parseBulletinClasse(text: string): BulletinClasseData | null {
  try {
    const lignes = text.split('\n');
    
    // Extraction des informations d'en-tête
    const etablissement = lignes.find(l => l.includes('COLLEGE'))?.trim() || '';
    const trimestre = lignes.find(l => l.includes('Trimestre'))?.match(/(\d+)(?:er|ème)\s+Trimestre/)?.[0] || '';
    const anneeScolaire = lignes.find(l => l.includes('Année scolaire'))?.match(/\d{4}\/\d{4}/)?.[0] || '';
    const professeurPrincipal = lignes.find(l => l.includes('Professeur principal'))?.split(':')[1]?.trim() || '';
    
    // Extraction de la classe depuis le contexte
    const classeMatch = text.match(/3[eè](\d+)/);
    const classe = classeMatch ? `3e${classeMatch[1]}` : '';
    
    const matieres: BulletinClasseData['matieres'] = [];
    let poleActuel = '';
    
    // Identification des pôles
    if (text.includes('POLE SCIENCES')) poleActuel = 'Sciences';
    if (text.includes('POLE LITTERAIRE')) poleActuel = 'Littéraire';
    if (text.includes('ARTISTIQUE')) poleActuel = 'Artistique et culturelle';
    
    // Extraction des matières et moyennes (pattern: MATIERE moyenne appreciation)
    const matiereRegex = /([A-Z][A-Z\s&-]+)\s+(\d+[,\.]\d+)\s+(.+?)(?=[A-Z][A-Z\s&-]+\s+\d+|$)/gs;
    let match;
    
    while ((match = matiereRegex.exec(text)) !== null) {
      const [, nom, moyenne, appreciation] = match;
      
      // Déterminer le pôle
      if (nom.includes('MATHEMATIQUES') || nom.includes('PHYSIQUE') || nom.includes('SCIENCES') || nom.includes('TECHNOLOGIE')) {
        poleActuel = 'Sciences';
      } else if (nom.includes('ANGLAIS') || nom.includes('FRANCAIS') || nom.includes('HISTOIRE') || nom.includes('ESPAGNOL') || nom.includes('ITALIEN')) {
        poleActuel = 'Littéraire';
      } else if (nom.includes('ARTS') || nom.includes('MUSIQUE') || nom.includes('EPS')) {
        poleActuel = 'Artistique et culturelle';
      }
      
      matieres.push({
        nom: nom.trim(),
        moyenne: parseFloat(moyenne.replace(',', '.')),
        appreciation: appreciation.trim(),
        pole: poleActuel
      });
    }
    
    return {
      etablissement,
      classe,
      trimestre,
      anneeScolaire,
      professeurPrincipal,
      matieres
    };
  } catch (error) {
    console.error('Erreur lors du parsing du bulletin de classe:', error);
    return null;
  }
}

/**
 * Patterns à ignorer pour l'extraction des noms d'élèves
 */
const IGNORE_NAME_PATTERNS = [
  /DEMI-PENSIONNAIRE/i,
  /PENSIONNAIRE/i,
  /EXTERNE/i,
  /ETABLISSEMENT/i,
  /Née?\s+le/i,
  /Professeur/i,
  /attention\s+de/i,
  /POLE\s+(LITTERAIRE|SCIENCES)/i,
  /EXPRESSION\s+ARTISTIQUE/i,
  /DANS\s+L/i, // "DANS L'ETABLISSEMENT"
  /^DANS$/i,
];

/**
 * Mots à ignorer qui ne sont pas des noms d'élèves
 */
const IGNORE_WORDS = [
  'WAZIERS', 'ROLLAND', 'COLLEGE', 'ROMAIN', 'ALLEE', 'GEORGES', 'LARUE',
  'TRIMESTRE', 'BULLETIN', 'POLE', 'SCIENCES', 'LITTERAIRE', 'ARTISTIQUE',
  'DEMI', 'PENSIONNAIRE', 'EXTERNE', 'DANS', 'ETABLISSEMENT',
  'MATHEMATIQUES', 'FRANCAIS', 'ANGLAIS', 'ESPAGNOL', 'ITALIEN',
  'HISTOIRE', 'GEOGRAPHIE', 'PHYSIQUE', 'CHIMIE', 'TECHNOLOGIE',
  'ARTS', 'PLASTIQUES', 'MUSIQUE', 'MUSICALE', 'EDUCATION', 'SPORT',
  'ATELIER', 'SCIENTIFIQUE', 'MOYENNES', 'GENERALES', 'VIE', 'SCOLAIRE'
];

/**
 * Vérifie si un texte correspond à un pattern à ignorer
 */
function isIgnoredName(text: string): boolean {
  if (!text) return true;
  
  // Vérifier les patterns regex
  if (IGNORE_NAME_PATTERNS.some(pattern => pattern.test(text))) {
    return true;
  }
  
  // Vérifier si le texte est composé uniquement de mots à ignorer
  const words = text.toUpperCase().split(/\s+/);
  if (words.every(word => IGNORE_WORDS.includes(word))) {
    return true;
  }
  
  return false;
}

/**
 * Extrait le nom et prénom d'un élève depuis le texte du bulletin
 * Gère les noms composés (AIT MESSAOUD, TURLOTTE VERMAUT) et évite les faux positifs
 */
function extractStudentNameFromText(text: string): { nom: string; prenom: string } | null {
  const normalizedText = text.replace(/\s+/g, ' ');
  
  // Pattern 1: Après code postal et ville - "59119 WAZIERS NOM Prénom" 
  // Format: CODE_POSTAL VILLE NOM(S) Prénom
  const postalPattern = normalizedText.match(/\d{5}\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]+\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ\s-]+?)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç][a-zéèêëàâäôöùûüïîç-]*)/);
  if (postalPattern) {
    const potentialNom = postalPattern[1].trim();
    const potentialPrenom = postalPattern[2].trim();
    
    // Filtrer les noms en majuscules (nom) et nettoyer
    const nomParts = potentialNom.split(/\s+/).filter(part => {
      const upperPart = part.toUpperCase();
      return part.length >= 2 && 
             part === upperPart && 
             !IGNORE_WORDS.includes(upperPart);
    });
    
    if (nomParts.length > 0 && potentialPrenom.length >= 2 && !isIgnoredName(potentialPrenom)) {
      return {
        nom: nomParts.join(' '),
        prenom: potentialPrenom
      };
    }
  }
  
  // Pattern 2: "NOM Prénom Né(e) le" - plus robuste
  // Gère les noms composés: "AIT MESSAOUD Yasmina Née le"
  const neeLe = normalizedText.match(/([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ\s-]+?)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç][a-zéèêëàâäôöùûüïîç-]*)\s+Née?\s+le/i);
  if (neeLe) {
    const potentialNom = neeLe[1].trim();
    const potentialPrenom = neeLe[2].trim();
    
    // Extraire seulement les parties en majuscules du nom
    const nomParts = potentialNom.split(/\s+/).filter(part => {
      const upperPart = part.toUpperCase();
      return part.length >= 2 && 
             part === part.toUpperCase() && 
             !IGNORE_WORDS.includes(upperPart);
    });
    
    if (nomParts.length > 0 && !isIgnoredName(nomParts.join(' '))) {
      return {
        nom: nomParts.join(' '),
        prenom: potentialPrenom
      };
    }
  }
  
  // Pattern 3: Recherche générique - NOM(s majuscules) suivi de Prénom(Capitale+minuscules)
  // Évite les faux positifs comme "DEMI-PENSIONNAIRE DANS"
  const genericPattern = normalizedText.match(/\b([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,}(?:\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,})*)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+(?:-[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+)?)\b/g);
  
  if (genericPattern) {
    for (const match of genericPattern) {
      const parts = match.match(/([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,}(?:\s+[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ]{2,})*)\s+([A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+(?:-[A-ZÉÈÊËÀÂÄÔÖÙÛÜÏÎ][a-zéèêëàâäôöùûüïîç]+)?)/);
      if (parts) {
        const potentialNom = parts[1].trim();
        const potentialPrenom = parts[2].trim();
        
        // Filtrer les noms valides
        const nomParts = potentialNom.split(/\s+/).filter(part => {
          const upperPart = part.toUpperCase();
          return part.length >= 2 && !IGNORE_WORDS.includes(upperPart);
        });
        
        if (nomParts.length > 0 && 
            !isIgnoredName(nomParts.join(' ')) && 
            !isIgnoredName(potentialPrenom) &&
            potentialPrenom.length >= 2) {
          return {
            nom: nomParts.join(' '),
            prenom: potentialPrenom
          };
        }
      }
    }
  }
  
  return null;
}

export function parseBulletinEleve(text: string): BulletinEleveData | null {
  try {
    console.log('=== PARSING BULLETIN ELEVE ===');
    
    // Normaliser le texte: remplacer plusieurs espaces par un seul
    const normalizedText = text.replace(/\s+/g, ' ');
    console.log('Texte normalisé (500 premiers chars):', normalizedText.substring(0, 500));
    
    // Extraction des informations de l'élève avec la nouvelle méthode robuste
    const studentName = extractStudentNameFromText(normalizedText);
    
    let nom = '', prenom = '';
    if (studentName) {
      nom = studentName.nom;
      prenom = studentName.prenom;
    }
    
    console.log('Nom détecté:', nom, '- Prénom:', prenom);
    
    const dateNaissance = normalizedText.match(/Née?\s+le\s+(\d{2}\/\d{2}\/\d{4})/)?.[1] || '';
    const classeMatch = normalizedText.match(/(\d)[eè](\d+)/);
    const classe = classeMatch ? `${classeMatch[1]}e${classeMatch[2]}` : '';
    const trimestre = normalizedText.match(/(\d+)(?:er|ème|eme)\s+Trimestre/i)?.[0] || '';
    
    const matieres: BulletinEleveData['matieres'] = [];
    
    // Liste des matières connues
    const matieresConnues = [
      'MATHEMATIQUES',
      'PHYSIQUE-CHIMIE',
      'SCIENCES VIE & TERRE',
      'TECHNOLOGIE',
      'ANGLAIS LV1',
      'FRANCAIS',
      'HISTOIRE-GEOGRAPHIE',
      'ESPAGNOL LV2',
      'ITALIEN LV2',
      'ARTS PLASTIQUES',
      'ED.PHYSIQUE & SPORT.',
      'EDUCATION MUSICALE',
      'ATELIER SCIENTIFIQUE'
    ];
    
    // Pattern simplifié: MATIERE [PROF] NOMBRE NOMBRE (puis appréciation)
    for (const matiere of matieresConnues) {
      const matiereEscaped = matiere.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Pattern plus flexible pour capturer les notes
      const pattern = new RegExp(
        matiereEscaped + 
        '(?:\\s+(?:M\\.|Mme|Mlle)\\s*[A-Z]+)?' + // Prof optionnel
        '\\s+' +
        '(\\d+[,\\.]\\d+)\\s+' + // Premier nombre
        '(\\d+[,\\.]\\d+)' + // Deuxième nombre
        '(?:\\s+(\\d+[,\\.]\\d+))?' + // Troisième nombre optionnel
        '(?:\\s+(\\d+[,\\.]\\d+))?' + // Quatrième nombre optionnel
        '\\s+' +
        "([A-Za-z\\u00C0-\\u017F'\\-\\.!?,;:\\s]+?)" + // Appréciation
        '(?=\\s+(?:' + matieresConnues.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '|POLE|Moyennes|Absences|Vie scolaire|Appréciation|$))',
        'i'
      );
      
      const match = normalizedText.match(pattern);
      
      if (match) {
        const nums = [match[1], match[2], match[3], match[4]].filter(Boolean).map(n => parseFloat(n.replace(',', '.')));
        
        let moyEleve: number, moyClasse: number;
        
        if (nums.length >= 4) {
          moyEleve = nums[0];
          moyClasse = nums[2];
        } else if (nums.length >= 2) {
          moyEleve = nums[0];
          moyClasse = nums[1];
        } else {
          continue;
        }
        
        let appreciation = match[5] ? match[5].trim().replace(/\s+/g, ' ') : '';
        appreciation = appreciation.replace(/^[:\s]+/, '').replace(/\s+$/, '');
        
        // Déterminer le pôle selon la matière
        let pole = '';
        if (['MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SCIENCES VIE & TERRE', 'TECHNOLOGIE', 'ATELIER SCIENTIFIQUE'].includes(matiere)) {
          pole = 'Sciences';
        } else if (['ANGLAIS LV1', 'FRANCAIS', 'HISTOIRE-GEOGRAPHIE', 'ESPAGNOL LV2', 'ITALIEN LV2'].includes(matiere)) {
          pole = 'Littéraire';
        } else if (['ARTS PLASTIQUES', 'ED.PHYSIQUE & SPORT.', 'EDUCATION MUSICALE'].includes(matiere)) {
          pole = 'Artistique et culturelle';
        }
        
        if (moyEleve >= 0 && moyEleve <= 20 && moyClasse >= 0 && moyClasse <= 20) {
          matieres.push({
            nom: matiere,
            moyenneEleve: moyEleve,
            moyenneClasse: moyClasse,
            appreciation: appreciation,
            pole: pole
          });
          console.log('✓ Matière détectée:', matiere, '| Élève:', moyEleve, '| Classe:', moyClasse);
        }
      }
    }
    
    console.log('Nombre total de matières extraites:', matieres.length);
    
    // Extraction de l'appréciation générale
    const appreciationMatch = normalizedText.match(/Appréciation\s+(?:globale|générale)\s*:?\s*(.+?)(?=Mentions|Signature|Vie scolaire|$)/i);
    const appreciationGenerale = appreciationMatch?.[1]?.trim().replace(/\s+/g, ' ') || '';
    
    // Extraction vie scolaire
    let absences = 0, retards = 0;
    
    const absencesMatch = normalizedText.match(/(?:Absences?|Abs\.?)\s*:?\s*(\d+)|(\d+)\s+demi-journée/i);
    if (absencesMatch) {
      absences = parseInt(absencesMatch[1] || absencesMatch[2]);
    } else if (normalizedText.match(/Aucune?\s+absence/i)) {
      absences = 0;
    }
    
    const retardsMatch = normalizedText.match(/Retards?\s*:?\s*(\d+)/i);
    if (retardsMatch) {
      retards = parseInt(retardsMatch[1]);
    } else if (normalizedText.match(/Aucune?\s+retard/i)) {
      retards = 0;
    }
    
    // Validation: besoin d'au moins un nom
    if (!nom) {
      console.log('❌ Bulletin invalide - nom manquant');
      return null;
    }
    
    if (matieres.length === 0) {
      console.log('⚠️ Bulletin pour', nom, prenom, '- aucune matière extraite du PDF, mais bulletin accepté');
    } else {
      console.log('✓ Bulletin valide pour', nom, prenom, '-', matieres.length, 'matières');
    }
    
    return {
      nom,
      prenom,
      dateNaissance,
      classe,
      trimestre,
      matieres,
      appreciationGenerale,
      absences,
      retards
    };
  } catch (error) {
    console.error('Erreur lors du parsing du bulletin élève:', error);
    return null;
  }
}

/**
 * Crée une clé unique pour identifier un élève
 */
function createStudentKey(nom: string, prenom: string): string {
  return `${nom}_${prenom}`
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .trim();
}

/**
 * Extrait la moyenne générale depuis le texte brut de la page
 * Cherche spécifiquement la ligne "Moyennes générales" qui contient la vraie moyenne
 */
/**
 * Extrait la moyenne générale depuis le texte brut de la page
 * Cherche SPÉCIFIQUEMENT la ligne "Moyennes générales" qui contient la vraie moyenne
 * IMPORTANT: Ne JAMAIS calculer la moyenne à partir des matières !
 */
function extractMoyenneGenerale(pageText: string): { studentAverage: number; classAverage: number } | null {
  // Normaliser le texte
  const normalizedText = pageText.replace(/\s+/g, ' ');
  
  // Pattern 1: "Moyennes générales 11,55 13,29" (format PRONOTE standard)
  // Le premier nombre est la moyenne de l'élève, le second celle de la classe
  const moyennesMatch = normalizedText.match(/Moyennes?\s+g[eé]n[eé]rales?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/i);
  if (moyennesMatch) {
    console.log('✓ Moyenne générale trouvée:', moyennesMatch[1], '(élève) /', moyennesMatch[2], '(classe)');
    return {
      studentAverage: parseFloat(moyennesMatch[1].replace(',', '.')),
      classAverage: parseFloat(moyennesMatch[2].replace(',', '.'))
    };
  }
  
  // Pattern 2: "Moyenne générale : 11,55" (format alternatif avec deux-points)
  const simpleMatch = normalizedText.match(/Moyennes?\s+g[eé]n[eé]rales?\s*:\s*(\d{1,2}[,\.]\d{1,2})/i);
  if (simpleMatch) {
    console.log('✓ Moyenne générale trouvée (format simple):', simpleMatch[1]);
    return {
      studentAverage: parseFloat(simpleMatch[1].replace(',', '.')),
      classAverage: 0
    };
  }
  
  // Pattern 3: Chercher dans le pied de page - parfois espacé différemment
  const footerMatch = normalizedText.match(/g[eé]n[eé]rales?\s+(\d{1,2}[,\.]\d{1,2})\s+(\d{1,2}[,\.]\d{1,2})/i);
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
 * Fusionne les données d'un élève provenant de plusieurs pages
 */
function mergeStudentData(existing: BulletinEleveData, newPage: BulletinEleveData, newPageText: string): BulletinEleveData {
  // Fusionner les matières - éviter les doublons
  const existingMatiereNames = new Set(existing.matieres.map(m => m.nom));
  const newMatieres = newPage.matieres.filter(m => !existingMatiereNames.has(m.nom));
  
  // Chercher la moyenne générale dans le texte de la nouvelle page
  const moyenneResult = extractMoyenneGenerale(newPageText);
  const moyenneFromNewPage = moyenneResult?.studentAverage ?? null;
  
  return {
    ...existing,
    // Fusionner les matières
    matieres: [...existing.matieres, ...newMatieres],
    // Prendre l'appréciation générale si elle existe sur la nouvelle page
    appreciationGenerale: newPage.appreciationGenerale || existing.appreciationGenerale,
    // Prendre les absences/retards si présents sur la nouvelle page
    absences: newPage.absences ?? existing.absences,
    retards: newPage.retards ?? existing.retards,
    // Stocker la moyenne générale correcte (de la ligne "Moyennes générales")
    moyenneGenerale: moyenneFromNewPage ?? existing.moyenneGenerale,
    // Incrémenter le compteur de pages
    pageCount: (existing.pageCount || 1) + 1
  };
}

/**
 * Parse les bulletins élèves depuis un PDF multi-pages
 * Fusionne automatiquement les élèves dont le bulletin s'étend sur plusieurs pages
 */
export async function parseBulletinsElevesFromPDF(file: File): Promise<BulletinEleveData[]> {
  try {
    const pages = await extractTextFromPDFByPage(file);
    
    // Map pour stocker les élèves uniques par clé nom_prenom
    const studentsMap = new Map<string, { data: BulletinEleveData; lastPageText: string }>();
    
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageText = pages[pageIndex];
      const bulletin = parseBulletinEleve(pageText);
      
      if (bulletin && bulletin.nom && bulletin.prenom) {
        const studentKey = createStudentKey(bulletin.nom, bulletin.prenom);
        
        // Extraire la moyenne générale de cette page si présente
        const moyenneResult = extractMoyenneGenerale(pageText);
        if (moyenneResult !== null) {
          bulletin.moyenneGenerale = moyenneResult.studentAverage;
        }
        
        if (studentsMap.has(studentKey)) {
          // Élève déjà existant - fusionner les données (bulletin multi-pages)
          const existing = studentsMap.get(studentKey)!;
          const mergedData = mergeStudentData(existing.data, bulletin, pageText);
          studentsMap.set(studentKey, { data: mergedData, lastPageText: pageText });
          console.log(`✓ Fusion bulletin multi-pages pour ${bulletin.prenom} ${bulletin.nom} (page ${pageIndex + 1})`);
        } else {
          // Nouvel élève
          bulletin.pageCount = 1;
          studentsMap.set(studentKey, { data: bulletin, lastPageText: pageText });
          console.log(`✓ Nouvel élève détecté: ${bulletin.prenom} ${bulletin.nom} (page ${pageIndex + 1})`);
        }
      }
    }
    
    // Convertir la Map en tableau et calculer les moyennes finales
    const bulletins = Array.from(studentsMap.values()).map(({ data }) => {
      // S'assurer que moyenneGenerale est définie
      if (!data.moyenneGenerale && data.matieres.length > 0) {
        // Calculer la moyenne si pas de "Moyennes générales" trouvée
        const totalMoyenne = data.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
        data.moyenneGenerale = totalMoyenne / data.matieres.length;
      }
      return data;
    });
    
    console.log(`Total: ${bulletins.length} élèves uniques extraits du PDF`);
    
    return bulletins;
  } catch (error) {
    console.error('Erreur lors du parsing des bulletins élèves:', error);
    throw new Error('Impossible de parser les bulletins élèves du PDF.');
  }
}
