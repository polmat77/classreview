import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure le worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface EleveData {
  nom: string;
  dateNaissance: string;
  absences: number;
  retards: number;
  rang: number;
  moyenneGenerale: number;
  moyennesParMatiere: Record<string, number>;
  moyennesParPole: Record<string, number>;
}

export interface ClasseDataCSV {
  eleves: EleveData[];
  matieres: string[];
  poles: Record<string, string[]>; // pole -> liste des matières
  statistiques: {
    moyenneClasse: number;
    totalEleves: number;
    totalAbsences: number;
    totalRetards: number;
  };
}

// Parser le tableau PDF de moyennes
export async function parseTableauMoyennesPDF(file: File): Promise<ClasseDataCSV | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extraire le texte avec positions pour reconstituer le tableau
    const allItems: { str: string; x: number; y: number; page: number }[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      for (const item of textContent.items) {
        const textItem = item as any;
        if (textItem.str && textItem.str.trim()) {
          allItems.push({
            str: textItem.str.trim(),
            x: Math.round(textItem.transform[4]),
            y: Math.round(textItem.transform[5]),
            page: pageNum
          });
        }
      }
    }
    
    // Trier par page, puis par Y décroissant (haut vers bas), puis par X croissant (gauche vers droite)
    allItems.sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(a.y - b.y) > 5) return b.y - a.y; // Y décroissant
      return a.x - b.x; // X croissant
    });
    
    // Regrouper par lignes (Y similaires à ±8 pixels)
    const lignes: { str: string; x: number; y: number }[][] = [];
    let currentLigne: { str: string; x: number; y: number }[] = [];
    let lastY = -1;
    
    for (const item of allItems) {
      if (lastY === -1 || Math.abs(item.y - lastY) <= 8) {
        currentLigne.push(item);
        lastY = item.y;
      } else {
        if (currentLigne.length > 0) {
          currentLigne.sort((a, b) => a.x - b.x);
          lignes.push(currentLigne);
        }
        currentLigne = [item];
        lastY = item.y;
      }
    }
    if (currentLigne.length > 0) {
      currentLigne.sort((a, b) => a.x - b.x);
      lignes.push(currentLigne);
    }
    
    console.log('PDF Tableau - Nombre de lignes:', lignes.length);
    
    // Identifier les matières depuis les premières lignes (en-têtes)
    const matieresConnues = [
      'MATHÉMATIQUES', 'MATHS', 'MATHEMATIQUES',
      'FRANÇAIS', 'FRANCAIS',
      'HISTOIRE-GÉOGRAPHIE', 'HISTOIRE-GEOGRAPHIE', 'HISTOIRE GÉO',
      'ANGLAIS', 'LV1',
      'ESPAGNOL', 'LV2',
      'PHYSIQUE-CHIMIE', 'PHYSIQUE', 'SCIENCES PHYSIQUES',
      'SVT', 'SCIENCES VIE & TERRE',
      'TECHNOLOGIE', 'TECHNO',
      'EPS', 'EDUCATION PHYSIQUE',
      'ARTS PLASTIQUES',
      'ÉDUCATION MUSICALE', 'EDUCATION MUSICALE', 'MUSIQUE',
      'EPI'
    ];
    
    // Normaliser les noms de matières
    const normaliserMatiere = (nom: string): string => {
      const lower = nom.toLowerCase();
      if (lower.includes('math')) return 'MATHEMATIQUES';
      if (lower.includes('français') || lower.includes('francais')) return 'FRANÇAIS';
      if (lower.includes('histoire') || lower.includes('géo') || lower.includes('geo')) return 'HISTOIRE-GÉOGRAPHIE';
      if (lower.includes('anglais') || lower === 'lv1') return 'ANGLAIS LV1';
      if (lower.includes('espagnol') || lower === 'lv2') return 'ESPAGNOL LV2';
      if (lower.includes('physique')) return 'PHYSIQUE-CHIMIE';
      if (lower.includes('svt') || lower.includes('sciences vie')) return 'SVT';
      if (lower.includes('techno')) return 'TECHNOLOGIE';
      if (lower.includes('eps') || lower.includes('éducation physique')) return 'EPS';
      if (lower.includes('arts') || lower.includes('plastiques')) return 'ARTS PLASTIQUES';
      if (lower.includes('musique') || lower.includes('musicale')) return 'ÉDUCATION MUSICALE';
      if (lower.includes('epi')) return 'EPI';
      return nom.toUpperCase();
    };
    
    // Trouver les matières détectées dans les en-têtes
    const matieresDetectees: string[] = [];
    const matieresTexte = lignes.slice(0, 5).flat().map(i => i.str);
    
    for (const text of matieresTexte) {
      for (const m of matieresConnues) {
        if (text.toUpperCase().includes(m)) {
          const normalized = normaliserMatiere(m);
          if (!matieresDetectees.includes(normalized)) {
            matieresDetectees.push(normalized);
          }
          break;
        }
      }
    }
    
    console.log('Matières détectées:', matieresDetectees);
    
    // Parser les lignes d'élèves
    const eleves: EleveData[] = [];
    
    // Pattern pour détecter un nom d'élève (NOM Prénom ou NOM prénom)
    const nomPattern = /^([A-ZÀ-Ÿ]{2,})\s+([A-ZÀ-Ÿa-zà-ÿ]+)$/;
    const nombrePattern = /^(\d+[,\.]\d+|\d+|Abs)$/;
    
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      const texte = ligne.map(item => item.str).join(' ');
      
      // Chercher un nom au début de la ligne
      const premierItem = ligne[0]?.str || '';
      const deuxiemeItem = ligne[1]?.str || '';
      const nomComplet = `${premierItem} ${deuxiemeItem}`.trim();
      
      let nomMatch = nomComplet.match(nomPattern);
      if (!nomMatch && premierItem.length > 0) {
        // Essayer juste le premier item s'il contient nom et prénom
        const parts = premierItem.split(/\s+/);
        if (parts.length >= 2 && parts[0] === parts[0].toUpperCase() && parts[0].length >= 2) {
          nomMatch = [premierItem, parts[0], parts.slice(1).join(' ')];
        }
      }
      
      if (!nomMatch) continue;
      
      const nom = `${nomMatch[1]} ${nomMatch[2]}`;
      
      // Extraire tous les nombres de la ligne
      const nombres: number[] = [];
      for (const item of ligne) {
        const match = item.str.match(nombrePattern);
        if (match && match[1] !== 'Abs') {
          nombres.push(parseFloat(match[1].replace(',', '.')));
        }
      }
      
      if (nombres.length === 0) continue;
      
      // Le premier nombre après les absences/retards est généralement la moyenne générale
      // Structure typique: Nom, absences(opt), retards(opt), moyenne, puis moyennes par matière
      let absences = 0, retards = 0, moyenneGenerale = 0;
      const moyennesParMatiere: Record<string, number> = {};
      
      // Chercher absences/retards en début de ligne (petits nombres entiers)
      let startIdx = 0;
      
      // Premier nombre: si < 100 et entier, c'est probablement absences
      if (nombres.length > 0 && nombres[0] < 100 && Number.isInteger(nombres[0])) {
        absences = nombres[0];
        startIdx = 1;
        // Deuxième nombre: si < 20 et entier, c'est probablement retards
        if (nombres.length > 1 && nombres[1] < 20 && Number.isInteger(nombres[1])) {
          retards = nombres[1];
          startIdx = 2;
        }
      }
      
      // Prochain nombre: moyenne générale (entre 0 et 20)
      if (nombres.length > startIdx && nombres[startIdx] <= 20) {
        moyenneGenerale = nombres[startIdx];
        startIdx++;
      }
      
      // Reste: moyennes par matière (dans l'ordre des matières détectées)
      const notesRestantes = nombres.slice(startIdx).filter(n => n <= 20);
      
      for (let j = 0; j < Math.min(notesRestantes.length, matieresDetectees.length); j++) {
        moyennesParMatiere[matieresDetectees[j]] = notesRestantes[j];
      }
      
      // Déterminer le pôle pour chaque matière
      const moyennesParPole: Record<string, number> = {};
      const poles: Record<string, string[]> = {
        'POLE SCIENTIFIQUE': ['MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SVT', 'TECHNOLOGIE'],
        'POLE LITTERAIRE': ['FRANÇAIS', 'HISTOIRE-GÉOGRAPHIE', 'ANGLAIS LV1', 'ESPAGNOL LV2'],
        'EXPRESSION ARTISTIQUE': ['ARTS PLASTIQUES', 'ÉDUCATION MUSICALE', 'EPS']
      };
      
      for (const [pole, matieres] of Object.entries(poles)) {
        const moyennes = matieres
          .map(m => moyennesParMatiere[m])
          .filter(v => v !== undefined);
        if (moyennes.length > 0) {
          moyennesParPole[pole] = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
        }
      }
      
      eleves.push({
        nom,
        dateNaissance: '',
        absences,
        retards,
        rang: 0,
        moyenneGenerale,
        moyennesParMatiere,
        moyennesParPole
      });
      
      console.log('Élève extrait:', nom, '| Moy:', moyenneGenerale, '| Matières:', Object.keys(moyennesParMatiere).length);
    }
    
    console.log('Total élèves extraits:', eleves.length);
    
    if (eleves.length === 0) {
      return null;
    }
    
    // Calculer les rangs
    eleves.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
    eleves.forEach((e, idx) => e.rang = idx + 1);
    
    // Calculer les statistiques
    const totalMoyennes = eleves.reduce((sum, e) => sum + e.moyenneGenerale, 0);
    const totalAbsences = eleves.reduce((sum, e) => sum + e.absences, 0);
    const totalRetards = eleves.reduce((sum, e) => sum + e.retards, 0);
    
    return {
      eleves,
      matieres: matieresDetectees,
      poles: {
        'POLE SCIENTIFIQUE': ['MATHEMATIQUES', 'PHYSIQUE-CHIMIE', 'SVT', 'TECHNOLOGIE'].filter(m => matieresDetectees.includes(m)),
        'POLE LITTERAIRE': ['FRANÇAIS', 'HISTOIRE-GÉOGRAPHIE', 'ANGLAIS LV1', 'ESPAGNOL LV2'].filter(m => matieresDetectees.includes(m)),
        'EXPRESSION ARTISTIQUE': ['ARTS PLASTIQUES', 'ÉDUCATION MUSICALE', 'EPS'].filter(m => matieresDetectees.includes(m))
      },
      statistiques: {
        moyenneClasse: eleves.length > 0 ? totalMoyennes / eleves.length : 0,
        totalEleves: eleves.length,
        totalAbsences,
        totalRetards
      }
    };
  } catch (error) {
    console.error('Erreur parsing PDF tableau:', error);
    return null;
  }
}

