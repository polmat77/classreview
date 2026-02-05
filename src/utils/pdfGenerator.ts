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
  getGradeDistribution,
  getStrugglingStudents,
  getTopStudents,
  getWeakSubjects,
  getSubjectAverages,
  getStrongSubjects,
  getWeakSubjectsClass,
  getPositivePoints,
  getWarningPoints,
  getSuggestedActions,
} from '@/utils/statisticsCalculations';

// ============================================================
// DESIGN SYSTEM - Professional Color Palette
// ============================================================
const COLORS = {
  // Brand colors
  primary: [44, 62, 80] as [number, number, number],      // Slate #2c3e50
  gold: [240, 168, 48] as [number, number, number],       // Gold #f0a830
  cyan: [125, 211, 232] as [number, number, number],      // Cyan #7dd3e8
  
  // Text colors
  text: [44, 62, 80] as [number, number, number],         // #2c3e50
  textSecondary: [74, 95, 127] as [number, number, number], // #4a5f7f
  muted: [107, 114, 128] as [number, number, number],     // #6b7280
  
  // Background colors
  background: [248, 250, 252] as [number, number, number], // #f8fafc
  white: [255, 255, 255] as [number, number, number],
  
  // Semantic colors
  success: [16, 185, 129] as [number, number, number],    // #10b981
  successLight: [34, 197, 94] as [number, number, number], // #22c55e
  warning: [245, 158, 11] as [number, number, number],    // #f59e0b
  danger: [239, 68, 68] as [number, number, number],      // #ef4444
  
  // Grade distribution badges
  excellent: [220, 252, 231] as [number, number, number],      // #dcfce7
  excellentText: [22, 101, 52] as [number, number, number],    // #166534
  tresBien: [209, 250, 229] as [number, number, number],       // #d1fae5
  tresBienText: [4, 120, 87] as [number, number, number],      // #047857
  bien: [219, 234, 254] as [number, number, number],           // #dbeafe
  bienText: [30, 64, 175] as [number, number, number],         // #1e40af
  moyen: [254, 243, 199] as [number, number, number],          // #fef3c7
  moyenText: [146, 64, 14] as [number, number, number],        // #92400e
  insuffisant: [255, 237, 213] as [number, number, number],    // #ffedd5
  insuffisantText: [194, 65, 12] as [number, number, number],  // #c2410c
  inquietant: [254, 226, 226] as [number, number, number],     // #fee2e2
  inquietantText: [185, 28, 28] as [number, number, number],   // #b91c1c
  
  // Separator
  separator: [229, 231, 235] as [number, number, number], // #e5e7eb
};

const COLORS_BW = {
  primary: [50, 50, 50] as [number, number, number],
  gold: [80, 80, 80] as [number, number, number],
  cyan: [120, 120, 120] as [number, number, number],
  text: [0, 0, 0] as [number, number, number],
  textSecondary: [60, 60, 60] as [number, number, number],
  muted: [100, 100, 100] as [number, number, number],
  background: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [60, 60, 60] as [number, number, number],
  successLight: [70, 70, 70] as [number, number, number],
  warning: [80, 80, 80] as [number, number, number],
  danger: [40, 40, 40] as [number, number, number],
  excellent: [230, 230, 230] as [number, number, number],
  excellentText: [30, 30, 30] as [number, number, number],
  tresBien: [235, 235, 235] as [number, number, number],
  tresBienText: [40, 40, 40] as [number, number, number],
  bien: [240, 240, 240] as [number, number, number],
  bienText: [50, 50, 50] as [number, number, number],
  moyen: [240, 240, 240] as [number, number, number],
  moyenText: [50, 50, 50] as [number, number, number],
  insuffisant: [235, 235, 235] as [number, number, number],
  insuffisantText: [40, 40, 40] as [number, number, number],
  inquietant: [225, 225, 225] as [number, number, number],
  inquietantText: [30, 30, 30] as [number, number, number],
  separator: [200, 200, 200] as [number, number, number],
};

function getColors(colorMode: boolean) {
  return colorMode ? COLORS : COLORS_BW;
}

