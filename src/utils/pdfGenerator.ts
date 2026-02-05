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
  hideNonEvaluableStudents?: boolean;
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
// EXECUTIVE SUMMARY PAGE (Page 2)
// ============================================================
function addExecutiveSummaryPage(
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
  const margin = 14;
  let currentY = 22;
  
  // === TITLE ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...colors.primary);
  doc.text('SYNTHESE DU CONSEIL DE CLASSE', margin, currentY);
  
  // Gold line under title
  currentY += 5;
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(0.8);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 12;
  
  // === VUE D'ENSEMBLE SECTION ===
  const overviewHeight = 58;
  doc.setFillColor(...colors.background);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, overviewHeight, 3, 3, 'F');
  
  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  doc.text('[VUE] VUE D\'ENSEMBLE', margin + 5, currentY + 8);
  
  // Separator line
  doc.setDrawColor(...colors.separator);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, currentY + 12, pageWidth - margin - 5, currentY + 12);
  
  // Calculate statistics
  const eleves = data.classeCSV?.eleves || [];
  const moyenne = calculateClassAverage(eleves);
  const mediane = calculateMedian(eleves);
  const ecartType = calculateStdDev(eleves);
  const tauxReussite = calculateSuccessRate(eleves);
  const elevesAuDessus10 = eleves.filter(e => e.moyenneGenerale >= 10 && !isNaN(e.moyenneGenerale)).length;
  const elevesEnDifficulte = eleves.filter(e => e.moyenneGenerale < 10 && e.moyenneGenerale > 0).length;
  const top3 = getTopStudents(eleves, 3);
  const elevesAbsencesExcessives = eleves.filter(e => (e.absences || 0) > 50).length;
  
  // Statistics in 2 columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  const col1X = margin + 10;
  const col2X = pageWidth / 2 + 10;
  let statsY = currentY + 22;
  
  doc.text(`Moyenne de classe : ${isNaN(moyenne) ? '-' : moyenne.toFixed(2)}`, col1X, statsY);
  doc.text(`Mediane : ${isNaN(mediane) ? '-' : mediane.toFixed(2)}`, col2X, statsY);
  statsY += 8;
  doc.text(`Ecart-type : ${isNaN(ecartType) ? '-' : ecartType.toFixed(2)}`, col1X, statsY);
  doc.text(`Taux de reussite : ${isNaN(tauxReussite) ? '-' : tauxReussite}%`, col2X, statsY);
  
  // 4 mini-cards KPI
  const cardStartY = currentY + 40;
  const miniCardWidth = 38;
  const miniCardHeight = 14;
  const miniCardSpacing = 6;
  const totalCardsWidth = 4 * miniCardWidth + 3 * miniCardSpacing;
  const cardsStartX = (pageWidth - totalCardsWidth) / 2;
  
  const kpiData = [
    { value: elevesAuDessus10, label: 'eleves >10', color: colors.success, icon: '+' },
    { value: elevesEnDifficulte, label: 'eleves <10', color: colors.warning, icon: '!' },
    { value: top3.length, label: 'Top 3', color: [59, 130, 246] as [number, number, number], icon: '#' },
    { value: elevesAbsencesExcessives, label: 'Abs. excess.', color: colors.danger, icon: 'X' }
  ];
  
  kpiData.forEach((kpi, index) => {
    const cardX = cardsStartX + index * (miniCardWidth + miniCardSpacing);
    
    // Card background
    doc.setFillColor(...colors.white);
    doc.roundedRect(cardX, cardStartY, miniCardWidth, miniCardHeight, 2, 2, 'F');
    doc.setDrawColor(...kpi.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(cardX, cardStartY, miniCardWidth, miniCardHeight, 2, 2, 'S');
    
    // Value with icon
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...kpi.color);
    doc.text(`${kpi.value} ${kpi.icon}`, cardX + miniCardWidth / 2, cardStartY + 6, { align: 'center' });
    
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...colors.muted);
    doc.text(kpi.label, cardX + miniCardWidth / 2, cardStartY + 11, { align: 'center' });
  });
  
  currentY += overviewHeight + 8;
  
  // === POINTS POSITIFS / VIGILANCE (2 columns) ===
  const colWidth = (pageWidth - 2 * margin - 8) / 2;
  const boxHeight = 52;
  
  // Get analysis data
  const subjectStats = data.classeCSV ? getSubjectAverages(data.classeCSV) : [];
  const strongSubjects = getStrongSubjects(subjectStats);
  const weakSubjects = getWeakSubjectsClass(subjectStats);
  
  // Points positifs
  const pointsPositifs = [
    ...strongSubjects.slice(0, 2).map(s => `${s.name}: ${s.currentAvg.toFixed(2)}`),
    ecartType < 2.5 ? 'Classe relativement homogene' : null,
    tauxReussite >= 70 ? `Taux de reussite eleve (${tauxReussite}%)` : null,
  ].filter(Boolean).slice(0, 4);
  
  // Points de vigilance
  const pointsVigilance = [
    ...weakSubjects.slice(0, 2).map(s => `${s.name}: ${s.currentAvg.toFixed(2)}`),
    elevesEnDifficulte > 0 ? `${elevesEnDifficulte} eleves en difficulte (${Math.round(elevesEnDifficulte / eleves.length * 100)}%)` : null,
    elevesAbsencesExcessives > 0 ? `${elevesAbsencesExcessives} absences prolongees` : null,
  ].filter(Boolean).slice(0, 4);
  
  // Points positifs box
  doc.setFillColor(...colors.excellent);
  doc.roundedRect(margin, currentY, colWidth, boxHeight, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.excellentText);
  doc.text('[+] POINTS POSITIFS', margin + 5, currentY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  let pointsY = currentY + 20;
  if (pointsPositifs.length === 0) {
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun point positif identifie', margin + 5, pointsY);
  } else {
    pointsPositifs.forEach(point => {
      doc.text(`- ${point}`, margin + 5, pointsY);
      pointsY += 8;
    });
  }
  
  // Points de vigilance box
  const col2Start = margin + colWidth + 8;
  doc.setFillColor(...colors.moyen);
  doc.roundedRect(col2Start, currentY, colWidth, boxHeight, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.moyenText);
  doc.text('[!] POINTS DE VIGILANCE', col2Start + 5, currentY + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  pointsY = currentY + 20;
  if (pointsVigilance.length === 0) {
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'italic');
    doc.text('Aucun point de vigilance', col2Start + 5, pointsY);
  } else {
    pointsVigilance.forEach(point => {
      doc.text(`- ${point}`, col2Start + 5, pointsY);
      pointsY += 8;
    });
  }
  
  currentY += boxHeight + 8;
  
  // === DECISIONS DU CONSEIL ===
  if (options.includeAttributions) {
    const attributions = data.studentAttributions || [];
    const nbFelicitations = attributions.filter(a => a === 'congratulations').length;
    const nbHonneur = attributions.filter(a => a === 'honor').length;
    const nbEncouragements = attributions.filter(a => a === 'encouragement').length;
    const nbAvertTravail = attributions.filter(a => a === 'warning_work').length;
    const nbAvertConduite = attributions.filter(a => a === 'warning_conduct').length;
    const nbAvertBoth = attributions.filter(a => a === 'warning_both').length;
    
    const decisionsHeight = 32;
    doc.setFillColor(...colors.background);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, decisionsHeight, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text('[*] DECISIONS DU CONSEIL', margin + 5, currentY + 10);
    
    // Attribution counters in a row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const attribY = currentY + 22;
    const attribSpacing = (pageWidth - 2 * margin - 20) / 6;
    
    const attrData = [
      { label: 'Felicitations', count: nbFelicitations, color: [139, 92, 246] as [number, number, number] },
      { label: 'Tableau honneur', count: nbHonneur, color: colors.success },
      { label: 'Encouragements', count: nbEncouragements, color: [59, 130, 246] as [number, number, number] },
      { label: 'Avert. Travail', count: nbAvertTravail, color: colors.warning },
      { label: 'Avert. Conduite', count: nbAvertConduite, color: colors.danger },
      { label: 'Avert. Double', count: nbAvertBoth, color: [127, 29, 29] as [number, number, number] },
    ];
    
    attrData.forEach((attr, index) => {
      const x = margin + 10 + index * attribSpacing;
      doc.setTextColor(...attr.color);
      doc.setFont('helvetica', 'bold');
      doc.text(String(attr.count), x, attribY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.muted);
      doc.setFontSize(6);
      doc.text(attr.label, x, attribY + 6);
      doc.setFontSize(8);
    });
    
    currentY += decisionsHeight + 8;
  }
  
  // === APPRECIATION GENERALE ===
  const appreciationHeight = 42;
  doc.setFillColor(...colors.bien);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, appreciationHeight, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.bienText);
  doc.text('[>] APPRECIATION GENERALE DU CONSEIL', margin + 5, currentY + 10);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  
  if (data.generalAppreciation) {
    const appreciationLines = doc.splitTextToSize(`"${data.generalAppreciation}"`, pageWidth - 2 * margin - 15);
    doc.text(appreciationLines.slice(0, 3), margin + 8, currentY + 20);
  } else {
    doc.setTextColor(...colors.muted);
    doc.text('Aucune appreciation generale renseignee.', margin + 8, currentY + 22);
  }
  
  addPageFooter(doc, colors);
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
// INDIVIDUAL APPRECIATIONS PAGES - Student Cards Design
// ============================================================

