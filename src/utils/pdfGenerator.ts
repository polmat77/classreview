import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BulletinClasseData, BulletinEleveData } from '@/utils/pdfParser';
import { ClasseDataCSV, EleveData } from '@/utils/csvParser';
import { Attribution, attributionConfig } from '@/types/attribution';
import { 
  calculateClassAverage, 
  calculateMedian, 
  calculateStdDev, 
  calculateSuccessRate,
  getEvaluatedStudentsCount,
  getTopStudents,
  getStrugglingStudents,
  getWeakSubjects,
  getSubjectAverages,
  getStrongSubjects,
  getWeakSubjectsClass,
  getPositivePoints,
  getWarningPoints,
  getSuggestedActions,
  SubjectStats
} from '@/utils/statisticsCalculations';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export interface ExportOptions {
  includeGraphs: boolean;
  includeComments: boolean;
  colorMode: boolean;
  schoolLogo: boolean;
  includeAttributions?: boolean;
}

export interface StudentAppreciationData {
  appreciation: string;
  attribution?: Attribution | null;
}

export interface ExportData {
  bulletinClasse?: BulletinClasseData;
  bulletinsEleves?: BulletinEleveData[];
  classeCSV?: ClasseDataCSV;
  generalAppreciation?: string;
  studentAppreciations?: string[];
  studentAttributions?: (Attribution | null)[];
  professeurPrincipal?: string;
}

const COLORS = {
  primary: [25, 45, 67] as [number, number, number],
  primaryLight: [44, 62, 80] as [number, number, number],
  accent: [245, 158, 11] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  excellent: [220, 252, 231] as [number, number, number],
  tresBien: [219, 234, 254] as [number, number, number],
  bien: [224, 231, 255] as [number, number, number],
  moyen: [254, 243, 199] as [number, number, number],
  insuffisant: [254, 215, 170] as [number, number, number],
  inquietant: [254, 226, 226] as [number, number, number],
};

const COLORS_BW = {
  primary: [0, 0, 0] as [number, number, number],
  primaryLight: [60, 60, 60] as [number, number, number],
  accent: [80, 80, 80] as [number, number, number],
  success: [40, 40, 40] as [number, number, number],
  warning: [100, 100, 100] as [number, number, number],
  danger: [0, 0, 0] as [number, number, number],
  text: [0, 0, 0] as [number, number, number],
  muted: [80, 80, 80] as [number, number, number],
  background: [255, 255, 255] as [number, number, number],
  excellent: [240, 240, 240] as [number, number, number],
  tresBien: [235, 235, 235] as [number, number, number],
  bien: [230, 230, 230] as [number, number, number],
  moyen: [225, 225, 225] as [number, number, number],
  insuffisant: [220, 220, 220] as [number, number, number],
  inquietant: [215, 215, 215] as [number, number, number],
};

function getColors(colorMode: boolean) {
  return colorMode ? COLORS : COLORS_BW;
}

// Grade distribution calculation
interface GradeRange {
  label: string;
  emoji: string;
  min: number;
  max: number;
  colorKey: keyof typeof COLORS;
}

const gradeRanges: GradeRange[] = [
  { label: 'Excellent', emoji: '🏆', min: 16, max: 20, colorKey: 'excellent' },
  { label: 'Très bien', emoji: '✨', min: 14, max: 16, colorKey: 'tresBien' },
  { label: 'Bien', emoji: '👍', min: 12, max: 14, colorKey: 'bien' },
  { label: 'Moyen', emoji: '📊', min: 10, max: 12, colorKey: 'moyen' },
  { label: 'Insuffisant', emoji: '⚠️', min: 8, max: 10, colorKey: 'insuffisant' },
  { label: 'Inquiétant', emoji: '🚨', min: 0, max: 8, colorKey: 'inquietant' },
];

