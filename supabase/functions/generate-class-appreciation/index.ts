import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppreciationTone = "severe" | "standard" | "encourageant" | "elogieux";

const toneInstructions: Record<AppreciationTone, string> = {
  severe:
    "Adopte un ton SÉVÈRE et DIRECT : constate les difficultés, les lacunes et les problèmes de comportement sans détour. Utilise un vocabulaire ferme : 'insuffisant', 'préoccupant', 'le conseil met en garde', 'des efforts impératifs sont attendus'.",
  standard:
    "Adopte un ton FACTUEL et OBJECTIF : équilibre entre constats positifs et axes d'amélioration. Formulations institutionnelles : 'globalement satisfaisant', 'des efforts à poursuivre', 'le conseil encourage'.",
  encourageant:
    "Adopte un ton BIENVEILLANT et MOTIVANT : valorise les efforts, formule les critiques comme des conseils constructifs. Utilise : 'en progression', 'des efforts remarqués', 'le conseil encourage à poursuivre'.",
  elogieux:
    "Adopte un ton ÉLOGIEUX et ENTHOUSIASTE : célèbre les réussites, félicite la classe. Utilise : 'félicitations', 'excellent', 'remarquable dynamique', 'le conseil salue'.",
};

/**
 * ═══════════════════════════════════════════════════════════
 * UNIVERSAL TEACHER NAME DETECTION
 * No static list needed - works for ANY school worldwide
 * ═══════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════
 * FORMULATION EXAMPLES - Enriched Library
 * ═══════════════════════════════════════════════════════════
 */
const FORMULATION_EXAMPLES = {
  ouverture: {
    positive: [
      "Classe agréable dans l'ensemble qui participe avec intérêt aux activités proposées.",
      "Groupe classe dynamique et investi dans les apprentissages.",
      "Classe plaisante à enseigner avec une bonne ambiance de travail.",
      "Bon groupe classe, volontaire et à l'écoute des consignes.",
    ],
    nuancee: [
      "Classe hétérogène avec des profils très différents.",
      "Groupe au potentiel intéressant mais à l'investissement variable.",
      "Ensemble sympathique mais manquant parfois de rigueur dans le travail.",
      "Classe au comportement correct mais dont l'engagement reste inégal.",
    ],
    critique: [
      "Classe difficile à mobiliser malgré les efforts des enseignants.",
      "Groupe agité qui peine à se concentrer sur les apprentissages.",
      "Classe au climat peu propice au travail scolaire.",
      "Ensemble bavard qui doit apprendre à canaliser son énergie.",
    ],
  },
  developpement: {
    travail: [
      "Le travail personnel reste insuffisant dans plusieurs disciplines.",
      "L'investissement dans les tâches demandées est globalement satisfaisant.",
      "Un effort soutenu est constaté dans le suivi des apprentissages.",
      "Le manque de rigueur dans les devoirs pénalise les progrès.",
      "Le sérieux et l'application sont remarqués par la plupart des enseignants.",
    ],
    comportement: [
      "Les bavardages perturbent régulièrement l'ambiance de classe.",
      "Le comportement est globalement respectueux des règles établies.",
      "Quelques tensions relationnelles nécessitent une vigilance particulière.",
      "L'agitation excessive nuit à la concentration collective.",
      "Le respect mutuel et la bienveillance caractérisent ce groupe.",
    ],
    participation: [
      "La participation reste timide malgré les sollicitations répétées.",
      "Les élèves s'impliquent activement dans les échanges et les débats.",
      "Une partie du groupe demeure en retrait lors des activités orales.",
      "L'engagement dans les projets collectifs est remarquable.",
      "La prise de parole spontanée doit être encouragée.",
    ],
    assiduité: [
      "L'assiduité et la ponctualité sont globalement respectées.",
      "Des absences répétées fragilisent le suivi des apprentissages.",
      "La régularité de présence permet une progression continue.",
      "Les retards fréquents perturbent le bon déroulement des cours.",
    ],
  },
  conclusion: {
    encourageant: [
      "Le conseil encourage à poursuivre les efforts engagés.",
      "Des progrès sont attendus dans les semaines à venir.",
      "Le potentiel est là, il reste à le concrétiser pleinement.",
      "La dynamique positive doit être maintenue au prochain trimestre.",
      "Les enseignants restent confiants dans les capacités du groupe.",
    ],
    severe: [
      "Le conseil met en garde : une mobilisation urgente est nécessaire.",
      "Des efforts impératifs sont attendus pour le prochain trimestre.",
      "Un redressement rapide est indispensable pour éviter le décrochage.",
      "La situation nécessite une prise de conscience collective immédiate.",
      "Les familles sont invitées à renforcer le suivi du travail personnel.",
    ],
    neutre: [
      "Le conseil attend une régularité accrue dans l'investissement.",
      "Les axes d'amélioration identifiés doivent faire l'objet d'un suivi.",
      "La progression du groupe dépendra de l'implication de chacun.",
      "Les enseignants restent mobilisés pour accompagner la classe.",
    ],
  },
};