// Helper: Check if student is non-evaluable (prolonged absences)
function isStudentNonEvaluable(student: { average: number; absences?: number }): boolean {
  return student.average === 0 || isNaN(student.average) || (student.absences || 0) > 50;
}

// Helper: Get attribution badge configuration
function getAttributionBadgeConfig(attribution: Attribution): { bg: [number, number, number]; text: [number, number, number]; label: string } {
  const badges: Record<Attribution, { bg: [number, number, number]; text: [number, number, number]; label: string }> = {
    'congratulations': { bg: [220, 252, 231], text: [22, 101, 52], label: 'FELICITATIONS' },
    'honor': { bg: [209, 250, 229], text: [4, 120, 87], label: 'TABLEAU D\'HONNEUR' },
    'encouragement': { bg: [219, 234, 254], text: [30, 64, 175], label: 'ENCOURAGEMENTS' },
    'warning_work': { bg: [254, 243, 199], text: [146, 64, 14], label: 'AVERT. TRAVAIL' },
    'warning_conduct': { bg: [254, 226, 226], text: [185, 28, 28], label: 'AVERT. CONDUITE' },
    'warning_both': { bg: [254, 202, 202], text: [127, 29, 29], label: 'AVERT. DOUBLE' },
  };
  return badges[attribution];
}

