import { ClasseDataCSV, EleveData } from '@/utils/csvParser';

// Calculate class average excluding NaN values
export function calculateClassAverage(eleves: EleveData[]): number {
  const validAverages = eleves
    .map(e => e.moyenneGenerale)
    .filter(avg => !isNaN(avg) && avg !== null && avg !== undefined);
  
  if (validAverages.length === 0) return 0;
  
  const sum = validAverages.reduce((acc, curr) => acc + curr, 0);
  return sum / validAverages.length;
}

// Get count of evaluated students
export function getEvaluatedStudentsCount(eleves: EleveData[]): number {
  return eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null).length;
}

// Calculate median
export function calculateMedian(eleves: EleveData[]): number {
  const validAverages = eleves
    .map(e => e.moyenneGenerale)
    .filter(avg => !isNaN(avg) && avg !== null && avg !== undefined)
    .sort((a, b) => a - b);
  
  if (validAverages.length === 0) return 0;
  
  const mid = Math.floor(validAverages.length / 2);
  
  if (validAverages.length % 2 === 0) {
    return (validAverages[mid - 1] + validAverages[mid]) / 2;
  }
  return validAverages[mid];
}

// Calculate standard deviation
export function calculateStdDev(eleves: EleveData[]): number {
  const validAverages = eleves
    .map(e => e.moyenneGenerale)
    .filter(avg => !isNaN(avg) && avg !== null && avg !== undefined);
  
  if (validAverages.length === 0) return 0;
  
  const mean = validAverages.reduce((acc, curr) => acc + curr, 0) / validAverages.length;
  const variance = validAverages.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / validAverages.length;
  
  return Math.sqrt(variance);
}

// Calculate success rate (students >= 10)
export function calculateSuccessRate(eleves: EleveData[]): number {
  const validStudents = eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null);
  const successStudents = validStudents.filter(e => e.moyenneGenerale >= 10);
  
  if (validStudents.length === 0) return 0;
  
  return Math.round((successStudents.length / validStudents.length) * 100);
}

// Get struggling students (average < 10)
export function getStrugglingStudents(eleves: EleveData[]): EleveData[] {
  return eleves
    .filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null && e.moyenneGenerale < 10)
    .sort((a, b) => a.moyenneGenerale - b.moyenneGenerale);
}

// Get absent/non-evaluated students
export function getAbsentStudents(eleves: EleveData[]): EleveData[] {
  return eleves.filter(e => isNaN(e.moyenneGenerale) || e.moyenneGenerale === null);
}

// Get excellent students (average >= 16)
export function getExcellentStudents(eleves: EleveData[]): EleveData[] {
  return eleves
    .filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null && e.moyenneGenerale >= 16)
    .sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
}

// Get top N students
export function getTopStudents(eleves: EleveData[], count: number = 3): EleveData[] {
  return eleves
    .filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null)
    .sort((a, b) => b.moyenneGenerale - a.moyenneGenerale)
    .slice(0, count);
}

// Get students above average
export function getStudentsAbove(eleves: EleveData[], threshold: number): number {
  return eleves.filter(e => 
    !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null && e.moyenneGenerale >= threshold
  ).length;
}

// Get students below average
export function getStudentsBelow(eleves: EleveData[], threshold: number): number {
  return eleves.filter(e => 
    !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null && e.moyenneGenerale < threshold
  ).length;
}

// Get weak subjects for a student
export function getWeakSubjects(eleve: EleveData, threshold: number = 10): string[] {
  const weakSubjects: string[] = [];
  Object.entries(eleve.moyennesParMatiere).forEach(([subject, grade]) => {
    if (!isNaN(grade) && grade < threshold) {
      weakSubjects.push(subject);
    }
  });
  return weakSubjects.slice(0, 3);
}

// Subject statistics
export interface SubjectStats {
  name: string;
  currentAvg: number;
  previousAvg?: number;
  trend: 'up' | 'down' | 'stable';
}

// Get subject averages with trends
export function getSubjectAverages(data: ClasseDataCSV): SubjectStats[] {
  return data.matieres.map(matiere => {
    const notes = data.eleves
      .map(e => e.moyennesParMatiere[matiere])
      .filter(n => n !== undefined && !isNaN(n));
    const avg = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
    
    return {
      name: matiere,
      currentAvg: avg,
      previousAvg: avg, // No previous data available
      trend: 'stable' as const,
    };
  });
}

// Get strong subjects (average >= 14)
export function getStrongSubjects(subjects: SubjectStats[]): SubjectStats[] {
  return subjects.filter(s => s.currentAvg >= 14).sort((a, b) => b.currentAvg - a.currentAvg);
}

