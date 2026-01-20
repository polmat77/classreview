import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BulletinClasseData, BulletinEleveData } from '@/utils/pdfParser';
import { ClasseDataCSV } from '@/utils/csvParser';

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
}

export interface ExportData {
  bulletinClasse?: BulletinClasseData;
  bulletinsEleves?: BulletinEleveData[];
  classeCSV?: ClasseDataCSV;
  generalAppreciation?: string;
  studentAppreciations?: string[];
}

const COLORS = {
  primary: [25, 45, 67] as [number, number, number], // #192D43
  primaryLight: [44, 62, 80] as [number, number, number],
  accent: [245, 158, 11] as [number, number, number], // Amber
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
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
};

function getColors(colorMode: boolean) {
  return colorMode ? COLORS : COLORS_BW;
}

function addPageHeader(doc: jsPDF, title: string, colors: typeof COLORS, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header bar
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 10);
  
  // Page number
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - 14, 10, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(...colors.text);
}

function addCoverPage(doc: jsPDF, data: ExportData, colors: typeof COLORS) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Top banner
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ClassCouncil AI', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport du Conseil de Classe', pageWidth / 2, 50, { align: 'center' });
  
  // Class info box
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
  doc.text(moyenneClasse.toFixed(1), 157.5, statsY + 25, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Élèves', 52.5, statsY + 40, { align: 'center' });
  doc.text('Matières', 105, statsY + 40, { align: 'center' });
  doc.text('Moyenne', 157.5, statsY + 40, { align: 'center' });
  
  // Footer
  doc.setTextColor(...colors.muted);
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par ClassCouncil AI`, pageWidth / 2, pageHeight - 20, { align: 'center' });
}

function addGlobalAnalysisPage(doc: jsPDF, data: ExportData, options: ExportOptions, colors: typeof COLORS, pageNum: number, totalPages: number) {
  doc.addPage();
  addPageHeader(doc, 'Analyse globale de la classe', colors, pageNum, totalPages);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 25;
  
  // Title
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse des résultats', 14, yPos);
  yPos += 12;
  
  if (data.classeCSV) {
    const stats = data.classeCSV.statistiques;
    
    // Stats cards
    const cardWidth = (pageWidth - 42) / 3;
    
    // Card 1: Moyenne classe
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, cardWidth, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text('Moyenne de la classe', 14 + cardWidth / 2, yPos + 10, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(stats.moyenneClasse.toFixed(2), 14 + cardWidth / 2, yPos + 26, { align: 'center' });
    
    // Card 2: Au-dessus de 10
    doc.setFillColor(...colors.background);
    doc.roundedRect(14 + cardWidth + 7, yPos, cardWidth, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('Moyenne ≥ 10', 14 + cardWidth * 1.5 + 7, yPos + 10, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...colors.success);
    doc.setFont('helvetica', 'bold');
    const nbAbove10 = data.classeCSV.eleves.filter(e => e.moyenneGenerale >= 10).length;
    doc.text(String(nbAbove10), 14 + cardWidth * 1.5 + 7, yPos + 26, { align: 'center' });
    
    // Card 3: En dessous de 10
    doc.setFillColor(...colors.background);
    doc.roundedRect(14 + (cardWidth + 7) * 2, yPos, cardWidth, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('Moyenne < 10', 14 + cardWidth * 2.5 + 14, yPos + 10, { align: 'center' });
    doc.setFontSize(18);
    doc.setTextColor(...colors.danger);
    doc.setFont('helvetica', 'bold');
    const nbBelow10 = data.classeCSV.eleves.filter(e => e.moyenneGenerale < 10).length;
    doc.text(String(nbBelow10), 14 + cardWidth * 2.5 + 14, yPos + 26, { align: 'center' });
    
    yPos += 45;
    
    // Students table
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Classement des élèves', 14, yPos);
    yPos += 8;
    
    const tableData = data.classeCSV.eleves
      .sort((a, b) => b.moyenneGenerale - a.moyenneGenerale)
      .map((eleve, i) => [
        i + 1,
        eleve.nom,
        eleve.moyenneGenerale.toFixed(2),
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
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: colors.background,
      },
      margin: { left: 14, right: 14 },
    });
  } else if (data.classeCSV) {
    // Use CSV data for subjects
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
    // Appreciation box
    doc.setFillColor(...colors.background);
    doc.roundedRect(14, yPos, pageWidth - 28, 60, 5, 5, 'F');
    
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, yPos, pageWidth - 28, 60, 5, 5, 'S');
    
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

function addIndividualAppreciationsPages(doc: jsPDF, data: ExportData, colors: typeof COLORS, startPage: number, totalPages: number) {
  const students = data.bulletinsEleves || [];
  const appreciations = data.studentAppreciations || [];
  
  if (students.length === 0 && !data.classeCSV?.eleves.length) return;
  
  const studentList = students.length > 0 
    ? students.map((s, i) => ({
        name: `${s.prenom} ${s.nom}`,
        average: s.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0) / (s.matieres.length || 1),
        appreciation: appreciations[i] || '',
      }))
    : data.classeCSV?.eleves.map((e, i) => ({
        name: e.nom,
        average: e.moyenneGenerale,
        appreciation: appreciations[i] || '',
      })) || [];
  
  let currentPage = startPage;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Students per page
  const studentsPerPage = 4;
  const cardHeight = 50;
  
  for (let i = 0; i < studentList.length; i += studentsPerPage) {
    doc.addPage();
    addPageHeader(doc, 'Appréciations individuelles', colors, currentPage, totalPages);
    currentPage++;
    
    let yPos = 25;
    
    const pageStudents = studentList.slice(i, i + studentsPerPage);
    
    pageStudents.forEach((student, idx) => {
      // Student card
      doc.setFillColor(...colors.background);
      doc.roundedRect(14, yPos, pageWidth - 28, cardHeight, 3, 3, 'F');
      
      // Student name and average
      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(student.name, 20, yPos + 12);
      
      // Average badge
      const avgColor = student.average >= 14 ? colors.success : student.average >= 10 ? colors.warning : colors.danger;
      doc.setFillColor(...avgColor);
      doc.roundedRect(pageWidth - 45, yPos + 5, 25, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(student.average.toFixed(1), pageWidth - 32.5, yPos + 13, { align: 'center' });
      
      // Appreciation text
      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (student.appreciation) {
        const lines = doc.splitTextToSize(student.appreciation, pageWidth - 48);
        doc.text(lines.slice(0, 3), 20, yPos + 24);
      } else {
        doc.setTextColor(...colors.muted);
        doc.setFont('helvetica', 'italic');
        doc.text('Appréciation non générée', 20, yPos + 24);
      }
      
      yPos += cardHeight + 8;
    });
  }
}

export function generatePDF(data: ExportData, options: ExportOptions): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const colors = getColors(options.colorMode);
  
  // Calculate total pages
  const nbStudents = data.classeCSV?.eleves.length || data.bulletinsEleves?.length || 0;
  const individualPages = Math.ceil(nbStudents / 4);
  const totalPages = 1 + 1 + 1 + 1 + individualPages; // Cover + Global + Subject + General + Individual
  
  // Page 1: Cover
  addCoverPage(doc, data, colors);
  
  // Page 2: Global Analysis
  addGlobalAnalysisPage(doc, data, options, colors, 2, totalPages);
  
  // Page 3: Subject Analysis
  addSubjectAnalysisPage(doc, data, options, colors, 3, totalPages);
  
  // Page 4: General Appreciation
  addGeneralAppreciationPage(doc, data, colors, 4, totalPages);
  
  // Pages 5+: Individual Appreciations
  if (nbStudents > 0) {
    addIndividualAppreciationsPages(doc, data, colors, 5, totalPages);
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