// Helper: Get border color based on average
function getStudentCardBorderColor(moyenne: number, colors: typeof COLORS): [number, number, number] {
  if (moyenne >= 14) return colors.success;
  if (moyenne >= 12) return [59, 130, 246]; // Blue
  if (moyenne >= 10) return colors.warning;
  return colors.danger;
}

// Helper: Draw a student card
function drawStudentCard(
  doc: jsPDF,
  student: {
    name: string;
    average: number;
    appreciation: string;
    attribution: Attribution | null;
    rank: number;
    totalStudents: number;
    absences?: number;
    retards?: number;
  },
  startY: number,
  pageWidth: number,
  margin: number,
  options: ExportOptions,
  colors: typeof COLORS
): number {
  const cardWidth = pageWidth - 2 * margin;
  const isNonEvaluable = isStudentNonEvaluable(student);
  
  // Calculate card height based on content
  let cardHeight = 42;
  if (student.appreciation) {
    const appreciationLines = doc.splitTextToSize(student.appreciation, cardWidth - 20);
    const textHeight = Math.min(appreciationLines.length, 5) * 4;
    cardHeight = Math.max(42, 30 + textHeight);
  }
  cardHeight = Math.min(cardHeight, 65); // Max height
  
  // Determine border color
  const borderColor = isNonEvaluable 
    ? [156, 163, 175] as [number, number, number] // Gray for non-evaluable
    : getStudentCardBorderColor(student.average, colors);
  
  // Card background
  doc.setFillColor(...colors.white);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 4, 4, 'F');
  
  // Left color bar (accent)
  doc.setFillColor(...borderColor);
  doc.roundedRect(margin, startY, 4, cardHeight, 2, 2, 'F');
  doc.rect(margin + 2, startY, 2, cardHeight, 'F'); // Square off right side of bar
  
  // Border
  doc.setDrawColor(...colors.separator);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 4, 4, 'S');
  
  // Student name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  const displayName = student.name.length > 30 ? student.name.substring(0, 28) + '...' : student.name;
  doc.text(displayName.toUpperCase(), margin + 10, startY + 9);
  
  // Rank (right-aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text(`Rang: ${student.rank}/${student.totalStudents}`, pageWidth - margin - 5, startY + 9, { align: 'right' });
  
  // Gold separator line
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, startY + 13, pageWidth - margin - 10, startY + 13);
  
  // Data row: Average, Absences, Retards, Attribution
  let dataY = startY + 22;
  doc.setFontSize(9);
  
  if (isNonEvaluable) {
    // Non-evaluable alert
    doc.setFillColor(...colors.inquietant);
    doc.roundedRect(margin + 10, dataY - 5, 90, 8, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.inquietantText);
    doc.text('[!] NON EVALUABLE - Absences prolongees', margin + 12, dataY);
  } else {
    // Average with color and star for top 3
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...borderColor);
    let moyenneText = `Moyenne: ${student.average.toFixed(2)}`;
    if (student.rank <= 3) moyenneText += ' *';
    doc.text(moyenneText, margin + 10, dataY);
    
    // Absences and retards
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.muted);
    const absColor = (student.absences || 0) > 20 ? colors.danger : colors.muted;
    doc.setTextColor(...absColor);
    doc.text(`|  Abs: ${student.absences || 0}`, margin + 58, dataY);
    doc.setTextColor(...colors.muted);
    doc.text(`|  Ret: ${student.retards || 0}`, margin + 85, dataY);
  }
  
  // Attribution badge if present
  if (options.includeAttributions && student.attribution) {
    const badge = getAttributionBadgeConfig(student.attribution);
    const badgeX = pageWidth - margin - 50;
    doc.setFillColor(...badge.bg);
    doc.roundedRect(badgeX, dataY - 5, 45, 8, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...badge.text);
    doc.text(badge.label, badgeX + 22.5, dataY, { align: 'center' });
  }
  
  // Appreciation text
  const appreciationY = startY + 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  if (student.appreciation) {
    doc.setTextColor(...colors.text);
    const appreciationLines = doc.splitTextToSize(student.appreciation, cardWidth - 20);
    doc.text(appreciationLines.slice(0, 5), margin + 10, appreciationY);
  } else {
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'italic');
    doc.text('Appreciation non renseignee', margin + 10, appreciationY);
  }
  
  return cardHeight;
}

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
  
  // Build student list with all data
  let studentList = students.length > 0 
    ? students.map((s, i) => ({
        name: `${s.prenom} ${s.nom}`,
        average: s.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0) / (s.matieres.length || 1),
        appreciation: appreciations[i] || '',
        attribution: attributions[i] || null,
        absences: 0,
        retards: 0,
        rank: 0,
        totalStudents: 0,
      }))
    : data.classeCSV?.eleves.map((e, i) => ({
        name: e.nom,
        average: e.moyenneGenerale,
        appreciation: appreciations[i] || '',
        attribution: attributions[i] || null,
        absences: e.absences || 0,
        retards: e.retards || 0,
        rank: 0,
        totalStudents: 0,
      })) || [];
  
  // Sort by average descending and assign ranks
  studentList = studentList.sort((a, b) => b.average - a.average);
  studentList.forEach((s, i) => {
    s.rank = i + 1;
    s.totalStudents = studentList.length;
  });
  
  // Filter out non-evaluable students if option is enabled
  if (options.hideNonEvaluableStudents) {
    studentList = studentList.filter(s => !isStudentNonEvaluable(s));
  }
  
  if (studentList.length === 0) return;
  
  let currentPage = startPage;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const headerHeight = 22;
  const footerMargin = 25;
  const cardSpacing = 6;
  
  doc.addPage();
  addPageHeader(doc, className, trimester, colors, currentPage, totalPages);
  
  let yPos = headerHeight;
  
  // Page title
  doc.setTextColor(...colors.primary);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Appreciations individuelles (${studentList.length} eleves)`, margin, yPos + 5);
  yPos += 15;
  
  for (let i = 0; i < studentList.length; i++) {
    const student = studentList[i];
    
    // Estimate card height for page break check
    let estimatedHeight = 42;
    if (student.appreciation) {
      const lines = doc.splitTextToSize(student.appreciation, pageWidth - 2 * margin - 20);
      estimatedHeight = Math.min(Math.max(42, 30 + lines.length * 4), 65);
    }
    
    // Check if we need a new page
    if (yPos + estimatedHeight > pageHeight - footerMargin) {
      addPageFooter(doc, colors);
      doc.addPage();
      currentPage++;
      addPageHeader(doc, className, trimester, colors, currentPage, totalPages);
      yPos = headerHeight;
    }
    
    // Draw student card
    const cardHeight = drawStudentCard(doc, student, yPos, pageWidth, margin, options, colors);
    yPos += cardHeight + cardSpacing;
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
  
  // Calculate total pages (updated for executive summary)
  const nbStudents = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const individualPages = Math.ceil(nbStudents / 3); // 2-3 students per page with new card design
  const hasAnalysisData = !!data.classeCSV;
  
  // Pages: Cover + Executive Summary + Results + Monitoring + Ranking + Subjects + General + Individual
  const basePagesWithAnalysis = hasAnalysisData ? 7 : 5; // +1 for executive summary
  const totalPages = basePagesWithAnalysis + individualPages;
  
  let currentPage = 1;
  
  // Page 1: Cover
  addCoverPage(doc, data, colors);
  currentPage++;
  
  // Page 2: Executive Summary (NEW)
  if (hasAnalysisData) {
    addExecutiveSummaryPage(doc, data, options, colors, className, trimester, currentPage, totalPages);
    currentPage++;
  }
  
  // Page 3-4: Results Analysis (only if we have CSV data)
  if (hasAnalysisData) {
    addResultsAnalysisPage(doc, data, colors, className, trimester, currentPage, totalPages);
    currentPage++;
    
    addStudentsMonitoringPage(doc, data, colors, className, trimester, currentPage, totalPages);
    currentPage++;
  }
  
  // Page 5: Student Ranking
  addGlobalAnalysisPage(doc, data, options, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Page 6: Subject Analysis
  addSubjectAnalysisPage(doc, data, options, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Page 7: General Appreciation
  addGeneralAppreciationPage(doc, data, colors, className, trimester, currentPage, totalPages);
  currentPage++;
  
  // Pages 8+: Individual Appreciations (with new card design)
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