/**
 * ═══════════════════════════════════════════════════════════
 * VALIDATION - Pre-flight checks
 * ═══════════════════════════════════════════════════════════
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateAppreciation(text: string, minLength: number, maxLength: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✓ Length check
  if (text.length < minLength) {
    errors.push(`Trop court : ${text.length}/${minLength} caractères minimum requis`);
  }
  if (text.length > maxLength) {
    warnings.push(`Dépassement : ${text.length}/${maxLength} caractères (troncature appliquée)`);
  }

  // ✓ Grade patterns check (moyennes chiffrées)
  const gradePatterns = [
    { regex: /\b\d{1,2}[,\.]\d{1,2}\s*(?:\/\s*20)?\b/g, desc: "Note décimale" },
    { regex: /\b\d{1,2}\s*\/\s*20\b/g, desc: "Note sur 20" },
    { regex: /\bmoyenne\s+(?:de\s+)?\d+[,\.]?\d*\b/gi, desc: "Moyenne chiffrée" },
    { regex: /\bde\s+\d{1,2}[,\.]?\d*\b/g, desc: "Référence numérique" },
  ];

  gradePatterns.forEach(({ regex, desc }) => {
    const matches = text.match(regex);
    if (matches) {
      errors.push(`${desc} détectée : "${matches[0]}"`);
    }
  });

  // ✓ Teacher name check (universal patterns)
  const teacherPatterns = [
    { regex: /\b(?:M\.|Mme|Mlle)\s+[A-ZÀ-Ü][-A-ZÀ-Ü\s]+\b/g, desc: "Titre + Nom (M./Mme)" },
    { regex: /\b[A-ZÀ-Ü]{2,}(?:\s+[A-ZÀ-Ü]{2,})+\b/g, desc: "Nom en MAJUSCULES" },
    { regex: /\b(?:selon|pour|notamment|avec)\s+(?:M\.|Mme|Mlle)/gi, desc: "Référence à un prof" },
  ];

  teacherPatterns.forEach(({ regex, desc }) => {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      // Filter out false positives for uppercase pattern
      const filtered = desc.includes("MAJUSCULES")
        ? matches.filter((m) => !["FRANCE", "PARIS", "BULLETIN", "TRIMESTRE"].some((fp) => m.includes(fp)))
        : matches;

      if (filtered.length > 0) {
        errors.push(`${desc} détecté(e) : "${filtered[0]}"`);
      }
    }
  });

  // ✓ Class name check
  const classPatterns = [/\b(?:la|cette)\s+classe\s+de\s+\d+[eè](?:me)?\b/gi, /\bla\s+\d+[eè](?:me)?\d*\b/gi];

  classPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      errors.push(`Nom de classe détecté : "${matches[0]}"`);
    }
  });

  // ✓ Quality checks
  if (text.split(".").length < 2) {
    warnings.push("Structure trop courte : au moins 2 phrases recommandées");
  }

  const repetitions = text.match(/\b(\w{5,})\s+\1\b/gi);
  if (repetitions) {
    warnings.push(`Répétition détectée : "${repetitions[0]}"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * ═══════════════════════════════════════════════════════════
 * TRUNCATION - Intelligent text trimming
 * ═══════════════════════════════════════════════════════════
 */
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  console.log(`⚠️ Troncature nécessaire : ${text.length} → ${maxLength} caractères`);

  // Strategy 1: Cut at last complete sentence
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastExclamation = truncated.lastIndexOf("!");
  const bestCut = Math.max(lastPeriod, lastExclamation);

  if (bestCut > maxLength * 0.85) {
    return text.substring(0, bestCut + 1).trim();
  }

  // Strategy 2: Cut at last space + add period
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.9) {
    return text.substring(0, lastSpace).trim() + ".";
  }

  // Strategy 3: Brutal cut with ellipsis
  return text.substring(0, maxLength - 3).trim() + "...";
}

