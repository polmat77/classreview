// Utility functions for bulletin analysis (subject-specific observations)

import { ObservationParMatiere } from "@/types/reportcard";

// List of subjects available for selection
export const MATIERES_DISPONIBLES = [
  "Mathématiques",
  "Français",
  "Anglais LV1",
  "Espagnol LV2",
  "Allemand LV2",
  "Histoire-Géographie",
  "EMC",
  "SVT",
  "Physique-Chimie",
  "Technologie",
  "EPS",
  "Arts Plastiques",
  "Éducation Musicale",
  "Latin",
  "Grec",
];

// List of behaviors to observe
export const COMPORTEMENTS_DISPONIBLES = [
  { value: "Bavardages", label: "Bavardages", type: "negatif" as const },
  { value: "Insolence", label: "Insolence", type: "negatif" as const },
  { value: "Inattention", label: "Inattention", type: "negatif" as const },
  { value: "Téléphone portable", label: "Téléphone portable", type: "negatif" as const },
  { value: "Retards répétés", label: "Retards répétés", type: "negatif" as const },
  { value: "Passivité", label: "Passivité", type: "negatif" as const },
  { value: "Difficultés importantes", label: "Difficultés importantes", type: "negatif" as const },
  { value: "Participation active", label: "Participation active", type: "positif" as const },
  { value: "Travail sérieux", label: "Travail sérieux", type: "positif" as const },
  { value: "Excellents résultats", label: "Excellents résultats", type: "positif" as const },
];

export interface ComportementRecurrent {
  comportement: string;
  matieres: string[];
  type: "positif" | "negatif";
}

/**
 * Detect behaviors that occur in 2+ different subjects for a student
 */
export function detecterComportementsRecurrents(
  observationsParMatiere: ObservationParMatiere[] | undefined
): ComportementRecurrent[] {
  if (!observationsParMatiere || observationsParMatiere.length === 0) {
    return [];
  }

  // Group by behavior
  const groupes: Record<string, string[]> = {};

  observationsParMatiere.forEach((obs) => {
    if (!groupes[obs.comportement]) {
      groupes[obs.comportement] = [];
    }
    // Avoid duplicates
    if (!groupes[obs.comportement].includes(obs.matiere)) {
      groupes[obs.comportement].push(obs.matiere);
    }
  });

  // Filter those appearing in 2+ subjects
  return Object.entries(groupes)
    .filter(([_, matieres]) => matieres.length >= 2)
    .map(([comportement, matieres]) => {
      const config = COMPORTEMENTS_DISPONIBLES.find(c => c.value === comportement);
      return {
        comportement,
        matieres,
        type: config?.type || "negatif",
      };
    });
}

/**
 * Categorize subjects by results (successes and difficulties)
 */
export function categoriserResultatsParMatiere(
  observationsParMatiere: ObservationParMatiere[] | undefined
): { reussites: string[]; difficultes: string[] } {
  if (!observationsParMatiere || observationsParMatiere.length === 0) {
    return { reussites: [], difficultes: [] };
  }

  const reussites = observationsParMatiere
    .filter((obs) => obs.comportement === "Excellents résultats")
    .map((obs) => obs.matiere);

  const difficultes = observationsParMatiere
    .filter((obs) => obs.comportement === "Difficultés importantes")
    .map((obs) => obs.matiere);

  // Remove duplicates
  return {
    reussites: [...new Set(reussites)],
    difficultes: [...new Set(difficultes)],
  };
}

/**
 * Format recurring behaviors for AI prompt
 */
export function formaterComportementsRecurrents(
  comportements: ComportementRecurrent[]
): string {
  if (comportements.length === 0) {
    return "Aucun signalement";
  }

  return comportements
    .map((c) => `${c.comportement} en : ${c.matieres.join(", ")}`)
    .join(" | ");
}

/**
 * Format subject list for display
 */
export function formaterListeMatieres(matieres: string[]): string {
  if (matieres.length === 0) return "Non spécifié";
  if (matieres.length === 1) return matieres[0];
  if (matieres.length === 2) return `${matieres[0]} et ${matieres[1]}`;
  
  const last = matieres[matieres.length - 1];
  const rest = matieres.slice(0, -1);
  return `${rest.join(", ")} et ${last}`;
}
