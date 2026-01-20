// PDF Parser specifically for PRONOTE grade exports
import { Student, ClassMetadata } from "@/types/reportcard";
import { extractTextFromPDF } from "./pdfParser";

export interface PronoteParseResult {
  students: Student[];
  metadata: ClassMetadata | null;
}

/**
 * Extract class metadata from PRONOTE PDF text
 */
function extractMetadata(text: string): ClassMetadata | null {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  let className = "";
  let subject = "";
  let teacher = "";
  let period = "";

  for (const line of lines) {
    // Class or Group
    const classMatch = line.match(/(?:Classe|Groupe)\s*:\s*(.+)/i);
    if (classMatch) {
      className = classMatch[1].trim();
    }
    
    // Subject/Matière
    const subjectMatch = line.match(/(?:Matière|MATIERE)\s*:\s*(.+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }
    
    // Period/Trimestre
    const periodMatch = line.match(/(?:Période|Trimestre|TRIMESTRE)\s*:?\s*(\d)/i);
    if (periodMatch) {
      period = `Trimestre ${periodMatch[1]}`;
    }
    
    // Also try: "Du XX/XX/XXXX au XX/XX/XXXX"
    if (!period) {
      const dateMatch = line.match(/du\s+\d{2}\/\d{2}\/\d{4}\s+au\s+\d{2}\/\d{2}\/\d{4}/i);
      if (dateMatch) {
        period = dateMatch[0];
      }
    }
  }

  if (!className && !subject) {
    return null;
  }

  return { className, subject, teacher, period };
}

/**
 * Parse PRONOTE grade export to extract students with detailed data
 */
function parseStudentsFromPronote(text: string): Student[] {
  const lines = text.split("\n");
  const students: Student[] = [];
  
  // Pattern for student lines: "NOM Prénom" followed by numbers
  // PRONOTE format: NOM PRENOM    MOYENNE    NOTE1    NOTE2    ...
  // Look for uppercase names followed by mixed case first name and numbers
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip header lines and non-student lines
    if (
      trimmedLine.toLowerCase().includes("moyenne") && 
      trimmedLine.toLowerCase().includes("classe")
    ) continue;
    if (trimmedLine.startsWith("Classe")) continue;
    if (trimmedLine.startsWith("Matière")) continue;
    if (trimmedLine.startsWith("Période")) continue;
    
    // Pattern: Student name (NAME Firstname) followed by their average
    // Example: "ABED Laly 18,60 20 19 30 4,5"
    // Example: "AIT BOUHRIR Isaac 13,33 15 11 20 1"
    
    // More flexible regex to capture compound last names
    const studentMatch = trimmedLine.match(
      /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s-]+)\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç\-]+(?:\s+[A-Za-zàâäéèêëïîôùûüç\-]+)?)\s+([\d,.\s]+)/
    );
    
    if (studentMatch) {
      const lastName = studentMatch[1].trim();
      const firstName = studentMatch[2].trim();
      const numbersStr = studentMatch[3];
      
      // Parse all numbers from the line
      const numbers = numbersStr
        .split(/\s+/)
        .map(n => parseFloat(n.replace(",", ".")))
        .filter(n => !isNaN(n));
      
      // First number is typically the average
      const average = numbers.length > 0 ? numbers[0] : null;
      
      // Try to find Sérieux and Participation scores
      // Usually they are the 2nd and 3rd numbers if present (coefficient-weighted)
      let seriousness: number | null = null;
      let participation: number | null = null;
      
      // Check if we have enough numbers for sériieux and participation
      // This depends on the PDF structure - usually Sérieux is 2nd, Participation is 3rd
      if (numbers.length >= 3) {
        // Assuming seriousness is /20 and participation is /20
        seriousness = numbers[1] <= 20 ? numbers[1] : null;
        participation = numbers[2] <= 20 ? numbers[2] : null;
      }
      
      // Count "Abs" occurrences for absences
      const absCount = (trimmedLine.match(/\bAbs\b/gi) || []).length;
      
      // Count "N.Rdu" or "NR" for non-rendered work
      const nrCount = (trimmedLine.match(/\bN\.?Rdu\b|\bNR\b/gi) || []).length;
      
      students.push({
        id: students.length + 1,
        lastName,
        firstName,
        average,
        seriousness,
        participation,
        absences: absCount > 0 ? absCount : undefined,
        nonRendus: nrCount > 0 ? nrCount : undefined,
      });
    }
  }
  
  // If no structured data found, try simpler pattern
  if (students.length === 0) {
    return parseStudentsSimple(text);
  }
  
  // Sort alphabetically and reassign IDs
  return students
    .sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName, "fr");
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName, "fr");
    })
    .map((student, index) => ({ ...student, id: index + 1 }));
}

/**
 * Simple parsing fallback for non-standard formats
 */
function parseStudentsSimple(text: string): Student[] {
  const lines = text.split("\n").filter((line) => line.trim());
  const students: Student[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Try pattern: "Nom Prénom - 14.5" or "Nom Prénom 14.5"
    let match = trimmedLine.match(/^(.+?)\s*[-–]\s*(\d+[.,]?\d*)?$/);
    if (!match) {
      match = trimmedLine.match(/^(.+?)\s+(\d+[.,]?\d*)$/);
    }
    
    if (match) {
      const namePart = match[1].trim();
      const averageStr = match[2];
      const average = averageStr ? parseFloat(averageStr.replace(",", ".")) : null;
      
      const nameParts = namePart.split(/\s+/);
      const lastName = nameParts[0] || "";
      const firstName = nameParts.slice(1).join(" ") || "";
      
      if (lastName) {
        students.push({
          id: students.length + 1,
          lastName,
          firstName,
          average: average && !isNaN(average) ? average : null,
        });
      }
    }
  }
  
  return students
    .sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName, "fr");
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName, "fr");
    })
    .map((student, index) => ({ ...student, id: index + 1 }));
}

/**
 * Calculate class average from students
 */
function calculateClassAverage(students: Student[]): number {
  const studentsWithAverage = students.filter(s => s.average !== null);
  if (studentsWithAverage.length === 0) return 0;
  
  const sum = studentsWithAverage.reduce((acc, s) => acc + (s.average || 0), 0);
  return sum / studentsWithAverage.length;
}

/**
 * Main function to parse PRONOTE PDF
 */
export async function parsePronoteGradePDF(file: File): Promise<PronoteParseResult> {
  const text = await extractTextFromPDF(file);
  
  const students = parseStudentsFromPronote(text);
  let metadata = extractMetadata(text);
  
  if (metadata) {
    metadata.classAverage = calculateClassAverage(students);
  }
  
  return { students, metadata };
}

/**
 * Parse students from manual text input
 */
export function parseStudentsFromManualInput(input: string): Student[] {
  return parseStudentsSimple(input);
}
