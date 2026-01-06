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
    const nomCompletMatch = normalizedText.match(/([A-Z]{2,})\s+([A-ZÉÈÀÊÎÔÇÙa-zéèàêîôçùïü]+)\s+Née?\s+le/);
    if (nomCompletMatch) {
      nom = nomCompletMatch[1];
      prenom = nomCompletMatch[2];
    } else {
      // Fallback: chercher nom en majuscules suivi d'un prénom
      const nomsAIgnorer = ['WAZIERS', 'ROLLAND', 'COLLEGE', 'ROMAIN', 'ALLEE', 'GEORGES', 'LARUE', 'TRIMESTRE', 'BULLETIN', 'POLE', 'SCIENCES'];
      const nomsMatch = normalizedText.match(/\b([A-Z]{3,})\s+([A-ZÉÈÀÊÎÔÇÙa-zéèàêîôçùïü]+)\b/g);
      if (nomsMatch) {
        for (const match of nomsMatch) {
          const parts = match.match(/([A-Z]{3,})\s+([A-ZÉÈÀÊÎÔÇÙa-zéèàêîôçùïü]+)/);
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
    // Le format extrait par pdf.js est: "MATHEMATIQUES M. ROBINEAU 9,30 5,75 11,85 10,40 Ensemble..."
    // ou parfois: "MATHEMATIQUES 9,30 5,75 11,85 10,40 Ensemble..."
    for (const matiere of matieresConnues) {
      // Créer un pattern qui capture:
      // 1. La matière (échappée pour les caractères spéciaux)
      // 2. Optionnellement le prof (M./Mme + nom)
      // 3. 2 à 4 nombres décimaux
      // 4. L'appréciation (texte jusqu'à la prochaine matière ou fin)
      const matiereEscaped = matiere.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Pattern plus flexible pour capturer les notes (peut y avoir 2, 3 ou 4 nombres)
      const pattern = new RegExp(
        matiereEscaped + 
        '(?:\\s+(?:M\\.|Mme|Mlle)\\s*[A-Z]+)?' + // Prof optionnel
        '\\s+' +
        '(\\d+[,\\.]\\d+)\\s+' + // Premier nombre (moyenne élève ou première sous-note)
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
        
        // Si on a 4 nombres: les 2 premiers sont pour l'élève, les 2 derniers pour la classe
        // Si on a 2 nombres: le 1er est élève, le 2ème est classe
        if (nums.length >= 4) {
          moyEleve = nums[0]; // ou (nums[0] + nums[1]) / 2 si ce sont des sous-notes
          moyClasse = nums[2]; // ou (nums[2] + nums[3]) / 2
        } else if (nums.length >= 2) {
          moyEleve = nums[0];
          moyClasse = nums[1];
        } else {
          continue;
        }
        
        let appreciation = match[5] ? match[5].trim().replace(/\s+/g, ' ') : '';
        
        // Nettoyer l'appréciation - ne garder que le texte pertinent
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
          console.log('✓ Matière détectée:', matiere, '| Élève:', moyEleve, '| Classe:', moyClasse, '| Nums:', nums.length);
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
    
    // Validation assouplie: accepter même sans matières (données peuvent venir du CSV)
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
