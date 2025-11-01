import Papa from 'papaparse';

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
