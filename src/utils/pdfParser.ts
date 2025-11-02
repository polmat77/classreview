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
    console.log('Texte extrait (500 premiers chars):', text.substring(0, 500));
    
    // Extraction des informations de l'élève avec plusieurs patterns
    let nom = '', prenom = '';
    
    // Pattern 1: "NOM Prenom Né(e) le"
    let nomCompletMatch = text.match(/([A-Z]{2,})\s+([A-Z][a-zéèà]+)\s+Née?\s+le/);
    if (nomCompletMatch) {
      nom = nomCompletMatch[1];
      prenom = nomCompletMatch[2];
    } else {
      // Pattern 2: Chercher nom en majuscules suivi d'un prénom (éviter WAZIERS, ROLLAND, etc.)
      const nomsAIgnorer = ['WAZIERS', 'ROLLAND', 'COLLEGE', 'ROMAIN', 'ALLEE', 'GEORGES', 'LARUE', 'TRIMESTRE', 'BULLETIN'];
      const nomsMatch = text.match(/\b([A-Z]{3,})\s+([A-Z][a-zéèà]+)\b/g);
      if (nomsMatch) {
        for (const match of nomsMatch) {
          const parts = match.match(/([A-Z]{3,})\s+([A-Z][a-zéèà]+)/);
          if (parts && !nomsAIgnorer.includes(parts[1])) {
            nom = parts[1];
            prenom = parts[2];
            break;
          }
        }
      }
    }
    
    console.log('Nom détecté:', nom, '- Prénom:', prenom);
    
    const dateNaissance = text.match(/Née?\s+le\s+(\d{2}\/\d{2}\/\d{4})/)?.[1] || '';
    const classeMatch = text.match(/3[eè](\d+)/);
    const classe = classeMatch ? `3e${classeMatch[1]}` : '';
    const trimestre = text.match(/(\d+)(?:er|ème|eme)\s+Trimestre/i)?.[0] || '';
    
    const matieres: BulletinEleveData['matieres'] = [];
    let poleActuel = '';
    
    // Liste des matières possibles pour mieux les détecter
    const matieresConnues = [
      'MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SCIENCES VIE & TERRE', 'TECHNOLOGIE',
      'ANGLAIS LV1', 'FRANCAIS', 'HISTOIRE-GEOGRAPHIE', 'ESPAGNOL LV2', 'ITALIEN LV2',
      'ARTS PLASTIQUES', 'ED.PHYSIQUE & SPORT.', 'EDUCATION MUSICALE', 'ATELIER SCIENTIFIQUE'
    ];
    
    // Normaliser le texte: remplacer plusieurs espaces par un seul
    const normalizedText = text.replace(/\s+/g, ' ');
    
    // Pattern global pour détecter: NOM_MATIERE nombre(,nombre) nombre(,nombre) texte
    // Exemple: "MATHEMATIQUES 5,75 10,40 Ensemble très insuffisant..."
    const globalPattern = new RegExp(
      `(${matieresConnues.join('|')})\\s+(\\d+[,\\.]\\d+)(?:\\s+(\\d+[,\\.]\\d+))?\\s+([A-Za-zÀ-ÿ][^\\d]{10,}?)(?=${matieresConnues.join('|')}|Moyennes générales|Absences|Appréciation|$)`,
      'g'
    );
    
    // Détecter les pôles dans le texte
    if (normalizedText.includes('POLE SCIENCES') || normalizedText.includes('SCIENCES ')) {
      poleActuel = 'Sciences';
    }
    
    let match;
    while ((match = globalPattern.exec(normalizedText)) !== null) {
      const nomMatiere = match[1].trim();
      const moyEleve = parseFloat(match[2].replace(',', '.'));
      const moyClasse = match[3] ? parseFloat(match[3].replace(',', '.')) : moyEleve;
      const appreciation = match[4] ? match[4].trim().replace(/\s+/g, ' ') : '';
      
      // Déterminer le pôle selon la matière
      if (['MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SCIENCES VIE & TERRE', 'TECHNOLOGIE'].includes(nomMatiere)) {
        poleActuel = 'Sciences';
      } else if (['ANGLAIS LV1', 'FRANCAIS', 'HISTOIRE-GEOGRAPHIE', 'ESPAGNOL LV2', 'ITALIEN LV2'].includes(nomMatiere)) {
        poleActuel = 'Littéraire';
      } else if (['ARTS PLASTIQUES', 'ED.PHYSIQUE & SPORT.', 'EDUCATION MUSICALE', 'ATELIER SCIENTIFIQUE'].includes(nomMatiere)) {
        poleActuel = 'Artistique et culturelle';
      }
      
      if (moyEleve >= 0 && moyEleve <= 20) {
        matieres.push({
          nom: nomMatiere,
          moyenneEleve: moyEleve,
          moyenneClasse: moyClasse,
          appreciation: appreciation,
          pole: poleActuel
        });
        console.log('Matière détectée:', nomMatiere, 'élève:', moyEleve, 'classe:', moyClasse);
      }
    }
    
    console.log('Nombre de matières extraites:', matieres.length);
    
    // Extraction de l'appréciation générale
    const appreciationMatch = normalizedText.match(/Appréciation\s+globale\s*:?\s*(.+?)(?=Mentions|Signature|$)/i);
    const appreciationGenerale = appreciationMatch?.[1]?.trim().replace(/\s+/g, ' ') || '';
    
    // Extraction vie scolaire
    let absences = 0, retards = 0;
    
    const absencesMatch = normalizedText.match(/Absences?\s*:?\s*(\d+)|(\d+)\s+demi-journée/i);
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
    
    // Ne retourner que si on a au moins un nom et au moins une matière
    if (!nom || matieres.length === 0) {
      console.log('Bulletin invalide - nom:', nom, 'matières:', matieres.length);
      return null;
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