export interface ExportOptions {
  includeGraphs: boolean;
  includeComments: boolean;
  colorMode: boolean;
  schoolLogo: boolean;
  includeAttributions?: boolean;
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

function getEvaluatedStudentsCount(eleves: EleveData[]): number {
  return eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale > 0).length;
}

// PDF Icons as text (jsPDF doesn't support emojis natively)
const PDF_ICONS = {
  average: '[Moy]',
  median: '[Med]',
  stdDev: '[ET]',
  success: '[OK]',
  students: '[Elv]',
  subjects: '[Mat]',
  excellent: '***',
  tresBien: '**+',
  bien: '**',
  moyen: '*',
  insuffisant: '-',
  inquietant: '--',
  pointsForts: '[+]',
  aRenforcer: '[-]',
  top: '[#]',
  surveiller: '[!]',
  recommandations: '[i]',
  valoriser: '[+]',
  attention: '[!]',
  actions: '[>]',
  medal1: '[1er]',
  medal2: '[2e]',
  medal3: '[3e]',
};

// ============================================================
// Subject Classification by Pole
// ============================================================
const SUBJECT_POLES = {
  litteraire: {
    name: 'POLE LITTERAIRE',
    subjects: ['francais', 'français', 'histoire', 'geographie', 'histoire-geographie', 'hist-geo', 'anglais', 'espagnol', 'allemand', 'lv1', 'lv2', 'latin', 'grec'],
    color: [219, 234, 254] as [number, number, number], // Blue light
    textColor: [30, 64, 175] as [number, number, number],
  },
  scientifique: {
    name: 'POLE SCIENTIFIQUE',
    subjects: ['mathematiques', 'mathématiques', 'maths', 'physique', 'chimie', 'physique-chimie', 'svt', 'sciences', 'technologie', 'techno', 'nsi', 'snt'],
    color: [220, 252, 231] as [number, number, number], // Green light
    textColor: [22, 101, 52] as [number, number, number],
  },
  artistique: {
    name: 'POLE ARTISTIQUE & SPORTIF',
    subjects: ['eps', 'education physique', 'arts', 'arts plastiques', 'musique', 'education musicale'],
    color: [254, 243, 199] as [number, number, number], // Yellow light
    textColor: [146, 64, 14] as [number, number, number],
  },
};

function getSubjectPole(subjectName: string): keyof typeof SUBJECT_POLES | null {
  const normalized = subjectName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, pole] of Object.entries(SUBJECT_POLES)) {
    if (pole.subjects.some(s => normalized.includes(s))) {
      return key as keyof typeof SUBJECT_POLES;
    }
  }
  return null;
}

// ============================================================
// Helper: Get color for average value
// ============================================================
function getAverageColor(moyenne: number, colors: typeof COLORS): [number, number, number] {
  if (moyenne >= 14) return colors.success;
  if (moyenne >= 12) return colors.successLight;
  if (moyenne >= 10) return colors.warning;
  return colors.danger;
}

// ============================================================
// PAGE HEADER (from page 2 onwards)
// ============================================================
function addPageHeader(
  doc: jsPDF, 
  className: string, 
  trimester: string, 
  colors: typeof COLORS, 
  pageNum: number, 
  totalPages: number
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header text
  doc.setTextColor(...colors.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`ClassCouncil AI | Rapport ${className} - ${trimester}`, 14, 10);
  doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - 14, 10, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(...colors.separator);
  doc.setLineWidth(0.3);
  doc.line(14, 14, pageWidth - 14, 14);
}

// ============================================================
// PAGE FOOTER
// ============================================================
function addPageFooter(doc: jsPDF, colors: typeof COLORS) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Separator line
  doc.setDrawColor(...colors.separator);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
  
  // Footer text
  doc.setTextColor(...colors.muted);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')} via ClassCouncil AI`, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

