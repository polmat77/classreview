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

export function parseBulletinEleve(text: string): BulletinEleveData | null {
  try {
    console.log('=== PARSING BULLETIN ELEVE ===');
    
    // Normaliser le texte: remplacer plusieurs espaces par un seul
    const normalizedText = text.replace(/\s+/g, ' ');
    console.log('Texte normalisé (500 premiers chars):', normalizedText.substring(0, 500));
    
    // Extraction des informations de l'élève
    let nom = '', prenom = '';
    
    // Pattern principal: "NOM Prenom Né(e) le"
    const nomCompletMatch = normalizedText.match(/([A-Z]{2,})\s+([A-Z][a-zéèàêîôçù]+)\s+Née?\s+le/);
    if (nomCompletMatch) {
      nom = nomCompletMatch[1];
      prenom = nomCompletMatch[2];
    } else {
      // Fallback: chercher nom en majuscules suivi d'un prénom
      const nomsAIgnorer = ['WAZIERS', 'ROLLAND', 'COLLEGE', 'ROMAIN', 'ALLEE', 'GEORGES', 'LARUE', 'TRIMESTRE', 'BULLETIN', 'POLE', 'SCIENCES'];
      const nomsMatch = normalizedText.match(/\b([A-Z]{3,})\s+([A-Z][a-zéèàêîôçù]+)\b/g);
      if (nomsMatch) {
        for (const match of nomsMatch) {
          const parts = match.match(/([A-Z]{3,})\s+([A-Z][a-zéèàêîôçù]+)/);
          if (parts && !nomsAIgnorer.includes(parts[1])) {
            nom = parts[1];
            prenom = parts[2];
            break;
          }
        }
      }
    }
    
    console.log('Nom détecté:', nom, '- Prénom:', prenom);
    
    const dateNaissance = normalizedText.match(/Née?\s+le\s+(\d{2}\/\d{2}\/\d{4})/)?.[1] || '';
    const classeMatch = normalizedText.match(/3[eè](\d+)/);
    const classe = classeMatch ? `3e${classeMatch[1]}` : '';
    const trimestre = normalizedText.match(/(\d+)(?:er|ème|eme)\s+Trimestre/i)?.[0] || '';
    
    const matieres: BulletinEleveData['matieres'] = [];
    
    // Liste des matières avec leurs variations possibles
    const matieresMap = {
      'MATHEMATIQUES': ['MATHEMATIQUES', 'MATHS'],
      'PHYSIQUE-CHIMIE': ['PHYSIQUE-CHIMIE', 'PHYSIQUE CHIMIE', 'SC.PHYSIQUES', 'SCIENCES PHYSIQUES'],
      'SCIENCES VIE & TERRE': ['SCIENCES VIE & TERRE', 'SCIENCES VIE ET TERRE', 'SVT', 'SC.VIE & TERRE'],
      'TECHNOLOGIE': ['TECHNOLOGIE', 'TECHNO'],
      'ANGLAIS LV1': ['ANGLAIS LV1', 'ANGLAIS'],
      'FRANCAIS': ['FRANCAIS', 'FRANÇAIS'],
      'HISTOIRE-GEOGRAPHIE': ['HISTOIRE-GEOGRAPHIE', 'HISTOIRE GEOGRAPHIE', 'HIST-GEO', 'HISTOIRE-GEO'],
      'ESPAGNOL LV2': ['ESPAGNOL LV2', 'ESPAGNOL'],
      'ITALIEN LV2': ['ITALIEN LV2', 'ITALIEN'],
      'ARTS PLASTIQUES': ['ARTS PLASTIQUES', 'ARTS PLAST.'],
      'ED.PHYSIQUE & SPORT.': ['ED.PHYSIQUE & SPORT.', 'ED PHYSIQUE', 'EPS', 'EDUCATION PHYSIQUE'],
      'EDUCATION MUSICALE': ['EDUCATION MUSICALE', 'ED.MUSICALE', 'MUSIQUE'],
      'ATELIER SCIENTIFIQUE': ['ATELIER SCIENTIFIQUE', 'ATELIER SCIENT.']
    };
    
    // Pour chaque matière, chercher ses occurrences
    // Le format PRONOTE est: MATIERE [PROF] NOTE1_ELEVE NOTE2_ELEVE NOTE1_CLASSE NOTE2_CLASSE APPRECIATION
    for (const [nomMatiere, variations] of Object.entries(matieresMap)) {
      for (const variation of variations) {
        // Pattern pour capturer 4 notes (2 élève + 2 classe) puis l'appréciation
        const pattern = new RegExp(
          `${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+` +
          `(?:M\\.|Mme|Mlle)?\\s*[A-Z]*\\s*` + // Prof optionnel
          `(\\d+[,\\.]\\d+)\\s+` + // Note 1 élève
          `(\\d+[,\\.]\\d+)\\s+` + // Note 2 élève
          `(\\d+[,\\.]\\d+)\\s+` + // Note 1 classe
          `(\\d+[,\\.]\\d+)\\s+` + // Note 2 classe
          `([A-Za-zÀ-ÿ\\'\\-\\s]{10,}?)(?=(?:MATHEMATIQUES|PHYSIQUE|SCIENCES|TECHNOLOGIE|ANGLAIS|FRANCAIS|HISTOIRE|ESPAGNOL|ITALIEN|ARTS|EDUCATION|ATELIER|ED\\.|POLE|Moyennes|Absences|Appréciation|Vie scolaire)|$)`,
          'i'
        );
        
        const match = normalizedText.match(pattern);
        
        if (match) {
          // Prendre la première note de chaque paire (ou faire la moyenne)
          const moyEleve = parseFloat(match[1].replace(',', '.'));
          const moyClasse = parseFloat(match[3].replace(',', '.'));
          let appreciation = match[5] ? match[5].trim().replace(/\s+/g, ' ') : '';
          
          // Nettoyer l'appréciation
          appreciation = appreciation.replace(/^[:\s]+/, '').replace(/\s+$/, '');
          
          // Déterminer le pôle selon la matière
          let pole = '';
          if (['MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SCIENCES VIE & TERRE', 'TECHNOLOGIE', 'ATELIER SCIENTIFIQUE'].includes(nomMatiere)) {
            pole = 'Sciences';
          } else if (['ANGLAIS LV1', 'FRANCAIS', 'HISTOIRE-GEOGRAPHIE', 'ESPAGNOL LV2', 'ITALIEN LV2'].includes(nomMatiere)) {
            pole = 'Littéraire';
          } else if (['ARTS PLASTIQUES', 'ED.PHYSIQUE & SPORT.', 'EDUCATION MUSICALE'].includes(nomMatiere)) {
            pole = 'Artistique et culturelle';
          }
          
          if (moyEleve >= 0 && moyEleve <= 20 && moyClasse >= 0 && moyClasse <= 20) {
            matieres.push({
              nom: nomMatiere,
              moyenneEleve: moyEleve,
              moyenneClasse: moyClasse,
              appreciation: appreciation,
              pole: pole
            });
            console.log('✓ Matière détectée:', nomMatiere, '| Élève:', moyEleve, '| Classe:', moyClasse, '| App:', appreciation.substring(0, 30) + '...');
            break; // Sortir de la boucle des variations si une correspondance est trouvée
          }
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
    
    // Validation: besoin d'au moins un nom et des matières
    if (!nom) {
      console.log('❌ Bulletin invalide - nom manquant');
      return null;
    }
    
    if (matieres.length === 0) {
      console.log('❌ Bulletin invalide pour', nom, '- aucune matière extraite');
      return null;
    }
    
    console.log('✓ Bulletin valide pour', nom, prenom, '-', matieres.length, 'matières');
    
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

export async function parseBulletinsElevesFromPDF(file: File): Promise<BulletinEleveData[]> {
  try {
    const pages = await extractTextFromPDFByPage(file);
    const bulletins: BulletinEleveData[] = [];
    
    for (const pageText of pages) {
      const bulletin = parseBulletinEleve(pageText);
      if (bulletin && bulletin.nom && bulletin.prenom) {
        bulletins.push(bulletin);
      }
    }
    
    return bulletins;
  } catch (error) {
    console.error('Erreur lors du parsing des bulletins élèves:', error);
    throw new Error('Impossible de parser les bulletins élèves du PDF.');
  }
}