function getGradeDistribution(eleves: EleveData[]) {
  const validStudents = eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale > 0);
  
  return gradeRanges.map(range => {
    const count = validStudents.filter(e => {
      if (range.min === 16) return e.moyenneGenerale >= range.min;
      if (range.min === 0) return e.moyenneGenerale < range.max;
      return e.moyenneGenerale >= range.min && e.moyenneGenerale < range.max;
    }).length;
    
    const percentage = validStudents.length > 0 ? Math.round((count / validStudents.length) * 100) : 0;
    
    return { ...range, count, percentage };
  });
}

function addPageHeader(doc: jsPDF, title: string, colors: typeof COLORS, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - 14, 10, { align: 'right' });
  
  doc.setTextColor(...colors.text);
}

function addCoverPage(doc: jsPDF, data: ExportData, colors: typeof COLORS) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ClassCouncil AI', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport du Conseil de Classe', pageWidth / 2, 50, { align: 'center' });
  
  const className = data.bulletinClasse?.classe || data.classeCSV?.eleves?.[0]?.nom?.match(/\d+[eè]m?e?/i)?.[0] || '3ème';
  const trimester = data.bulletinClasse?.trimestre || '1er Trimestre';
  const school = data.bulletinClasse?.etablissement || '';
  const year = data.bulletinClasse?.anneeScolaire || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1);
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth / 2 - 60, 100, 120, 80, 5, 5, 'F');
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(className, pageWidth / 2, 125, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  doc.text(trimester, pageWidth / 2, 145, { align: 'center' });
  doc.text(year, pageWidth / 2, 160, { align: 'center' });
  
  if (school) {
    doc.setFontSize(11);
    doc.text(school, pageWidth / 2, 175, { align: 'center' });
  }
  
  // Stats summary
  const nbEleves = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const nbMatieres = data.classeCSV?.matieres.length || data.bulletinClasse?.matieres.length || 0;
  const moyenneClasse = data.classeCSV?.statistiques.moyenneClasse || 
    (data.bulletinClasse?.matieres.reduce((s, m) => s + m.moyenne, 0) || 0) / (data.bulletinClasse?.matieres.length || 1);
  
  const statsY = 210;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(30, statsY, 45, 50, 3, 3, 'F');
  doc.roundedRect(82.5, statsY, 45, 50, 3, 3, 'F');
  doc.roundedRect(135, statsY, 45, 50, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(String(nbEleves), 52.5, statsY + 25, { align: 'center' });
  doc.text(String(nbMatieres), 105, statsY + 25, { align: 'center' });
  doc.text(isNaN(moyenneClasse) ? '-' : moyenneClasse.toFixed(1), 157.5, statsY + 25, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Élèves', 52.5, statsY + 40, { align: 'center' });
  doc.text('Matières', 105, statsY + 40, { align: 'center' });
  doc.text('Moyenne', 157.5, statsY + 40, { align: 'center' });
  
  // Professeur principal section
  const profPrincipal = data.professeurPrincipal || data.bulletinClasse?.professeurPrincipal || '';
  if (profPrincipal) {
    const profY = 280;
    doc.setFillColor(...colors.background);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth / 2 - 70, profY, 140, 35, 4, 4, 'FD');
    
    doc.setTextColor(...colors.muted);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professeur principal :', pageWidth / 2, profY + 12, { align: 'center' });
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(profPrincipal, pageWidth / 2, profY + 26, { align: 'center' });
  }
  
  // Footer
  doc.setTextColor(...colors.muted);
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par ClassCouncil AI`, pageWidth / 2, pageHeight - 20, { align: 'center' });
}

function addResultsAnalysisPage(doc: jsPDF, data: ExportData, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Analyse des résultats', colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 25;
  
  if (!data.classeCSV) {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(12);
    doc.text('Données d\'analyse non disponibles', pageWidth / 2, yPos + 20, { align: 'center' });
    return;
  }
  
  const eleves = data.classeCSV.eleves;
  
  // Title
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques principales', 14, yPos);
  yPos += 10;
  
  // KPI Grid (6 stats in 2 rows of 3)
  const kpiWidth = (pageWidth - 42) / 3;
  const kpiHeight = 28;
  
  const moyenne = calculateClassAverage(eleves);
  const mediane = calculateMedian(eleves);
  const ecartType = calculateStdDev(eleves);
  const tauxReussite = calculateSuccessRate(eleves);
  const nbEvalues = getEvaluatedStudentsCount(eleves);
  const nbMatieres = data.classeCSV.matieres.length;
  
  const kpis = [
    { label: 'Moyenne générale', value: isNaN(moyenne) ? '-' : moyenne.toFixed(2), icon: '📊' },
    { label: 'Médiane', value: isNaN(mediane) ? '-' : mediane.toFixed(2), icon: '👥' },
    { label: 'Écart-type', value: isNaN(ecartType) ? '-' : ecartType.toFixed(2), icon: '📈' },
    { label: 'Taux de réussite', value: isNaN(tauxReussite) ? '-' : `${tauxReussite}%`, icon: '✅' },
    { label: 'Élèves évalués', value: String(nbEvalues), icon: '🎓' },
    { label: 'Matières', value: String(nbMatieres), icon: '📚' },
  ];
  
  for (let i = 0; i < kpis.length; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 14 + col * (kpiWidth + 7);
    const y = yPos + row * (kpiHeight + 5);
    
    doc.setFillColor(...colors.background);
    doc.roundedRect(x, y, kpiWidth, kpiHeight, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis[i].icon} ${kpis[i].label}`, x + kpiWidth / 2, y + 10, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(kpis[i].value, x + kpiWidth / 2, y + 22, { align: 'center' });
  }
  
  yPos += (kpiHeight + 5) * 2 + 15;
  
  // Grade Distribution Table
  doc.setTextColor(...colors.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Répartition par tranche de moyenne', 14, yPos);
  yPos += 8;
  
  const distribution = getGradeDistribution(eleves);
  
  const tableData = distribution.map(d => [
    `${d.emoji} ${d.label}`,
    d.min === 16 ? '≥ 16' : d.min === 0 ? '< 8' : `${d.min} - ${d.max}`,
    String(d.count),
    `${d.percentage}%`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tranche', 'Fourchette', 'Nombre d\'élèves', 'Pourcentage']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: colors.text,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: colors.background,
    },
    margin: { left: 14, right: 14 },
    didParseCell: function(hookData: any) {
      // Color rows based on grade range
      if (hookData.section === 'body') {
        const rowIndex = hookData.row.index;
        const colorKey = distribution[rowIndex]?.colorKey;
        if (colorKey) {
          hookData.cell.styles.fillColor = colors[colorKey];
        }
      }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Subject Analysis (Points forts / À renforcer)
  const subjectStats = getSubjectAverages(data.classeCSV);
  const strongSubjects = getStrongSubjects(subjectStats);
  const weakSubjects = getWeakSubjectsClass(subjectStats);
  
  const colWidth = (pageWidth - 35) / 2;
  
  // Points forts
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(14, yPos, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('📈 Points forts (moyenne ≥ 14)', 18, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (strongSubjects.length === 0) {
    doc.text('Aucune matière ≥ 14', 18, yPos + 22);
  } else {
    strongSubjects.slice(0, 4).forEach((s, i) => {
      doc.text(`• ${s.name}: ${s.currentAvg.toFixed(2)}`, 18, yPos + 22 + i * 8);
    });
  }
  
  // À renforcer
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(14 + colWidth + 7, yPos, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(234, 88, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('📉 À renforcer (moyenne < 12)', 18 + colWidth + 7, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (weakSubjects.length === 0) {
    doc.text('Aucune matière < 12', 18 + colWidth + 7, yPos + 22);
  } else {
    weakSubjects.slice(0, 4).forEach((s, i) => {
      doc.text(`• ${s.name}: ${s.currentAvg.toFixed(2)}`, 18 + colWidth + 7, yPos + 22 + i * 8);
    });
  }
  
  yPos += 60;
  
  // Top 3 Students
  doc.setTextColor(...colors.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('🏆 Top 3 élèves', 14, yPos);
  yPos += 8;
  
  const top3 = getTopStudents(eleves, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const medalColors: [number, number, number][] = [
    [254, 243, 199], // Gold
    [243, 244, 246], // Silver
    [254, 215, 170], // Bronze
  ];
  
  const podiumWidth = (pageWidth - 42) / 3;
  
  top3.forEach((student, i) => {
    const x = 14 + i * (podiumWidth + 7);
    doc.setFillColor(...medalColors[i]);
    doc.roundedRect(x, yPos, podiumWidth, 30, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.text(medals[i], x + podiumWidth / 2, yPos + 12, { align: 'center' });
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const displayName = student.nom.length > 18 ? student.nom.substring(0, 16) + '...' : student.nom;
    doc.text(displayName, x + podiumWidth / 2, yPos + 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text(student.moyenneGenerale.toFixed(2), x + podiumWidth / 2, yPos + 27, { align: 'center' });
  });
}

function addStudentsMonitoringPage(doc: jsPDF, data: ExportData, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Suivi des élèves', colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 25;
  
  if (!data.classeCSV) {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(12);
    doc.text('Données de suivi non disponibles', pageWidth / 2, yPos + 20, { align: 'center' });
    return;
  }
  
  const eleves = data.classeCSV.eleves;
  
  // Struggling students
  doc.setTextColor(...colors.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('👁️ Élèves à surveiller (moyenne < 10)', 14, yPos);
  yPos += 8;
  
  const struggling = getStrugglingStudents(eleves).slice(0, 8);
  
  if (struggling.length > 0) {
    const tableData = struggling.map(s => [
      s.nom,
      s.moyenneGenerale.toFixed(2),
      getWeakSubjects(s).join(', ') || '-'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Élève', 'Moyenne', 'Matières en difficulté']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [254, 226, 226],
        textColor: [220, 38, 38],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun élève avec une moyenne < 10', 14, yPos + 5);
    yPos += 20;
  }
  
  // AI Recommendations
  doc.setTextColor(...colors.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 Recommandations pour le conseil de classe', 14, yPos);
  yPos += 8;
  
  const subjectStats = getSubjectAverages(data.classeCSV);
  const analysisData = {
    eleves,
    subjects: subjectStats,
    matieres: data.classeCSV.matieres,
  };
  
  const positivePoints = getPositivePoints(analysisData);
  const warningPoints = getWarningPoints(analysisData);
  const suggestedActions = getSuggestedActions(analysisData);
  
  // Recommendations box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);
  
  const boxHeight = 80;
  doc.roundedRect(14, yPos, pageWidth - 28, boxHeight, 4, 4, 'FD');
  
  const colW = (pageWidth - 40) / 3;
  let xPos = 18;
  
  // Points à valoriser
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✅ Points à valoriser', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  positivePoints.slice(0, 3).forEach((point, i) => {
    const lines = doc.splitTextToSize(point, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
  
  // Points d'attention
  xPos += colW + 5;
  doc.setTextColor(234, 88, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ Points d\'attention', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  warningPoints.slice(0, 3).forEach((point, i) => {
    const lines = doc.splitTextToSize(point, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
  
  // Actions suggérées
  xPos += colW + 5;
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('🎯 Actions suggérées', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  suggestedActions.slice(0, 3).forEach((action, i) => {
    const lines = doc.splitTextToSize(`→ ${action}`, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
}

function addGlobalAnalysisPage(doc: jsPDF, data: ExportData, options: ExportOptions, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Classement des élèves', colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 25;
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Classement complet', 14, yPos);
  yPos += 12;
  
  if (data.classeCSV) {
    const tableData = data.classeCSV.eleves
      .sort((a, b) => b.moyenneGenerale - a.moyenneGenerale)
      .map((eleve, i) => [
        i + 1,
        eleve.nom,
        isNaN(eleve.moyenneGenerale) ? '-' : eleve.moyenneGenerale.toFixed(2),
        eleve.absences || 0,
        eleve.retards || 0,
      ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Rang', 'Élève', 'Moyenne', 'Absences', 'Retards']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: colors.background,
      },
      margin: { left: 14, right: 14 },
    });
  }
}

function addSubjectAnalysisPage(doc: jsPDF, data: ExportData, options: ExportOptions, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Analyse par matière', colors, pageNum, totalPages);
  
  let yPos = 25;
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Résultats par discipline', 14, yPos);
  yPos += 10;
  
  const matieres = data.bulletinClasse?.matieres || [];
  
  if (matieres.length > 0) {
    const tableData = matieres.map(m => [
      m.nom,
      m.moyenne.toFixed(2),
      m.appreciation || '-',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Matière', 'Moyenne', 'Appréciation']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
        overflow: 'linebreak',
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: colors.background,
      },
      margin: { left: 14, right: 14 },
    });
  } else if (data.classeCSV) {
    const matieresList = data.classeCSV.matieres.map(m => {
      const notes = data.classeCSV!.eleves.map(e => e.moyennesParMatiere[m] || 0).filter(n => n > 0);
      const avg = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
      return [m, avg.toFixed(2), '-'];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Matière', 'Moyenne classe', 'Observations']],
      body: matieresList,
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text,
      },
      alternateRowStyles: {
        fillColor: colors.background,
      },
      margin: { left: 14, right: 14 },
    });
  }
}

function addGeneralAppreciationPage(doc: jsPDF, data: ExportData, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Appréciation générale', colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 30;
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Appréciation du conseil de classe', 14, yPos);
  yPos += 15;
  
  if (data.generalAppreciation) {
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, pageWidth - 28, 80, 5, 5, 'F');
    
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, yPos, pageWidth - 28, 80, 5, 5, 'S');
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(data.generalAppreciation, pageWidth - 48);
    doc.text(lines, 24, yPos + 15);
  } else {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucune appréciation générale n\'a été générée.', 14, yPos);
  }
}

function addIndividualAppreciationsPages(doc: jsPDF, data: ExportData, options: ExportOptions, colors: typeof COLORS, startPage: number, totalPages: number) {
  const students = data.bulletinsEleves || [];
  const appreciations = data.studentAppreciations || [];
  const attributions = data.studentAttributions || [];
  
  if (students.length === 0 && !data.classeCSV?.eleves.length) return;
  
  const studentList = students.length > 0 
    ? students.map((s, i) => ({
        name: `${s.prenom} ${s.nom}`,
        average: s.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0) / (s.matieres.length || 1),
        appreciation: appreciations[i] || '',
        attribution: attributions[i] || null,
      }))
    : data.classeCSV?.eleves.map((e, i) => ({
        name: e.nom,
        average: e.moyenneGenerale,
        appreciation: appreciations[i] || '',
        attribution: attributions[i] || null,
      })) || [];
  
  let currentPage = startPage;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Card dimensions - adaptive based on content
  const cardMinHeight = 45;
  const cardMaxHeight = 70;
  const cardMargin = 8;
  const headerHeight = 25;
  const footerMargin = 20;
  
  doc.addPage();
  addPageHeader(doc, 'Appréciations individuelles', colors, currentPage, totalPages);
  
  let yPos = headerHeight;
  
  // Title
  doc.setTextColor(...colors.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${studentList.length} élèves évalués`, 14, yPos + 5);
  yPos += 15;
  
  for (let i = 0; i < studentList.length; i++) {
    const student = studentList[i];
    const hasAttribution = options.includeAttributions && student.attribution;
    
    // Calculate card height based on content
    let cardHeight = cardMinHeight;
    if (student.appreciation) {
      const appreciationLines = doc.splitTextToSize(student.appreciation, pageWidth - 60);
      const textHeight = appreciationLines.length * 4;
      cardHeight = Math.min(Math.max(cardMinHeight, 25 + textHeight + (hasAttribution ? 15 : 0)), cardMaxHeight);
    }
    
    // Check if we need a new page
    if (yPos + cardHeight > pageHeight - footerMargin) {
      doc.addPage();
      currentPage++;
      addPageHeader(doc, 'Appréciations individuelles', colors, currentPage, totalPages);
      yPos = headerHeight;
    }
    
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.muted);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, yPos, pageWidth - 28, cardHeight, 4, 4, 'FD');
    
    // Header with name and average
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, pageWidth - 28, 14, 4, 4, 'F');
    doc.rect(14, yPos + 10, pageWidth - 28, 4, 'F'); // Cover bottom corners
    
    // Student name
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const displayName = student.name.length > 35 ? student.name.substring(0, 33) + '...' : student.name;
    doc.text(displayName, 18, yPos + 9);
    
    // Average badge
    const avgColor = student.average >= 14 ? colors.success : student.average >= 10 ? colors.warning : colors.danger;
    doc.setFillColor(...avgColor);
    doc.roundedRect(pageWidth - 45, yPos + 2, 27, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(isNaN(student.average) ? '-' : student.average.toFixed(2), pageWidth - 31.5, yPos + 9, { align: 'center' });
    
    // Appreciation text
    doc.setTextColor(...colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    if (student.appreciation) {
      const appreciationLines = doc.splitTextToSize(student.appreciation, pageWidth - 40);
      const maxLines = hasAttribution ? 4 : 6;
      doc.text(appreciationLines.slice(0, maxLines), 18, yPos + 20);
    } else {
      doc.setTextColor(...colors.muted);
      doc.setFont('helvetica', 'italic');
      doc.text('Appréciation non générée', 18, yPos + 20);
    }
    
    // Attribution badge if enabled
    if (hasAttribution && student.attribution) {
      const attrConfig = attributionConfig[student.attribution];
      const attrY = yPos + cardHeight - 12;
      
      doc.setFillColor(...colors.background);
      doc.roundedRect(18, attrY, 80, 8, 2, 2, 'F');
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`Attribution: ${attrConfig.shortLabel}`, 22, attrY + 5.5);
    }
    
    yPos += cardHeight + cardMargin;
  }
}

export function generatePDF(data: ExportData, options: ExportOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const colors = getColors(options.colorMode);
  
  // Calculate total pages (approximate)
  const nbStudents = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const individualPages = Math.ceil(nbStudents / 4);
  const hasAnalysisData = !!data.classeCSV;
  
  // Page structure:
  // 1: Cover
  // 2: Results Analysis (if classeCSV)
  // 3: Students Monitoring (if classeCSV)
  // 4: Student Ranking
  // 5: Subject Analysis
  // 6: General Appreciation
  // 7+: Individual Appreciations
  
  const basePagesWithAnalysis = hasAnalysisData ? 6 : 4;
  const totalPages = basePagesWithAnalysis + individualPages;
  
  let currentPage = 1;
  
  // Page 1: Cover
  addCoverPage(doc, data, colors);
  currentPage++;
  
  // Page 2-3: Results Analysis (only if we have CSV data)
  if (hasAnalysisData) {
    addResultsAnalysisPage(doc, data, colors, currentPage, totalPages);
    currentPage++;
    
    addStudentsMonitoringPage(doc, data, colors, currentPage, totalPages);
    currentPage++;
  }
  
  // Page 4: Student Ranking
  addGlobalAnalysisPage(doc, data, options, colors, currentPage, totalPages);
  currentPage++;
  
  // Page 5: Subject Analysis
  addSubjectAnalysisPage(doc, data, options, colors, currentPage, totalPages);
  currentPage++;
  
  // Page 6: General Appreciation
  addGeneralAppreciationPage(doc, data, colors, currentPage, totalPages);
  currentPage++;
  
  // Pages 7+: Individual Appreciations
  if (nbStudents > 0) {
    addIndividualAppreciationsPages(doc, data, options, colors, currentPage, totalPages);
  }
  
  return doc;
}

export function downloadPDF(data: ExportData, options: ExportOptions, filename?: string) {
  const doc = generatePDF(data, options);
  const className = data.bulletinClasse?.classe || '3eme';
  const trimester = data.bulletinClasse?.trimestre?.replace(/\s+/g, '_') || 'T1';
  const defaultFilename = `Rapport_${className}_${trimester}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
}
