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
    console.log('Texte extrait (200 premiers chars):', text.substring(0, 200));
    
    // Extraction des informations de l'élève avec plusieurs patterns
    let nom = '', prenom = '';
    
    // Pattern 1: "NOM Prenom Né(e) le"
    let nomCompletMatch = text.match(/([A-Z]{2,})\s+([A-Z][a-zé]+)\s+Née?\s+le/);
    if (nomCompletMatch) {
      nom = nomCompletMatch[1];
      prenom = nomCompletMatch[2];
    } else {
      // Pattern 2: Chercher nom en majuscules suivi d'un prénom
      nomCompletMatch = text.match(/\b([A-Z]{3,})\s+([A-Z][a-zéè]+)\b/);
      if (nomCompletMatch) {
        nom = nomCompletMatch[1];
        prenom = nomCompletMatch[2];
      }
    }
    
    console.log('Nom détecté:', nom, '- Prénom:', prenom);
    
    const dateNaissance = text.match(/Née?\s+le\s+(\d{2}\/\d{2}\/\d{4})/)?.[1] || '';
    const classeMatch = text.match(/3[eè](\d+)/);
    const classe = classeMatch ? `3e${classeMatch[1]}` : '';
    const trimestre = text.match(/(\d+)(?:er|ème|eme)\s+Trimestre/i)?.[0] || '';
    
    const matieres: BulletinEleveData['matieres'] = [];
    let poleActuel = '';
    
    // Normaliser le texte pour faciliter l'extraction
    const normalizedText = text.replace(/\s+/g, ' ');
    const lines = text.split('\n');
    
    // Détection des matières avec différents patterns
    const matierePatterns = [
      // Pattern 1: MATIERE moyEleve moyClasse appreciation
      /^([A-Z][A-Z\s&\.\-']+?)\s+(\d+[,\.]\d+)\s+(\d+[,\.]\d+)\s+(.+)$/,
      // Pattern 2: MATIERE moyEleve appreciation (sans moyenne classe)
      /^([A-Z][A-Z\s&\.\-']+?)\s+(\d+[,\.]\d+)\s+([A-Za-zÀ-ÿ].{10,})$/,
      // Pattern 3: MATIERE seule (ligne de pole)
      /^(POLE\s+[A-Z]+|[A-Z\s&\.\-']{3,})\s+(\d+[,\.]\d+)?\s*$/
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Détecter les pôles
      if (line.match(/POLE\s+SCIENCES|SCIENCES\s+\d+[,\.]\d+/i)) {
        poleActuel = 'Sciences';
      } else if (line.match(/POLE\s+LITTERAIRE|LITTERAIRE\s+\d+[,\.]\d+/i)) {
        poleActuel = 'Littéraire';
      } else if (line.match(/ARTISTIQUE|CULTURELLE/i)) {
        poleActuel = 'Artistique et culturelle';
      }
      
      // Essayer chaque pattern
      for (const pattern of matierePatterns) {
        const match = line.match(pattern);
        if (match && match[2]) { // Si on a au moins une moyenne
          const nomMatiere = match[1].trim();
          
          // Ignorer les lignes de pôles
          if (nomMatiere.startsWith('POLE') || nomMatiere === 'SCIENCES' || nomMatiere === 'LITTERAIRE') {
            continue;
          }
          
          const moyEleve = parseFloat(match[2].replace(',', '.'));
          let moyClasse = moyEleve; // Par défaut, si pas de moyenne classe
          let appreciation = '';
          
          if (match[4]) {
            // Pattern 1: deux moyennes + appréciation
            moyClasse = parseFloat(match[3].replace(',', '.'));
            appreciation = match[4].trim();
          } else if (match[3] && isNaN(parseFloat(match[3]))) {
            // Pattern 2: une moyenne + appréciation
            appreciation = match[3].trim();
          }
          
          // Vérifier que c'est bien une matière valide
          if (nomMatiere.length > 2 && moyEleve >= 0 && moyEleve <= 20) {
            matieres.push({
              nom: nomMatiere,
              moyenneEleve: moyEleve,
              moyenneClasse: moyClasse,
              appreciation: appreciation,
              pole: poleActuel
            });
            console.log('Matière détectée:', nomMatiere, moyEleve, moyClasse);
            break; // Sortir de la boucle des patterns
          }
        }
      }
    }
    
    console.log('Nombre de matières extraites:', matieres.length);
    
    // Extraction de l'appréciation générale
    const appreciationMatch = text.match(/Appréciation\s+globale\s*:?\s*(.+?)(?=Mentions|Signature|$)/si);
    const appreciationGenerale = appreciationMatch?.[1]?.trim().replace(/\s+/g, ' ') || '';
    
    // Extraction vie scolaire avec patterns plus flexibles
    let absences = 0, retards = 0;
    
    const absencesMatch = text.match(/Absences?\s*:?\s*(\d+)|(\d+)\s+demi-journée/i);
    if (absencesMatch) {
      absences = parseInt(absencesMatch[1] || absencesMatch[2]);
    } else if (text.match(/Aucune?\s+absence/i)) {
      absences = 0;
    }
    
    const retardsMatch = text.match(/Retards?\s*:?\s*(\d+)/i);
    if (retardsMatch) {
      retards = parseInt(retardsMatch[1]);
    } else if (text.match(/Aucune?\s+retard/i)) {
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