export async function parseCSVClasse(file: File): Promise<ClasseDataCSV | null> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      delimiter: ';',
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          
          if (rows.length < 4) {
            console.error('CSV invalide: pas assez de lignes');
            resolve(null);
            return;
          }

          // Ligne 1: En-têtes avec pôles
          const headerRow = rows[0];
          
          // Ligne 2: Noms des matières
          const matiereRow = rows[1];
          
          // Ligne 3: Coefficients (ignoré pour l'instant)
          
          // Identifier les colonnes des matières et leurs pôles
          const matiereColumns: { index: number; nom: string; pole: string }[] = [];
          const poles: Record<string, string[]> = {};
          
          let currentPole = '';
          for (let i = 0; i < headerRow.length; i++) {
            const poleHeader = headerRow[i]?.trim();
            const matiereName = matiereRow[i]?.trim();
            
            // Détecter les changements de pôle
            if (poleHeader && poleHeader.startsWith('POLE')) {
              currentPole = poleHeader;
              if (!poles[currentPole]) {
                poles[currentPole] = [];
              }
            } else if (poleHeader && poleHeader.includes('EXPRESSION ARTISTIQUE')) {
              currentPole = 'EXPRESSION ARTISTIQUE ET CULTURELLE';
              if (!poles[currentPole]) {
                poles[currentPole] = [];
              }
            } else if (poleHeader && (poleHeader === 'OPTIONS' || poleHeader === 'DISCIPLINES TRANSVERSALES')) {
              currentPole = poleHeader;
              if (!poles[currentPole]) {
                poles[currentPole] = [];
              }
            }
            
            // Si on a un nom de matière valide
            if (matiereName && matiereName !== '' && i >= 9) { // Les matières commencent après les colonnes de base
              matiereColumns.push({
                index: i,
                nom: matiereName,
                pole: currentPole
              });
              
              if (currentPole && !poles[currentPole].includes(matiereName)) {
                poles[currentPole].push(matiereName);
              }
            }
          }

          // Parser les données des élèves (à partir de la ligne 4)
          const eleves: EleveData[] = [];
          let totalMoyennes = 0;
          let totalAbsences = 0;
          let totalRetards = 0;

          for (let i = 3; i < rows.length; i++) {
            const row = rows[i];
            
            const nom = row[0]?.replace(/"/g, '').trim() || '';
            if (!nom) continue; // Ligne vide
            
            const dateNaissance = row[1]?.trim() || '';
            const absences = parseInt(row[5]?.trim() || '0') || 0;
            const retards = parseInt(row[6]?.trim() || '0') || 0;
            const rang = parseInt(row[7]?.trim() || '0') || 0;
            const moyenneGenerale = parseFloat(row[8]?.replace(',', '.') || '0') || 0;
            
            totalMoyennes += moyenneGenerale;
            totalAbsences += absences;
            totalRetards += retards;

            // Extraire les moyennes par matière
            const moyennesParMatiere: Record<string, number> = {};
            const moyennesParPole: Record<string, number> = {};
            const compteurParPole: Record<string, number> = {};

            for (const matiere of matiereColumns) {
              const moyenneStr = row[matiere.index]?.trim();
              if (moyenneStr && moyenneStr !== '' && moyenneStr !== 'Abs' && !isNaN(parseFloat(moyenneStr.replace(',', '.')))) {
                const moyenne = parseFloat(moyenneStr.replace(',', '.'));
                moyennesParMatiere[matiere.nom] = moyenne;
                
                // Calculer la moyenne par pôle
                if (matiere.pole) {
                  if (!moyennesParPole[matiere.pole]) {
                    moyennesParPole[matiere.pole] = 0;
                    compteurParPole[matiere.pole] = 0;
                  }
                  moyennesParPole[matiere.pole] += moyenne;
                  compteurParPole[matiere.pole]++;
                }
              }
            }

            // Calculer les moyennes finales par pôle
            for (const pole in moyennesParPole) {
              if (compteurParPole[pole] > 0) {
                moyennesParPole[pole] = moyennesParPole[pole] / compteurParPole[pole];
              }
            }

            eleves.push({
              nom,
              dateNaissance,
              absences,
              retards,
              rang,
              moyenneGenerale,
              moyennesParMatiere,
              moyennesParPole
            });
          }

          const matieres = matiereColumns.map(m => m.nom);
          const moyenneClasse = eleves.length > 0 ? totalMoyennes / eleves.length : 0;

          resolve({
            eleves,
            matieres,
            poles,
            statistiques: {
              moyenneClasse,
              totalEleves: eleves.length,
              totalAbsences,
              totalRetards
            }
          });
        } catch (error) {
          console.error('Erreur lors du parsing du CSV:', error);
          resolve(null);
        }
      },
      error: (error) => {
        console.error('Erreur Papa Parse:', error);
        resolve(null);
      }
    });
  });
}

// Calculer les statistiques par matière
export function calculerStatistiquesMatiere(data: ClasseDataCSV, matiere: string) {
  const moyennes = data.eleves
    .map(e => e.moyennesParMatiere[matiere])
    .filter(m => m !== undefined && !isNaN(m));
  
  if (moyennes.length === 0) return null;
  
  const moyenne = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
  const min = Math.min(...moyennes);
  const max = Math.max(...moyennes);
  
  return { moyenne, min, max, nbEleves: moyennes.length };
}

// Calculer les statistiques par pôle
export function calculerStatistiquesPole(data: ClasseDataCSV, pole: string) {
  const moyennes = data.eleves
    .map(e => e.moyennesParPole[pole])
    .filter(m => m !== undefined && !isNaN(m));
  
  if (moyennes.length === 0) return null;
  
  const moyenne = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
  const min = Math.min(...moyennes);
  const max = Math.max(...moyennes);
  
  return { moyenne, min, max };
}