/**
 * ═══════════════════════════════════════════════════════════
 * CLEANUP - Remove forbidden content
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Remove teacher names using universal patterns (works for any school)
 * Detects: "M. LASTNAME", "Mme LASTNAME", "selon M. X", etc.
 */
function removeTeacherReferences(text: string, providedNames?: string[]): string {
  let result = text;
  const removedPatterns: string[] = [];

  // If frontend provided specific teacher names from PDF, remove them first
  if (providedNames && providedNames.length > 0) {
    providedNames.forEach((name) => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const patterns = [
        new RegExp(`\\b(?:M\\.|Mme|Mlle)\\.?\\s*${escapedName}\\b`, "gi"),
        new RegExp(`\\b${escapedName}\\b`, "gi"),
      ];

      patterns.forEach((regex) => {
        if (regex.test(result)) {
          removedPatterns.push(name);
          result = result.replace(regex, "");
        }
      });
    });
  }

  // UNIVERSAL PATTERN 1: "M./Mme/Mlle + UPPERCASE NAME(S)"
  // Matches: "M. ROBINEAU", "Mme KASSA BEGHDOUCHE", "Mlle DUPONT-MARTIN"
  const pattern1 = /\b(?:M\.|Mme|Mlle)\s+[A-ZÀ-ÜØÆŒß][-A-ZÀ-ÜØÆŒß\s]+\b/g;
  const matches1 = result.match(pattern1);
  if (matches1) {
    matches1.forEach((match) => removedPatterns.push(match));
    result = result.replace(pattern1, "");
    console.warn(`🚫 Titre + Nom détecté et supprimé : ${matches1.join(", ")}`);
  }

  // UNIVERSAL PATTERN 2: "selon/pour/notamment/avec + M./Mme + NAME"
  const pattern2 = /\b(?:selon|pour|notamment|avec|chez|d'après)\s+(?:M\.|Mme|Mlle)\s+[A-ZÀ-ÜØÆŒß][-A-ZÀ-ÜØÆŒß\s]+\b/gi;
  const matches2 = result.match(pattern2);
  if (matches2) {
    matches2.forEach((match) => removedPatterns.push(match));
    result = result.replace(pattern2, "");
    console.warn(`🚫 Référence à un prof détectée et supprimée : ${matches2.join(", ")}`);
  }

  // UNIVERSAL PATTERN 3: Full UPPERCASE names (2+ words, likely teacher names)
  // Matches: "KASSA BEGHDOUCHE", "LE MOIGNE", "DUPONT MARTIN"
  // But excludes: single words, common abbreviations
  const pattern3 = /\b[A-ZÀ-ÜØÆŒß]{2,}(?:\s+[A-ZÀ-ÜØÆŒß]{2,})+\b/g;
  const matches3 = result.match(pattern3);
  if (matches3) {
    // Filter out common false positives (country names, abbreviations, etc.)
    const falsePositives = ["FRANCE", "PARIS", "EDUCATION NATIONALE", "BULLETIN", "TRIMESTRE"];
    const realNames = matches3.filter(
      (match) => !falsePositives.some((fp) => match.includes(fp)) && match.length > 4 && match.length < 40,
    );

    if (realNames.length > 0) {
      realNames.forEach((match) => removedPatterns.push(match));
      realNames.forEach((name) => {
        const regex = new RegExp(`\\b${name}\\b`, "g");
        result = result.replace(regex, "");
      });
      console.warn(`🚫 Nom(s) en majuscules détecté(s) et supprimé(s) : ${realNames.join(", ")}`);
    }
  }

  // UNIVERSAL PATTERN 4: "le/la professeur de X", "l'enseignant(e) de Y"
  const pattern4 = /\b(?:le|la|l')\s*(?:professeur|enseignant)(?:e)?\s+(?:de\s+)?[A-ZÀ-Ü][-a-zà-üA-ZÀ-Ü\s]+\b/gi;
  const matches4 = result.match(pattern4);
  if (matches4) {
    result = result.replace(pattern4, "");
    console.warn(`🚫 Référence "le professeur de X" détectée et supprimée`);
  }

  // Clean up double spaces and orphan punctuation
  result = result.replace(/\s+/g, " ");
  result = result.replace(/,\s*,/g, ",");
  result = result.replace(/\s+\./g, ".");
  result = result.replace(/\s+,/g, ",");
  result = result.replace(/\.\s*\./g, ".");

  if (removedPatterns.length > 0) {
    console.log(`✅ Total de références supprimées : ${removedPatterns.length}`);
  }

  return result.trim();
}

function removeGradesAndClassNames(text: string): string {
  let result = text;

  // Remove numerical grades/averages
  const gradePatterns = [
    /\b\d{1,2}[,\.]\d{1,2}\s*(?:\/\s*20)?\b/g,
    /\b\d{1,2}\s*\/\s*20\b/g,
    /\bmoyenne\s+(?:de\s+)?\d+[,\.]?\d*\b/gi,
    /\bavec\s+une\s+moyenne\s+de\s+\d+[,\.]?\d*\b/gi,
    /\bune\s+moyenne\s+de\s+\d+[,\.]?\d*\b/gi,
    /\bde\s+\d{1,2}[,\.]?\d*\s*(?:\/\s*20)?\b/g,
    /\b\d{1,2}\s*points?\b/gi,
    /\b\d{2,3}\s*%/g,
    /\b\d{1,2}\s*,\s*\d{1,2}\b/g,
  ];

  gradePatterns.forEach((pattern) => {
    const matches = result.match(pattern);
    if (matches) {
      console.warn(`🚫 Moyenne/chiffre détecté et supprimé : ${matches[0]}`);
      result = result.replace(pattern, "");
    }
  });

  // Remove class name mentions
  const classNamePatterns = [
    /\bla\s+classe\s+de\s+\d+[eè](?:me)?\d*\b/gi,
    /\bcette\s+classe\s+de\s+\d+[eè](?:me)?\b/gi,
    /\bles\s+élèves\s+de\s+\d+[eè](?:me)?\b/gi,
    /\bla\s+\d+[eè](?:me)?\d*\b/gi,
    /\b(?:classe|élèves)\s+de\s+\d+[A-Z]+\b/gi,
  ];

  classNamePatterns.forEach((pattern) => {
    const matches = result.match(pattern);
    if (matches) {
      console.warn(`🚫 Nom de classe détecté et supprimé : ${matches[0]}`);
      result = result.replace(pattern, "");
    }
  });

  // Clean up orphan spaces
  result = result.replace(/\s+/g, " ").trim();
  result = result.replace(/\s+\./g, ".");
  result = result.replace(/\s+,/g, ",");

  return result;
}

/**
 * ═══════════════════════════════════════════════════════════
 * THEME ANALYSIS - Enhanced pattern detection
 * ═══════════════════════════════════════════════════════════
 */
function buildThemeContext(themes: Record<string, number>): string {
  const observations: string[] = [];
  const totalThemes = Object.values(themes).reduce((sum, val) => sum + val, 0);

  // Si aucun thème détecté
  if (totalThemes === 0) {
    return "Aucune observation particulière transmise par les enseignants.";
  }

  // ═══ RÉSULTATS SCOLAIRES ═══
  if (themes.solide > themes.fragile * 1.5) {
    observations.push("Les résultats sont globalement satisfaisants selon la majorité des enseignants");
  } else if (themes.fragile > themes.solide * 1.5) {
    observations.push("Les résultats sont fragiles avec des difficultés signalées dans plusieurs disciplines");
  } else if (themes.solide > 0 && themes.fragile > 0) {
    observations.push("Les résultats sont corrects mais inégaux selon les matières");
  } else if (themes.solide > 0) {
    observations.push("Les résultats sont corrects");
  } else if (themes.fragile > 0) {
    observations.push("Les résultats sont préoccupants dans plusieurs disciplines");
  }

  // HÉTÉROGÉNÉITÉ (écarts entre élèves)
  if (themes.heterogene >= 4) {
    observations.push(
      "🚨 Hétérogénéité TRÈS MARQUÉE - écarts importants entre élèves signalés par de nombreux professeurs",
    );
  } else if (themes.heterogene >= 2) {
    observations.push("Disparités entre élèves observées dans plusieurs matières");
  } else if (themes.heterogene >= 1) {
    observations.push("Quelques écarts de niveau constatés");
  }

  // PROGRESSION
  if (themes.progressif >= 3) {
    observations.push("Progression observée et encouragée par plusieurs enseignants");
  } else if (themes.progressif >= 1) {
    observations.push("Des progrès sont constatés");
  }

  // ═══ AMBIANCE DE TRAVAIL ═══

  // SÉRIEUX
  if (themes.serieux >= 4) {
    observations.push("Classe décrite comme sérieuse et appliquée par la plupart des professeurs");
  } else if (themes.serieux >= 2) {
    observations.push("Travail globalement sérieux");
  }

  // BAVARDAGES (hiérarchisé par gravité)
  if (themes.bavardages >= 5) {
    observations.push("🚨 BAVARDAGES GÉNÉRALISÉS - climat de travail TRÈS dégradé selon presque tous les enseignants");
  } else if (themes.bavardages >= 3) {
    observations.push("Bavardages perturbateurs mentionnés par plusieurs professeurs - ambiance de travail difficile");
  } else if (themes.bavardages >= 2) {
    observations.push("Bavardages signalés perturbant ponctuellement les apprentissages");
  }

  // PARTICIPATION
  if (themes.participation >= 3) {
    if (themes.passif >= 2) {
      observations.push("Participation décrite comme timide ou insuffisante malgré les sollicitations");
    } else {
      observations.push("Participation active et engagement oral soulignés");
    }
  } else if (themes.passif >= 4) {
    observations.push("🚨 PASSIVITÉ GÉNÉRALISÉE - manque d'engagement oral préoccupant dans la majorité des cours");
  } else if (themes.passif >= 2) {
    observations.push("Une partie des élèves reste en retrait et participe peu");
  } else if (themes.passif >= 1) {
    observations.push("Quelques élèves gagneraient à s'impliquer davantage à l'oral");
  }

  // CONCENTRATION
  if (themes.concentration >= 3) {
    observations.push("Bonne concentration et attention notées en classe");
  }

  // TRAVAIL PERSONNEL (hiérarchisé)
  if (themes.travail >= 5) {
    observations.push(
      "🚨 Travail personnel TRÈS insuffisant signalé par de nombreux enseignants - manque flagrant d'investissement hors classe",
    );
  } else if (themes.travail >= 3) {
    observations.push(
      "Travail personnel insuffisant signalé par plusieurs enseignants - révisions et devoirs négligés",
    );
  } else if (themes.travail >= 2) {
    observations.push("Travail personnel à renforcer dans certaines matières");
  } else if (themes.travail >= 1) {
    observations.push("Le travail à la maison doit être plus régulier");
  }

  // INVESTISSEMENT
  if (themes.investissement >= 3) {
    observations.push("Investissement satisfaisant dans les tâches proposées");
  }

  // === RELATIONS ET CLIMAT ===

  // NE mentionner "bonne ambiance" QUE si c'est MAJORITAIRE
  // ET qu'il n'y a PAS de problèmes comportementaux graves
  if (themes.bonneAmbiance >= 5 && themes.bavardages < 3 && themes.difficile < 3) {
    observations.push("Bonne ambiance de classe et climat serein mentionnés");
  } else if (themes.bonneAmbiance >= 3 && themes.bavardages < 5 && themes.difficile < 5) {
    observations.push("Quelques cours se déroulent dans une ambiance agréable");
  }
  // Sinon, ne pas mentionner "agréable" du tout !

  if (themes.cohesion >= 2) {
    observations.push("Cohésion du groupe et entraide observées");
  }

  if (themes.tensions >= 2) {
    observations.push("Tensions relationnelles à surveiller - quelques conflits signalés");
  }

  if (themes.respect >= 3) {
    observations.push("Relations respectueuses et bienveillantes entre élèves");
  }

  // ═══ POINTS D'ATTENTION ═══

  // ABSENCES
  if (themes.absences >= 4) {
    observations.push("🚨 Absentéisme préoccupant signalé - impact négatif sur les apprentissages");
  } else if (themes.absences >= 2) {
    observations.push("Absences répétées à surveiller dans plusieurs matières");
  }

  // RETARDS
  if (themes.retards >= 3) {
    observations.push("Problèmes de ponctualité relevés par plusieurs enseignants");
  } else if (themes.retards >= 2) {
    observations.push("Quelques retards perturbent le bon déroulement des cours");
  }

  // COMPORTEMENT (hiérarchisé)
  if (themes.comportement >= 5) {
    observations.push("🚨 PROBLÈMES DE COMPORTEMENT MAJEURS - difficultés importantes à respecter les règles de base");
  } else if (themes.comportement >= 3) {
    observations.push("Comportement nécessitant une vigilance particulière - rappels fréquents nécessaires");
  } else if (themes.comportement >= 2) {
    observations.push("Comportement globalement correct mais à surveiller");
  }

  // Si aucune observation n'a été ajoutée
  if (observations.length === 0) {
    return "Profil de classe standard sans points d'alerte particuliers.";
  }

  return observations.join(".\n") + ".";
}

/**
 * ═══════════════════════════════════════════════════════════
 * MAIN HANDLER
 * ═══════════════════════════════════════════════════════════
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ═══ PARSE REQUEST ═══
    // Note: No authentication required - this app processes data 100% client-side for GDPR compliance
    const {
      classData,
      themes,
      exceptionalSubjects,
      tone: rawTone = "standard",
      maxCharacters = 255,
      teacherNames = [], // Optional: teacher names extracted from PDF by frontend
    } = await req.json();

    // Migrate old tones to new system
    const migrateTone = (t: string): AppreciationTone => {
      const migration: Record<string, AppreciationTone> = {
        ferme: "severe",
        neutre: "standard",
        bienveillant: "encourageant",
        constructif: "standard",
        caring: "encourageant",
        praising: "elogieux",
      };
      return migration[t] || (t as AppreciationTone) || "standard";
    };

    const tone = migrateTone(rawTone);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ═══ BUILD CONTEXT ═══
    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;
    const themeContext = buildThemeContext(themes || {});

    // Build exceptional subjects context
    let exceptionalContext = "";
    if (exceptionalSubjects?.exceptional?.length > 0) {
      exceptionalContext += `\n📈 Matière(s) où la classe excelle : ${exceptionalSubjects.exceptional.join(", ")}`;
    }
    if (exceptionalSubjects?.struggling?.length > 0) {
      exceptionalContext += `\n📉 Matière(s) en difficulté marquée : ${exceptionalSubjects.struggling.join(", ")}`;
    }

    // Determine format
    const isShortFormat = maxCharacters <= 280;
    const minCharacters = Math.floor(maxCharacters * 0.85);

    // ═══ BUILD PROMPTS ═══
    const systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation générale de classe pour le bulletin du conseil de classe français.

═══════════════════════════════════════════════════════════
🎯 OBJECTIF PRINCIPAL
═══════════════════════════════════════════════════════════
Synthétiser la dynamique globale de la classe en t'appuyant EXCLUSIVEMENT sur les observations des enseignants. L'appréciation sera lue par les parents et l'administration.

═══════════════════════════════════════════════════════════
⚠️ CONTRAINTES DE LONGUEUR CRITIQUES
═══════════════════════════════════════════════════════════
• MINIMUM ABSOLU : ${minCharacters} caractères
• MAXIMUM ABSOLU : ${maxCharacters} caractères
• Tu DOIS produire un texte entre ${minCharacters} et ${maxCharacters} caractères

═══════════════════════════════════════════════════════════
📐 ARCHITECTURE DU TEXTE
═══════════════════════════════════════════════════════════

${
  isShortFormat
    ? `
🎯 FORMAT COURT (≤280 caractères) - STRUCTURE DENSE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Phrase 1 : Caractérisation globale (ex: "Classe hétérogène...")
• Phrase 2 : 1-2 points saillants (travail, comportement OU participation)
• Phrase 3 : Perspective rapide (encouragement/alerte)

⚠️ Évite les énumérations longues - VA À L'ESSENTIEL.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    : `
🎯 FORMAT DÉVELOPPÉ (>280 caractères) - STRUCTURE COMPLÈTE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
§ PARAGRAPHE 1 - CARACTÉRISATION (2 phrases, ~80-100 car.) :
  → Ambiance générale de classe
  → Profil du groupe (hétérogène, dynamique, investi, etc.)

§ PARAGRAPHE 2 - ANALYSE DÉTAILLÉE (3-4 phrases, ~${Math.floor(maxCharacters * 0.6)} car.) :
  → Travail personnel et investissement
  → Comportement et participation orale
  → Points forts/faibles selon disciplines SI PERTINENT
  → Assiduité ou ponctualité SI SIGNIFICATIF
  
§ PARAGRAPHE 3 - PERSPECTIVES (1-2 phrases, ~60-80 car.) :
  → Attentes du conseil pour le trimestre suivant
  → Encouragements OU alertes selon la situation

⚠️ TU DOIS REMPLIR L'ESPACE : ${minCharacters}-${maxCharacters} caractères !
⚠️ DÉVELOPPE chaque point avec PRÉCISION et EXEMPLES CONCRETS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
}

═══════════════════════════════════════════════════════════
📚 EXEMPLES DE FORMULATIONS NATURELLES
═══════════════════════════════════════════════════════════

🟢 OUVERTURES POSITIVES :
${FORMULATION_EXAMPLES.ouverture.positive.map((ex) => `• "${ex}"`).join("\n")}

🟡 OUVERTURES NUANCÉES :
${FORMULATION_EXAMPLES.ouverture.nuancee.map((ex) => `• "${ex}"`).join("\n")}

🔴 OUVERTURES CRITIQUES (mais constructives) :
${FORMULATION_EXAMPLES.ouverture.critique.map((ex) => `• "${ex}"`).join("\n")}

💼 DÉVELOPPEMENT - TRAVAIL :
${FORMULATION_EXAMPLES.developpement.travail
  .slice(0, 3)
  .map((ex) => `• "${ex}"`)
  .join("\n")}

👥 DÉVELOPPEMENT - COMPORTEMENT :
${FORMULATION_EXAMPLES.developpement.comportement
  .slice(0, 3)
  .map((ex) => `• "${ex}"`)
  .join("\n")}

🗣️ DÉVELOPPEMENT - PARTICIPATION :
${FORMULATION_EXAMPLES.developpement.participation
  .slice(0, 3)
  .map((ex) => `• "${ex}"`)
  .join("\n")}

═══════════════════════════════════════════════════════════
🚫 INTERDICTIONS ABSOLUES (violation = échec total)
═══════════════════════════════════════════════════════════

❌ INTERDICTION N°1 - AUCUN NOM DE PERSONNE :
   
   Professeurs :
   • JAMAIS "M. ROBINEAU", "Mme KARBOWY", "selon M. X"
   • JAMAIS "le professeur de mathématiques", "l'enseignant de français"
   • JAMAIS "pour M. X", "notamment Mme Y", "d'après M. Z"
   • JAMAIS de noms complets même sans titre : "DUPONT", "MARTIN"
   
   Élèves :
   • JAMAIS de prénoms : "Nelwin", "Marie", "Thomas"
   • JAMAIS "certains élèves comme X", "à l'exception de Y"
   
   ✅ FORMULATIONS ALTERNATIVES OBLIGATOIRES :
   • "Les enseignants constatent..."
   • "Plusieurs professeurs signalent..."
   • "L'équipe pédagogique observe..."
   • "Dans la plupart des matières..."
   • "Certains cours révèlent..."

❌ INTERDICTION N°2 - AUCUN CHIFFRE :
   • JAMAIS de moyenne ("moyenne de 14", "11.5", "12/20", "X/20")
   • JAMAIS de pourcentages ("60% des élèves")
   • JAMAIS de statistiques numériques
   ✅ Raison : LA MOYENNE EST DÉJÀ VISIBLE DANS LE BULLETIN

❌ INTERDICTION N°3 - AUCUN NOM DE CLASSE :
   • JAMAIS le nom ou niveau ("La classe de 3ème", "La 5e3", "Les 4èmes")
   • ✅ Utilise "La classe", "Le groupe", "Les élèves"

❌ FORMULES STÉRÉOTYPÉES À ÉVITER :
   • "Dans l'ensemble" (répétitif)
   • "Il faudrait que" (trop distant)

⚠️ SI TU TE SURPRENDS À VOULOIR ÉCRIRE UN NOM, ARRÊTE ET REFORMULE !
Ces interdictions sont ABSOLUES - AUCUNE EXCEPTION POSSIBLE.

═══════════════════════════════════════════════════════════
✅ OBLIGATIONS STRICTES
═══════════════════════════════════════════════════════════
• Vocabulaire 100% QUALITATIF : "agréable", "sérieuse", "hétérogène", "dynamique", "timide", "investi", "fragile", "préoccupant"
• Base-toi UNIQUEMENT sur les thèmes fournis (bavardages, sérieux, participation, absences, etc.)
• Mentionne les matières fortes et faibles QUALITATIVEMENT si pertinent ("les sciences expérimentales", "les matières littéraires", etc.)
• Longueur entre ${minCharacters} et ${maxCharacters} caractères - IMPÉRATIF

═══════════════════════════════════════════════════════════
🎭 TONALITÉ À ADOPTER
═══════════════════════════════════════════════════════════
${toneInstruction}

═══════════════════════════════════════════════════════════
📝 EXEMPLE CONFORME (${minCharacters}-${maxCharacters} car.)
═══════════════════════════════════════════════════════════
${
  isShortFormat
    ? `
"Classe agréable et sérieuse dans l'ensemble. Les bavardages restent à maîtriser pour une meilleure concentration. Le conseil encourage à poursuivre les efforts engagés."
`
    : `
"Classe hétérogène avec des profils très différents. Le groupe montre un investissement variable selon les disciplines : les matières artistiques et sportives suscitent un réel enthousiasme tandis que l'engagement reste timide en sciences et en langues. Les bavardages perturbent parfois l'ambiance de travail et une partie des élèves manque de rigueur dans le travail personnel. L'assiduité est globalement satisfaisante. Le conseil attend une mobilisation plus régulière et une meilleure concentration pour progresser collectivement au trimestre suivant."
`
}`;

    const userPrompt = `Rédige l'appréciation générale pour le bulletin du conseil de classe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RAPPEL CRITIQUE - LONGUEUR OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entre ${minCharacters} et ${maxCharacters} caractères !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DONNÉES D'ANALYSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${themeContext}
${
  exceptionalContext
    ? `
🎯 MATIÈRES PARTICULIÈRES :${exceptionalContext}
`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CHECKLIST PRÉ-RÉDACTION (vérifie mentalement) :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✓ Longueur entre ${minCharacters} et ${maxCharacters} caractères
2. ✓ ZÉRO chiffre (pas de 14, 12/20, moyenne de X)
3. ✓ ZÉRO nom (prof, élève, classe)
4. ✓ Formulation naturelle et variée
5. ✓ Tonalité ${tone} respectée
6. ✓ Matières exceptionnelles mentionnées qualitativement SI PERTINENT
7. ✓ Structure ${isShortFormat ? "COURTE (2-3 phrases)" : "DÉVELOPPÉE (5-7 phrases)"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 GÉNÈRE MAINTENANT (${minCharacters}-${maxCharacters} car.) :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    // ═══ CALL AI GATEWAY ═══
    console.log(
      `🤖 Génération avec Gemini 2.5 Flash - Tonalité: ${tone} - Longueur: ${minCharacters}-${maxCharacters}`,
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Veuillez patienter quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI épuisés. Veuillez réessayer plus tard." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let appreciation = data.choices?.[0]?.message?.content || "";

    // ═══ CLEANUP PHASE ═══
    appreciation = appreciation.trim();

    console.log(`📝 Appréciation brute générée : ${appreciation.length} caractères`);

    // Remove forbidden content (universal detection + optional provided names)
    appreciation = removeTeacherReferences(appreciation, teacherNames);
    appreciation = removeGradesAndClassNames(appreciation);

    // ═══ VALIDATION ═══
    const validation = validateAppreciation(appreciation, minCharacters, maxCharacters);

    if (!validation.isValid) {
      console.error("❌ Validation échouée :", validation.errors);
      // Log errors but continue - cleanup should have fixed most issues
      validation.errors.forEach((error) => console.warn(`⚠️ ${error}`));
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => console.warn(`⚠️ ${warning}`));
    }

    // ═══ ENFORCE LENGTH ═══
    if (appreciation.length > maxCharacters) {
      console.warn(`⚠️ Dépassement détecté : ${appreciation.length}/${maxCharacters} caractères`);
      appreciation = truncateIntelligently(appreciation, maxCharacters);
      console.log(`✂️ Après troncature : ${appreciation.length} caractères`);
    }

    console.log(
      `✅ Appréciation finale : ${appreciation.length} caractères (objectif: ${minCharacters}-${maxCharacters})`,
    );

    return new Response(
      JSON.stringify({
        appreciation,
        characterCount: appreciation.length,
        maxCharacters,
        minCharacters,
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
