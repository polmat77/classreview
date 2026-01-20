// PDF Parser specifically for PRONOTE grade exports
import { Student, ClassMetadata } from "@/types/reportcard";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure le worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PronoteParseResult {
  students: Student[];
  metadata: ClassMetadata | null;
  rawText?: string; // For debugging
}

/**
 * Extract text from PDF with improved line handling
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Group items by their Y position to preserve line structure
      const items = textContent.items as Array<{ str: string; transform: number[] }>;
      const lineMap = new Map<number, string[]>();
      
      for (const item of items) {
        if (!item.str.trim()) continue;
        // Y position is at transform[5], round to group nearby items
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str);
      }
      
      // Sort by Y position (descending because PDF Y is bottom-up) and join lines
      const sortedLines = Array.from(lineMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, texts]) => texts.join(' '));
      
      fullText += sortedLines.join('\n') + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    throw new Error('Impossible de lire le fichier PDF. Vérifiez que le fichier n\'est pas corrompu ou protégé.');
  }
}

/**
 * Extract class metadata from PRONOTE PDF text
 */
function extractMetadata(text: string): ClassMetadata | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let className = "";
  let subject = "";
  let teacher = "";
  let period = "";

  for (const line of lines) {
    // Class or Group - multiple patterns
    const classMatch = line.match(/(?:Classe|Groupe)\s*:\s*(.+)/i);
    if (classMatch) {
      className = classMatch[1].trim();
    }
    
    // Subject/Matière
    const subjectMatch = line.match(/(?:Matière|MATIERE)\s*:\s*(.+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }
    
    // Teacher/Professeur
    const teacherMatch = line.match(/(?:Professeur|PROFESSEUR)\s*:\s*(.+)/i);
    if (teacherMatch) {
      teacher = teacherMatch[1].trim();
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
 * Parse a note string to number
 */
function parseNote(noteStr: string | undefined): number | null {
  if (!noteStr) return null;
  const cleaned = noteStr.trim();
  if (cleaned === '-' || cleaned === '' || cleaned.toLowerCase() === 'abs' || cleaned.toLowerCase().includes('n.rdu')) {
    return null;
  }
  const normalized = cleaned.replace(',', '.').replace('*', '');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Check if a line is a student data line
 * Pattern: NAME (uppercase) followed by FirstName then numbers
 */
function isStudentLine(line: string): boolean {
  // Must start with uppercase letters (the name)
  // Then have mixed case (firstname)  
  // Then have numbers
  const pattern = /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s'-]+\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç'-]+/;
  const hasNumbers = /\d+[,.]?\d*/.test(line);
  
  // Exclude header/metadata lines
  const excludePatterns = [
    /^Moy\.?\s/i,
    /^Classe\s*:/i,
    /^Groupe\s*:/i,
    /^Matière\s*:/i,
    /^Professeur\s*:/i,
    /^Période\s*:/i,
    /^Tableau/i,
    /^COLLEGE/i,
    /^LYCEE/i,
    /Index Education/i,
    /^\d+\s+élèves/i,
    /^Moyenne/i,
    /^Sérieux/i,
    /^Participation/i,
    /Coef\./i,
  ];
  
  if (excludePatterns.some(p => p.test(line))) {
    return false;
  }
  
  return pattern.test(line) && hasNumbers;
}

/**
 * Parse a single student line from PRONOTE
 * Format: "NOM COMPOSÉ Prénom Composé 17,90 20,00 18,00 ... Abs N.Rdu"
 */
function parseStudentLine(line: string): Student | null {
  // Split the line into parts
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3) return null;
  
  // Find where name ends and numbers begin
  // Names are uppercase, firstnames start with uppercase then lowercase
  let nameEndIndex = -1;
  let inFirstName = false;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Check if this is a number or special value
    if (/^[\d,.-]+$/.test(part) || part === 'Abs' || part.includes('N.Rdu')) {
      nameEndIndex = i;
      break;
    }
    
    // Check if this is a firstname (starts uppercase, rest lowercase)
    if (/^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç'-]+$/.test(part)) {
      inFirstName = true;
    }
    // If we were in firstname and now see uppercase again, might be compound
    else if (inFirstName && /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç'-]+$/.test(part)) {
      // Still firstname (compound firstname like "Jean-Pierre")
    }
  }
  
  if (nameEndIndex === -1 || nameEndIndex < 2) {
    return null;
  }
  
  // Now split name and firstname
  // Strategy: walk through parts, uppercase = lastname, first mixed case = start of firstname
  const nameParts: string[] = [];
  const firstNameParts: string[] = [];
  let hitFirstName = false;
  
  for (let i = 0; i < nameEndIndex; i++) {
    const part = parts[i];
    
    // All uppercase = lastname (unless we already hit firstname)
    if (!hitFirstName && /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ'-]+$/.test(part)) {
      nameParts.push(part);
    } else {
      hitFirstName = true;
      firstNameParts.push(part);
    }
  }
  
  if (nameParts.length === 0 || firstNameParts.length === 0) {
    // Fallback: first part is name, second is firstname
    if (nameEndIndex >= 2) {
      nameParts.push(parts[0]);
      firstNameParts.push(parts[1]);
    } else {
      return null;
    }
  }
  
  const lastName = nameParts.join(' ');
  const firstName = firstNameParts.join(' ');
  
  // Parse the numeric/special values
  const valueParts = parts.slice(nameEndIndex);
  
  // Count absences and non-rendus
  let absences = 0;
  let nonRendus = 0;
  
  for (const val of valueParts) {
    if (val.toLowerCase() === 'abs') absences++;
    if (val.toLowerCase().includes('n.rdu')) nonRendus++;
  }
  
  // Get numeric values only
  const numericValues: (number | null)[] = [];
  for (const val of valueParts) {
    if (/^[\d,.-]+$/.test(val)) {
      numericValues.push(parseNote(val));
    }
  }
  
  // First number is the general average
  const average = numericValues.length > 0 ? numericValues[0] : null;
  
  // Sérieux is typically the 2nd number (if exists and <=20)
  let seriousness: number | null = null;
  if (numericValues.length >= 2 && numericValues[1] !== null && numericValues[1] <= 20) {
    seriousness = numericValues[1];
  }
  
  // Participation is typically the 3rd number (if exists and <=20)
  let participation: number | null = null;
  if (numericValues.length >= 3 && numericValues[2] !== null && numericValues[2] <= 20) {
    participation = numericValues[2];
  }
  
  return {
    id: 0, // Will be set later
    lastName,
    firstName,
    average,
    seriousness,
    participation,
    absences: absences > 0 ? absences : undefined,
    nonRendus: nonRendus > 0 ? nonRendus : undefined,
  };
}

/**
 * Alternative parsing using regex for complex cases
 */
function parseStudentsWithRegex(text: string): Student[] {
  const students: Student[] = [];
  const lines = text.split('\n');
  
  // More flexible regex for student lines
  // Matches: LASTNAME(S) Firstname(s) followed by numbers
  const studentRegex = /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s'-]*[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ])\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç'-]+(?:\s+[A-Za-zàâäéèêëïîôùûüç'-]+)*)\s+([\d,.\s\-AbsN.Rdu*]+)$/;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Skip metadata lines
    if (/^(Moy\.|Classe|Groupe|Matière|Professeur|Période|Tableau|COLLEGE|LYCEE)/i.test(trimmed)) {
      continue;
    }
    if (/Index Education|\d+\s+élèves/i.test(trimmed)) {
      continue;
    }
    
    const match = trimmed.match(studentRegex);
    if (match) {
      const lastName = match[1].trim();
      const firstName = match[2].trim();
      const valuesStr = match[3];
      
      // Parse values
      const valueParts = valuesStr.split(/\s+/);
      let absences = 0;
      let nonRendus = 0;
      const numericValues: (number | null)[] = [];
      
      for (const val of valueParts) {
        if (val.toLowerCase() === 'abs') {
          absences++;
        } else if (val.toLowerCase().includes('n.rdu')) {
          nonRendus++;
        } else if (/^[\d,.-]+$/.test(val)) {
          numericValues.push(parseNote(val));
        }
      }
      
      const average = numericValues.length > 0 ? numericValues[0] : null;
      let seriousness: number | null = null;
      let participation: number | null = null;
      
      if (numericValues.length >= 2 && numericValues[1] !== null && numericValues[1] <= 20) {
        seriousness = numericValues[1];
      }
      if (numericValues.length >= 3 && numericValues[2] !== null && numericValues[2] <= 20) {
        participation = numericValues[2];
      }
      
      students.push({
        id: 0,
        lastName,
        firstName,
        average,
        seriousness,
        participation,
        absences: absences > 0 ? absences : undefined,
        nonRendus: nonRendus > 0 ? nonRendus : undefined,
      });
    }
  }
  
  return students;
}

/**
 * Parse PRONOTE grade export to extract students with detailed data
 */
function parseStudentsFromPronote(text: string): Student[] {
  const lines = text.split('\n');
  const students: Student[] = [];
  
  // First pass: try line-by-line parsing
  for (const line of lines) {
    if (isStudentLine(line)) {
      const student = parseStudentLine(line);
      if (student) {
        students.push(student);
      }
    }
  }
  
  // If no students found, try regex approach
  if (students.length === 0) {
    const regexStudents = parseStudentsWithRegex(text);
    if (regexStudents.length > 0) {
      return regexStudents
        .sort((a, b) => {
          const lastNameCompare = a.lastName.localeCompare(b.lastName, "fr");
          if (lastNameCompare !== 0) return lastNameCompare;
          return a.firstName.localeCompare(b.firstName, "fr");
        })
        .map((student, index) => ({ ...student, id: index + 1 }));
    }
  }
  
  // If still no students, try simple fallback
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
    
    // Skip metadata
    if (/^(Moy\.|Classe|Groupe|Matière|Professeur|Période|Tableau)/i.test(trimmedLine)) {
      continue;
    }
    
    // Try pattern: "Nom Prénom - 14.5" or "Nom Prénom 14.5"
    let match = trimmedLine.match(/^([A-Za-zÀ-ÿ]+)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)\s*[-–]?\s*(\d+[.,]?\d*)?$/);
    
    if (match) {
      const lastName = match[1].trim();
      const firstName = match[2].trim();
      const averageStr = match[3];
      const average = averageStr ? parseFloat(averageStr.replace(",", ".")) : null;
      
      if (lastName && firstName) {
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
 * Extract class average from text
 */
function extractClassAverage(text: string): number | null {
  const patterns = [
    /Moy\.?\s*(?:de la |du )?(?:classe|groupe)\s*:?\s*([\d,]+)/i,
    /Moyenne\s*(?:de la |du )?(?:classe|groupe)\s*:?\s*([\d,]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  
  return null;
}

/**
 * Calculate class average from students if not found in text
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
  
  console.log("=== PRONOTE PDF RAW TEXT ===");
  console.log(text.substring(0, 2000));
  console.log("=== END RAW TEXT ===");
  
  const students = parseStudentsFromPronote(text);
  let metadata = extractMetadata(text);
  
  if (metadata) {
    // Try to get class average from text first
    const textAverage = extractClassAverage(text);
    metadata.classAverage = textAverage ?? calculateClassAverage(students);
  } else if (students.length > 0) {
    // Create minimal metadata if we found students
    metadata = {
      className: "",
      subject: "",
      teacher: "",
      period: "",
      classAverage: calculateClassAverage(students),
    };
  }
  
  return { students, metadata, rawText: text };
}

/**
 * Parse students from manual text input
 */
export function parseStudentsFromManualInput(input: string): Student[] {
  return parseStudentsSimple(input);
}