// ============================================================
// COVER PAGE - Professional Design
// ============================================================
function addCoverPage(doc: jsPDF, data: ExportData, colors: typeof COLORS) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  
  // White background
  doc.setFillColor(...colors.white);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // === LOGO AREA (placeholder - text logo) ===
  doc.setTextColor(...colors.primary);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ClassCouncil', centerX - 10, 45, { align: 'center' });
  doc.setTextColor(...colors.gold);
  doc.text('AI', centerX + 38, 45);
  
  // === Decorative gold line ===
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(1);
  doc.line(40, 60, pageWidth - 40, 60);
  
  // === Main Title ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...colors.primary);
  doc.text('RAPPORT DU CONSEIL DE CLASSE', centerX, 85, { align: 'center' });
  
  // === Second decorative line ===
  doc.setDrawColor(...colors.gold);
  doc.line(40, 95, pageWidth - 40, 95);
  
  // === Class and trimester info ===
  const className = data.bulletinClasse?.classe || data.classeCSV?.eleves?.[0]?.nom?.match(/\d+[eè]m?e?/i)?.[0] || '3eme';
  const trimester = data.bulletinClasse?.trimestre || '1er Trimestre';
  const year = data.bulletinClasse?.anneeScolaire || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...colors.textSecondary);
  doc.text(`Classe : ${className}`, centerX, 115, { align: 'center' });
  doc.text(`${trimester} ${year}`, centerX, 130, { align: 'center' });
  
  // === KPI Cards (3 cards) ===
  const nbEleves = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const nbMatieres = data.classeCSV?.matieres.length || data.bulletinClasse?.matieres.length || 0;
  const moyenneClasse = data.classeCSV?.statistiques.moyenneClasse || 
    (data.bulletinClasse?.matieres.reduce((s, m) => s + m.moyenne, 0) || 0) / (data.bulletinClasse?.matieres.length || 1);
  
  const cardY = 150;
  const cardWidth = 45;
  const cardHeight = 35;
  const cardSpacing = 12;
  const startX = centerX - (cardWidth * 1.5 + cardSpacing);
  
  // Card 1 - Élèves
  doc.setFillColor(...colors.background);
  doc.roundedRect(startX, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text(String(nbEleves), startX + cardWidth / 2, cardY + 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  doc.text('Eleves', startX + cardWidth / 2, cardY + 30, { align: 'center' });
  
  // Card 2 - Matières
  const card2X = startX + cardWidth + cardSpacing;
  doc.setFillColor(...colors.background);
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text(String(nbMatieres), card2X + cardWidth / 2, cardY + 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  doc.text('Matieres', card2X + cardWidth / 2, cardY + 30, { align: 'center' });
  
  // Card 3 - Moyenne (with conditional color)
  const card3X = card2X + cardWidth + cardSpacing;
  doc.setFillColor(...colors.background);
  doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const moyColor = getAverageColor(moyenneClasse, colors);
  doc.setTextColor(...moyColor);
  doc.text(isNaN(moyenneClasse) ? '-' : moyenneClasse.toFixed(2), card3X + cardWidth / 2, cardY + 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  doc.text('Moyenne', card3X + cardWidth / 2, cardY + 30, { align: 'center' });
  
  // === Professeur Principal ===
  const profPrincipal = data.professeurPrincipal || data.bulletinClasse?.professeurPrincipal || '';
  if (profPrincipal) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...colors.textSecondary);
    doc.text(`Professeur principal : ${profPrincipal}`, centerX, 210, { align: 'center' });
  }
  
  // === Separator line ===
  doc.setDrawColor(...colors.separator);
  doc.setLineWidth(0.5);
  doc.line(60, 225, pageWidth - 60, 225);
  
  // === Footer ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.muted);
  doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, centerX, 245, { align: 'center' });
  doc.text('via ClassCouncil AI', centerX, 255, { align: 'center' });
  
  // === School info (if available) ===
  const school = data.bulletinClasse?.etablissement || '';
  if (school) {
    doc.setFontSize(11);
    doc.text(school, centerX, pageHeight - 25, { align: 'center' });
  }
}