// Get weak subjects for class (average < 12)
export function getWeakSubjectsClass(subjects: SubjectStats[]): SubjectStats[] {
  return subjects.filter(s => s.currentAvg < 12).sort((a, b) => a.currentAvg - b.currentAvg);
}

// AI Recommendations
export interface ClassAnalysisData {
  eleves: EleveData[];
  subjects: SubjectStats[];
  matieres: string[];
}

export function getPositivePoints(data: ClassAnalysisData): string[] {
  const points: string[] = [];
  
  // Success rate
  const successRate = calculateSuccessRate(data.eleves);
  if (successRate >= 75) {
    points.push(`Bon taux de réussite : ${successRate}% de la classe au-dessus de la moyenne`);
  }
  
  // Strong subjects
  const strongSubjects = data.subjects.filter(s => s.currentAvg >= 14);
  if (strongSubjects.length > 0) {
    points.push(`${strongSubjects.length} matière(s) avec de bons résultats : ${strongSubjects.map(s => s.name.split(' ')[0]).slice(0, 3).join(', ')}`);
  }
  
  // Homogeneity
  const stdDev = calculateStdDev(data.eleves);
  if (stdDev < 2.5) {
    points.push(`Classe relativement homogène (écart-type : ${stdDev.toFixed(2)})`);
  }
  
  // Excellent students
  const excellentStudents = getExcellentStudents(data.eleves);
  if (excellentStudents.length > 0) {
    points.push(`${excellentStudents.length} élève(s) en excellence (moyenne ≥ 16)`);
  }
  
  return points.length > 0 ? points : ['Données insuffisantes pour une analyse positive'];
}

export function getWarningPoints(data: ClassAnalysisData): string[] {
  const points: string[] = [];
  const totalEleves = data.eleves.length;
  
  // Struggling students
  const strugglingStudents = getStrugglingStudents(data.eleves);
  if (strugglingStudents.length > 0) {
    const percentage = Math.round((strugglingStudents.length / totalEleves) * 100);
    points.push(`${strugglingStudents.length} élève(s) en difficulté (${percentage}% de la classe)`);
  }
  
  // Absent students
  const absentStudents = getAbsentStudents(data.eleves);
  if (absentStudents.length > 0) {
    points.push(`${absentStudents.length} élève(s) avec données incomplètes`);
  }
  
  // Weak subjects
  const weakSubjects = data.subjects.filter(s => s.currentAvg < 12);
  if (weakSubjects.length > 0) {
    points.push(`Attention requise dans ${weakSubjects.length} matière(s) : ${weakSubjects.map(s => s.name.split(' ')[0]).slice(0, 3).join(', ')}`);
  }
  
  // Low success rate
  const successRate = calculateSuccessRate(data.eleves);
  if (successRate < 60) {
    points.push(`Taux de réussite préoccupant : seulement ${successRate}% au-dessus de la moyenne`);
  }
  
  return points.length > 0 ? points : ['Aucun point d\'attention majeur identifié'];
}

export function getSuggestedActions(data: ClassAnalysisData): string[] {
  const actions: string[] = [];
  
  // Tutoring for struggling students
  const strugglingStudents = getStrugglingStudents(data.eleves);
  if (strugglingStudents.length > 0 && strugglingStudents.length <= 5) {
    actions.push(`Mettre en place un suivi individualisé pour ${strugglingStudents.map(s => s.nom).join(', ')}`);
  } else if (strugglingStudents.length > 5) {
    actions.push(`Organiser des séances de soutien pour les ${strugglingStudents.length} élèves en difficulté`);
  }
  
  // Valorize top students
  const excellentStudents = getExcellentStudents(data.eleves);
  if (excellentStudents.length > 0) {
    actions.push(`Encourager et valoriser les ${excellentStudents.length} élève(s) en excellence`);
  }
  
  // Absent students follow-up
  const absentStudents = getAbsentStudents(data.eleves);
  if (absentStudents.length > 0) {
    actions.push(`Contacter les familles pour le suivi des absences`);
  }
  
  // Subject reinforcement
  const weakSubjects = data.subjects.filter(s => s.currentAvg < 10);
  if (weakSubjects.length > 0) {
    actions.push(`Renforcer l'accompagnement dans les matières en difficulté`);
  }
  
  // General class advice
  const successRate = calculateSuccessRate(data.eleves);
  if (successRate >= 80) {
    actions.push(`Maintenir la dynamique positive de la classe`);
  }
  
  return actions.slice(0, 4);
}
