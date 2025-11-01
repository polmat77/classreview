import * as pdfjsLib from 'pdfjs-dist';

// Configure le worker avec une URL relative qui fonctionne avec Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

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
    const lignes = text.split('\n');
    
    // Extraction des informations de l'élève
    const nomCompletMatch = text.match(/([A-Z]+)\s+([A-Z][a-z]+)\s+Née?\s+le/);
    const nom = nomCompletMatch?.[1] || '';
    const prenom = nomCompletMatch?.[2] || '';
    const dateNaissance = text.match(/Née?\s+le\s+(\d{2}\/\d{2}\/\d{4})/)?.[1] || '';
    
    const classeMatch = text.match(/3[eè](\d+)/);
    const classe = classeMatch ? `3e${classeMatch[1]}` : '';
    const trimestre = text.match(/(\d+)(?:er|ème)\s+Trimestre/)?.[0] || '';
    
    const matieres: BulletinEleveData['matieres'] = [];
    let poleActuel = '';
    
    // Pattern pour extraire les lignes de matières du tableau
    // Format: MATIERE | moyenneEleve | moyenneClasse | appreciation
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détecter les pôles
      if (line.includes('POLE SCIENCES')) {
        poleActuel = 'Sciences';
        continue;
      }
      if (line.includes('POLE LITTERAIRE')) {
        poleActuel = 'Littéraire';
        continue;
      }
      if (line.includes('ARTISTIQUE')) {
        poleActuel = 'Artistique et culturelle';
        continue;
      }
      
      // Matcher les lignes de matières
      const matiereMatch = line.match(/^([A-Z][A-Z\s&-]+)\s+(\d+[,\.]\d+)\s+(\d+[,\.]\d+)\s+(.+)$/);
      if (matiereMatch) {
        const [, nomMatiere, moyEleve, moyClasse, appreciation] = matiereMatch;
        
        matieres.push({
          nom: nomMatiere.trim(),
          moyenneEleve: parseFloat(moyEleve.replace(',', '.')),
          moyenneClasse: parseFloat(moyClasse.replace(',', '.')),
          appreciation: appreciation.trim(),
          pole: poleActuel
        });
      }
    }
    
    // Extraction de l'appréciation générale
    const appreciationMatch = text.match(/Appréciation générale[:\s]+(.+?)(?=Signature|$)/s);
    const appreciationGenerale = appreciationMatch?.[1]?.trim() || '';
    
    // Extraction vie scolaire
    const absencesMatch = text.match(/Absences[:\s]+(\d+)/);
    const retardsMatch = text.match(/Retards[:\s]+(\d+)/);
    
    return {
      nom,
      prenom,
      dateNaissance,
      classe,
      trimestre,
      matieres,
      appreciationGenerale,
      absences: absencesMatch ? parseInt(absencesMatch[1]) : 0,
      retards: retardsMatch ? parseInt(retardsMatch[1]) : 0
    };
  } catch (error) {
    console.error('Erreur lors du parsing du bulletin élève:', error);
    return null;
  }
}