// ============================================================
// RESULTS ANALYSIS PAGE
// ============================================================
function addResultsAnalysisPage(
  doc: jsPDF, 
  data: ExportData, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  pageNum: number, 
  totalPages: number
) {
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 22;
  
  if (!data.classeCSV) {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(12);
    doc.text('Donnees d\'analyse non disponibles', pageWidth / 2, yPos + 20, { align: 'center' });
    addPageFooter(doc, colors);
    return;
  }
  
  const eleves = data.classeCSV.eleves;
  
  // Section title
  doc.setTextColor(...colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Statistiques generales', 14, yPos);
  yPos += 12;
  
  // KPI Grid (4 stats in 1 row)
  const kpiWidth = (pageWidth - 42) / 4;
  const kpiHeight = 28;
  
  const moyenne = calculateClassAverage(eleves);
  const ecartType = calculateStdDev(eleves);
  const tauxReussite = calculateSuccessRate(eleves);
  const nbEvalues = getEvaluatedStudentsCount(eleves);
  
  const kpis = [
    { label: 'Moyenne generale', value: isNaN(moyenne) ? '-' : moyenne.toFixed(2), icon: PDF_ICONS.average },
    { label: 'Ecart-type', value: isNaN(ecartType) ? '-' : ecartType.toFixed(2), icon: PDF_ICONS.stdDev },
    { label: 'Taux de reussite', value: isNaN(tauxReussite) ? '-' : `${tauxReussite}%`, icon: PDF_ICONS.success },
    { label: 'Eleves evalues', value: String(nbEvalues), icon: PDF_ICONS.students },
  ];
  
  for (let i = 0; i < kpis.length; i++) {
    const x = 14 + i * (kpiWidth + 5);
    
    doc.setFillColor(...colors.background);
    doc.roundedRect(x, yPos, kpiWidth, kpiHeight, 3, 3, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(`${kpis[i].icon} ${kpis[i].label}`, x + kpiWidth / 2, yPos + 10, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(kpis[i].value, x + kpiWidth / 2, yPos + 22, { align: 'center' });
  }
  
  yPos += kpiHeight + 15;
  
  // Grade Distribution Table with colored badges
  doc.setTextColor(...colors.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Repartition par tranche de moyenne', 14, yPos);
  yPos += 8;
  
  const distribution = getGradeDistribution(eleves);
  const gradeLabels = ['Excellent (>=16)', 'Tres bien (14-16)', 'Bien (12-14)', 'Moyen (10-12)', 'Insuffisant (8-10)', 'Grande difficulte (<8)'];
  const gradeBgColors = [
    colors.excellent, colors.tresBien, colors.bien, 
    colors.moyen, colors.insuffisant, colors.inquietant
  ];
  const gradeTextColors = [
    colors.excellentText, colors.tresBienText, colors.bienText,
    colors.moyenText, colors.insuffisantText, colors.inquietantText
  ];
  
  const tableData = distribution.map((d, i) => [
    gradeLabels[i] || d.label,
    String(d.count),
    `${d.percentage}%`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tranche', 'Nb eleves', 'Pourcentage']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: colors.primary,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: function(hookData: any) {
      if (hookData.section === 'body') {
        const rowIndex = hookData.row.index;
        if (rowIndex < gradeBgColors.length) {
          hookData.cell.styles.fillColor = gradeBgColors[rowIndex];
          hookData.cell.styles.textColor = gradeTextColors[rowIndex];
          if (hookData.column.index === 0) {
            hookData.cell.styles.fontStyle = 'bold';
          }
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
  doc.setFillColor(...colors.excellent);
  doc.roundedRect(14, yPos, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(...colors.success);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('[+] Points forts (moyenne >= 14)', 18, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (strongSubjects.length === 0) {
    doc.text('Aucune matiere >= 14', 18, yPos + 22);
  } else {
    strongSubjects.slice(0, 4).forEach((s, i) => {
      doc.text(`- ${s.name}: ${s.currentAvg.toFixed(2)}`, 18, yPos + 22 + i * 8);
    });
  }
  
  // À renforcer
  doc.setFillColor(...colors.moyen);
  doc.roundedRect(14 + colWidth + 7, yPos, colWidth, 50, 3, 3, 'F');
  
  doc.setTextColor(...colors.warning);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('[-] A renforcer (moyenne < 12)', 18 + colWidth + 7, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  if (weakSubjects.length === 0) {
    doc.text('Aucune matiere < 12', 18 + colWidth + 7, yPos + 22);
  } else {
    weakSubjects.slice(0, 4).forEach((s, i) => {
      doc.text(`- ${s.name}: ${s.currentAvg.toFixed(2)}`, 18 + colWidth + 7, yPos + 22 + i * 8);
    });
  }
  
  yPos += 60;
  
  // Top 3 Students
  doc.setTextColor(...colors.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('[#] Podium des 3 meilleurs eleves', 14, yPos);
  yPos += 8;
  
  const top3 = getTopStudents(eleves, 3);
  const medals = [PDF_ICONS.medal1, PDF_ICONS.medal2, PDF_ICONS.medal3];
  const medalColors: [number, number, number][] = [
    [255, 215, 0],   // Gold
    [192, 192, 192], // Silver
    [205, 127, 50],  // Bronze
  ];
  
  const podiumWidth = (pageWidth - 42) / 3;
  
  top3.forEach((student, i) => {
    const x = 14 + i * (podiumWidth + 7);
    doc.setFillColor(...colors.background);
    doc.roundedRect(x, yPos, podiumWidth, 32, 3, 3, 'F');
    
    // Medal indicator
    doc.setFillColor(...medalColors[i]);
    doc.circle(x + 12, yPos + 16, 6, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(medals[i], x + 12, yPos + 19, { align: 'center' });
    
    doc.setTextColor(...colors.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const displayName = student.nom.length > 18 ? student.nom.substring(0, 16) + '...' : student.nom;
    doc.text(displayName, x + 25, yPos + 14);
    
    doc.setFontSize(11);
    const avgColor = getAverageColor(student.moyenneGenerale, colors);
    doc.setTextColor(...avgColor);
    doc.text(student.moyenneGenerale.toFixed(2), x + 25, yPos + 25);
  });
  
  addPageFooter(doc, colors);
}

// ============================================================
// STUDENTS MONITORING PAGE
// ============================================================
function addStudentsMonitoringPage(
  doc: jsPDF, 
  data: ExportData, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  pageNum: number, 
  totalPages: number
) {
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 22;
  
  if (!data.classeCSV) {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(12);
    doc.text('Donnees de suivi non disponibles', pageWidth / 2, yPos + 20, { align: 'center' });
    addPageFooter(doc, colors);
    return;
  }
  
  const eleves = data.classeCSV.eleves;
  
  // Section title
  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('[!] Eleves a surveiller (moyenne < 10)', 14, yPos);
  yPos += 10;
  
  const struggling = getStrugglingStudents(eleves).slice(0, 8);
  
  if (struggling.length > 0) {
    const tableData = struggling.map(s => [
      s.nom,
      s.moyenneGenerale.toFixed(2),
      getWeakSubjects(s).join(', ') || '-'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Eleve', 'Moyenne', 'Matieres en difficulte']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.inquietant,
        textColor: colors.danger,
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
      didParseCell: function(hookData: any) {
        if (hookData.section === 'body' && hookData.column.index === 1) {
          const moyenne = parseFloat(hookData.cell.raw);
          if (moyenne < 8) {
            hookData.cell.styles.textColor = colors.danger;
            hookData.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setTextColor(...colors.muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun eleve avec une moyenne < 10', 14, yPos + 5);
    yPos += 20;
  }
  
  // AI Recommendations
  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('[i] Recommandations pour le conseil de classe', 14, yPos);
  yPos += 10;
  
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
  doc.setFillColor(...colors.background);
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.8);
  
  const boxHeight = 75;
  doc.roundedRect(14, yPos, pageWidth - 28, boxHeight, 4, 4, 'FD');
  
  const colW = (pageWidth - 40) / 3;
  let xPos = 18;
  
  // Points à valoriser
  doc.setTextColor(...colors.success);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('[+] Points a valoriser', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  positivePoints.slice(0, 3).forEach((point, i) => {
    const lines = doc.splitTextToSize(point, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
  
  // Points d'attention
  xPos += colW + 5;
  doc.setTextColor(...colors.warning);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('[!] Points d\'attention', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  warningPoints.slice(0, 3).forEach((point, i) => {
    const lines = doc.splitTextToSize(point, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
  
  // Actions suggérées
  xPos += colW + 5;
  doc.setTextColor(...colors.cyan);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('[>] Actions suggerees', xPos, yPos + 10);
  
  doc.setTextColor(...colors.text);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  suggestedActions.slice(0, 3).forEach((action, i) => {
    const lines = doc.splitTextToSize(`> ${action}`, colW - 5);
    doc.text(lines.slice(0, 2), xPos, yPos + 18 + i * 12);
  });
  
  addPageFooter(doc, colors);
}

// ============================================================
// STUDENT RANKING PAGE (with color-coded averages)
// ============================================================
function addGlobalAnalysisPage(
  doc: jsPDF, 
  data: ExportData, 
  options: ExportOptions, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  pageNum: number, 
  totalPages: number
) {
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
  
  let yPos = 22;
  
  doc.setTextColor(...colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Classement des eleves', 14, yPos);
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
      head: [['Rang', 'Eleve', 'Moyenne', 'Abs.', 'Ret.']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: colors.text,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 55, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: colors.background,
      },
      margin: { left: 14, right: 14 },
      didParseCell: function(hookData: any) {
        if (hookData.section === 'body') {
          // Color-code average column
          if (hookData.column.index === 2) {
            const moyenne = parseFloat(hookData.cell.raw);
            if (!isNaN(moyenne)) {
              if (moyenne >= 14) {
                hookData.cell.styles.textColor = colors.success;
                hookData.cell.styles.fontStyle = 'bold';
              } else if (moyenne >= 12) {
                hookData.cell.styles.textColor = colors.successLight;
              } else if (moyenne >= 10) {
                hookData.cell.styles.textColor = colors.warning;
              } else {
                hookData.cell.styles.textColor = colors.danger;
                hookData.cell.styles.fontStyle = 'bold';
              }
            }
          }
          // Alert for excessive absences (>20)
          if (hookData.column.index === 3) {
            const absences = parseInt(hookData.cell.raw);
            if (absences > 20) {
              hookData.cell.styles.textColor = colors.danger;
              hookData.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });
  }
  
  addPageFooter(doc, colors);
}

// ============================================================
// SUBJECT ANALYSIS PAGE - Grouped by Poles
// ============================================================
function addSubjectAnalysisPage(
  doc: jsPDF, 
  data: ExportData, 
  options: ExportOptions, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  pageNum: number, 
  totalPages: number
) {
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 22;
  
  doc.setTextColor(...colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Analyse par matiere', 14, yPos);
  yPos += 12;
  
  // Get subjects data
  let subjects: { nom: string; moyenne: number; appreciation: string; professeur?: string }[] = [];
  
  if (data.bulletinClasse?.matieres) {
    subjects = data.bulletinClasse.matieres.map(m => ({
      nom: m.nom,
      moyenne: m.moyenne,
      appreciation: m.appreciation || '',
      professeur: '',
    }));
  } else if (data.classeCSV) {
    subjects = data.classeCSV.matieres.map(m => {
      const notes = data.classeCSV!.eleves.map(e => e.moyennesParMatiere[m] || 0).filter(n => n > 0);
      const avg = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
      return { nom: m, moyenne: avg, appreciation: '', professeur: '' };
    });
  }
  
  // Group subjects by pole
  const groupedSubjects: Record<string, typeof subjects> = {
    litteraire: [],
    scientifique: [],
    artistique: [],
    autres: [],
  };
  
  subjects.forEach(s => {
    const pole = getSubjectPole(s.nom);
    if (pole) {
      groupedSubjects[pole].push(s);
    } else {
      groupedSubjects.autres.push(s);
    }
  });
  
  // Render each pole
  const poles = [
    { key: 'litteraire', config: SUBJECT_POLES.litteraire },
    { key: 'scientifique', config: SUBJECT_POLES.scientifique },
    { key: 'artistique', config: SUBJECT_POLES.artistique },
    { key: 'autres', config: { name: 'AUTRES MATIERES', color: colors.background, textColor: colors.text } },
  ];
  
  for (const pole of poles) {
    const poleSubjects = groupedSubjects[pole.key];
    if (poleSubjects.length === 0) continue;
    
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      addPageFooter(doc, colors);
      doc.addPage();
      addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
      yPos = 22;
    }
    
    // Pole header
    doc.setFillColor(...pole.config.color);
    doc.roundedRect(14, yPos, pageWidth - 28, 8, 2, 2, 'F');
    doc.setTextColor(...pole.config.textColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(pole.config.name, 18, yPos + 5.5);
    yPos += 12;
    
    // Subject blocks
    for (const subject of poleSubjects) {
      if (yPos > pageHeight - 45) {
        addPageFooter(doc, colors);
        doc.addPage();
        addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
        yPos = 22;
      }
      
      const blockHeight = options.includeComments && subject.appreciation ? 30 : 18;
      
      // Subject block
      doc.setFillColor(...colors.white);
      doc.setDrawColor(...colors.separator);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, yPos, pageWidth - 28, blockHeight, 3, 3, 'FD');
      
      // Subject name (uppercase, bold)
      const subjectNameNorm = subject.nom.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      doc.setTextColor(...colors.primary);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(subjectNameNorm, 18, yPos + 8);
      
      // Average (right-aligned with color)
      const avgColor = getAverageColor(subject.moyenne, colors);
      doc.setTextColor(...avgColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Moy: ${subject.moyenne.toFixed(2)}`, pageWidth - 22, yPos + 8, { align: 'right' });
      
      // Separator line
      doc.setDrawColor(...colors.separator);
      doc.line(18, yPos + 11, pageWidth - 22, yPos + 11);
      
      // Appreciation (if included)
      if (options.includeComments && subject.appreciation) {
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const truncatedApp = subject.appreciation.length > 200 
          ? subject.appreciation.substring(0, 197) + '...'
          : subject.appreciation;
        const lines = doc.splitTextToSize(`"${truncatedApp}"`, pageWidth - 48);
        doc.text(lines.slice(0, 2), 18, yPos + 18);
      }
      
      // Progress bar (if graphs enabled)
      if (options.includeGraphs) {
        const barY = options.includeComments && subject.appreciation ? yPos + 25 : yPos + 13;
        const barWidth = 50;
        const barHeight = 3;
        const barX = pageWidth - 22 - barWidth;
        
        // Background bar
        doc.setFillColor(...colors.separator);
        doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, 'F');
        
        // Progress bar
        const progress = Math.min(subject.moyenne / 20, 1) * barWidth;
        doc.setFillColor(...avgColor);
        doc.roundedRect(barX, barY, progress, barHeight, 1, 1, 'F');
      }
      
      yPos += blockHeight + 4;
    }
    
    yPos += 4; // Space between poles
  }
  
  addPageFooter(doc, colors);
}

// ============================================================
// GENERAL APPRECIATION PAGE
// ============================================================
function addGeneralAppreciationPage(
  doc: jsPDF, 
  data: ExportData, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  pageNum: number, 
  totalPages: number
) {
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 26;
  
  doc.setTextColor(...colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Appreciation du conseil de classe', 14, yPos);
  yPos += 15;
  
  if (data.generalAppreciation) {
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, pageWidth - 28, 80, 5, 5, 'F');
    
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(0.8);
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
    doc.text('Aucune appreciation generale n\'a ete generee.', 14, yPos);
  }
  
  addPageFooter(doc, colors);
}

// ============================================================
// INDIVIDUAL APPRECIATIONS PAGES
// ============================================================
function addIndividualAppreciationsPages(
  doc: jsPDF, 
  data: ExportData, 
  options: ExportOptions, 
  colors: typeof COLORS, 
  className: string, 
  trimester: string, 
  startPage: number, 
  totalPages: number
) {
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
  
  const cardMinHeight = 45;
  const cardMaxHeight = 70;
  const cardMargin = 8;
  const headerHeight = 22;
  const footerMargin = 25;
  
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, currentPage, totalPages);
  
  let yPos = headerHeight;
  
  // Title
  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Appreciations individuelles (${studentList.length} eleves)`, 14, yPos + 5);
  yPos += 15;
  
  for (let i = 0; i < studentList.length; i++) {
    const student = studentList[i];
    const hasAttribution = options.includeAttributions && student.attribution;
    
    let cardHeight = cardMinHeight;
    if (student.appreciation) {
      const appreciationLines = doc.splitTextToSize(student.appreciation, pageWidth - 60);
      const textHeight = appreciationLines.length * 4;
      cardHeight = Math.min(Math.max(cardMinHeight, 25 + textHeight + (hasAttribution ? 15 : 0)), cardMaxHeight);
    }
    
    if (yPos + cardHeight > pageHeight - footerMargin) {
      addPageFooter(doc, colors);
      doc.addPage();
      currentPage++;
      addPageHeader(doc, className, trimester, colors, currentPage, totalPages);
      yPos = headerHeight;
    }
    
    // Card background
    doc.setFillColor(...colors.white);
    doc.setDrawColor(...colors.separator);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, yPos, pageWidth - 28, cardHeight, 4, 4, 'FD');
    
    // Header with name and average
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, pageWidth - 28, 14, 4, 4, 'F');
    doc.rect(14, yPos + 10, pageWidth - 28, 4, 'F');
    
    // Student name
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const displayName = student.name.length > 35 ? student.name.substring(0, 33) + '...' : student.name;
    doc.text(displayName, 18, yPos + 9);
    
    // Average badge with color
    const avgColor = getAverageColor(student.average, colors);
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
      doc.text('Appreciation non generee', 18, yPos + 20);
    }
    
    // Attribution badge if enabled
    if (hasAttribution && student.attribution) {
      const attrConfig = attributionConfig[student.attribution];
      const attrY = yPos + cardHeight - 12;
      
      doc.setFillColor(...colors.gold);
      doc.roundedRect(18, attrY, 80, 8, 2, 2, 'F');
      
      doc.setTextColor(...colors.primary);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(`Attribution: ${attrConfig.shortLabel}`, 22, attrY + 5.5);
    }
    
    yPos += cardHeight + cardMargin;
  }
  
  addPageFooter(doc, colors);
}

// ============================================================
// MAIN EXPORT FUNCTIONS
// ============================================================
export function generatePDF(data: ExportData, options: ExportOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const colors = getColors(options.colorMode);
  
  // Get class info for headers
  const className = data.bulletinClasse?.classe || data.classeCSV?.eleves?.[0]?.nom?.match(/\d+[eè]m?e?/i)?.[0] || '3eme';
  const trimester = data.bulletinClasse?.trimestre || '1er Trimestre';
  
  // Calculate total pages
  const nbStudents = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const individualPages = Math.ceil(nbStudents / 4);
  const hasAnalysisData = !!data.classeCSV;
  
  const basePagesWithAnalysis = hasAnalysisData ? 6 : 4;
  const totalPages = basePagesWithAnalysis + individualPages;
  
  let currentPage = 1;
  
  // Page 1: Cover
  addCoverPage(doc, data, colors);
  currentPage++;
  
  // Page 2-3: Results Analysis (only if we have CSV data)
  if (hasAnalysisData) {
    addResultsAnalysisPage(doc, data, colors, className, trimester, currentPage, totalPages);
    currentPage++;
    
    addStudentsMonitoringPage(doc, data, colors, className, trimester, currentPage, totalPages);
    currentPage++;
  }
  
  // Page 4: Student Ranking
  addGlobalAnalysisPage(doc, data, options, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Page 5: Subject Analysis
  addSubjectAnalysisPage(doc, data, options, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Page 6: General Appreciation
  addGeneralAppreciationPage(doc, data, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Pages 7+: Individual Appreciations
  if (nbStudents > 0) {
    addIndividualAppreciationsPages(doc, data, options, colors, className, trimester, currentPage, totalPages);
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
