import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppreciationTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

const toneInstructions: Record<AppreciationTone, string> = {
  severe: "Adopte un ton SÉVÈRE et DIRECT : constate les difficultés, les lacunes et les problèmes de comportement sans détour. Utilise un vocabulaire ferme : 'insuffisant', 'préoccupant', 'le conseil met en garde', 'des efforts impératifs sont attendus'.",
  standard: "Adopte un ton FACTUEL et OBJECTIF : équilibre entre constats positifs et axes d'amélioration. Formulations institutionnelles : 'globalement satisfaisant', 'des efforts à poursuivre', 'le conseil encourage'.",
  encourageant: "Adopte un ton BIENVEILLANT et MOTIVANT : valorise les efforts, formule les critiques comme des conseils constructifs. Utilise : 'en progression', 'des efforts remarqués', 'le conseil encourage à poursuivre'.",
  elogieux: "Adopte un ton ÉLOGIEUX et ENTHOUSIASTE : célèbre les réussites, félicite la classe. Utilise : 'félicitations', 'excellent', 'remarquable dynamique', 'le conseil salue'."
};

/**
 * List of known teacher names to filter from output
 */
const TEACHER_NAMES = [
  'KARBOWY', 'BONNINGUES', 'ROBINEAU', 'DUROCHER', 'LE MOIGNE',
  'ZOCCANTE', 'KASSA BEGHDOUCHE', 'JAMET', 'POGODA', 'LESPLEQUE',
  'GUILLIEY', 'ZENATI', 'GUISLAIN', 'DUPONT', 'MARTIN', 'BERNARD',
  'PETIT', 'ROBERT', 'RICHARD', 'DURAND', 'LEROY', 'MOREAU'
];

/**
 * Truncate text intelligently to respect character limit
 */
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  console.log(`Troncature nécessaire : ${text.length} → ${maxLength}`);

  // Strategy 1: Cut at last complete sentence
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const bestCut = Math.max(lastPeriod, lastExclamation);

  if (bestCut > maxLength * 0.85) {
    return text.substring(0, bestCut + 1).trim();
  }

  // Strategy 2: Cut at last space + add period
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.90) {
    return text.substring(0, lastSpace).trim() + '.';
  }

  // Strategy 3: Brutal cut with ellipsis
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Remove any teacher names that might appear in the text
 */
function removeTeacherNames(text: string): string {
  let result = text;
  
  TEACHER_NAMES.forEach(name => {
    // Match variations: "M. NAME", "Mme NAME", "NAME", "pour NAME"
    const patterns = [
      new RegExp(`\\bM\\.?\\s*${name}\\b`, 'gi'),
      new RegExp(`\\bMme\\.?\\s*${name}\\b`, 'gi'),
      new RegExp(`\\bpour\\s+${name}\\b`, 'gi'),
      new RegExp(`\\bnotamment\\s+(?:pour\\s+)?${name}\\b`, 'gi'),
      new RegExp(`\\b${name}\\b`, 'gi')
    ];
    
    patterns.forEach(regex => {
      if (regex.test(result)) {
        console.warn(`Nom de professeur détecté et supprimé : ${name}`);
        result = result.replace(regex, '');
      }
    });
  });
  
  // Clean up double spaces and orphan commas
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/\s+\./g, '.');
  result = result.replace(/\s+,/g, ',');
  
  return result.trim();
}

/**
 * Build a rich context from theme analysis
 */
function buildThemeContext(themes: Record<string, number>): string {
  const observations: string[] = [];
  
  // === RÉSULTATS SCOLAIRES ===
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
  
  if (themes.heterogene >= 3) {
    observations.push("Forte hétérogénéité soulignée par plusieurs professeurs");
  } else if (themes.heterogene >= 1) {
    observations.push("Disparités entre élèves observées");
  }
  
  if (themes.progressif >= 3) {
    observations.push("Progression observée par plusieurs enseignants");
  } else if (themes.progressif >= 1) {
    observations.push("Des progrès sont constatés");
  }
  
  // === AMBIANCE DE TRAVAIL ===
  if (themes.serieux >= 4) {
    observations.push("Classe décrite comme sérieuse et appliquée");
  } else if (themes.serieux >= 2) {
    observations.push("Travail globalement sérieux");
  }
  
  if (themes.bavardages >= 4) {
    observations.push("Bavardages perturbateurs mentionnés par plusieurs professeurs - ambiance de travail TRÈS difficile");
  } else if (themes.bavardages >= 2) {
    observations.push("Bavardages signalés perturbant les apprentissages");
  }
  
  if (themes.participation >= 3) {
    if (themes.passif >= 2) {
      observations.push("Participation décrite comme timide ou insuffisante");
    } else {
      observations.push("Participation active soulignée");
    }
  } else if (themes.passif >= 3) {
    observations.push("Passivité IMPORTANTE observée - manque d'implication généralisé");
  } else if (themes.passif >= 1) {
    observations.push("Une partie des élèves est passive ou en retrait");
  }
  
  if (themes.concentration >= 3) {
    observations.push("Bonne concentration notée en classe");
  }
  
  if (themes.travail >= 4) {
    observations.push("Travail personnel TRÈS insuffisant signalé par de nombreux enseignants - manque flagrant d'investissement");
  } else if (themes.travail >= 2) {
    observations.push("Travail personnel insuffisant signalé par plusieurs enseignants");
  } else if (themes.travail >= 1) {
    observations.push("Travail personnel à renforcer");
  }
  
  if (themes.investissement >= 3) {
    observations.push("Investissement satisfaisant dans les tâches");
  }
  
  // === RELATIONS ET CLIMAT ===
  if (themes.bonneAmbiance >= 3) {
    observations.push("Bonne ambiance de classe mentionnée");
  } else if (themes.bonneAmbiance >= 1) {
    observations.push("Ambiance de classe agréable");
  }
  
  if (themes.cohesion >= 2) {
    observations.push("Cohésion du groupe observée");
  }
  
  if (themes.tensions >= 2) {
    observations.push("Tensions relationnelles à surveiller");
  }
  
  if (themes.respect >= 3) {
    observations.push("Relations respectueuses entre élèves");
  }
  
  // === POINTS D'ATTENTION ===
  if (themes.absences >= 4) {
    observations.push("Absentéisme préoccupant signalé");
  } else if (themes.absences >= 2) {
    observations.push("Absences à surveiller");
  }
  
  if (themes.retards >= 4) {
    observations.push("Problèmes de ponctualité relevés");
  } else if (themes.retards >= 2) {
    observations.push("Quelques retards signalés");
  }
  
  if (themes.comportement >= 4) {
    observations.push("Comportement nécessitant une vigilance particulière - difficultés à respecter les règles de base");
  } else if (themes.comportement >= 2) {
    observations.push("Comportement globalement correct mais à surveiller");
  }
  
  return observations.length > 0 
    ? observations.join(".\n") + "."
    : "Pas d'observations particulières dans les appréciations des enseignants.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      classData, 
      themes, 
      exceptionalSubjects, 
      tone: rawTone = 'standard',
      maxCharacters = 255 
    } = await req.json();
    
    // Migrate old tones
    const migrateTone = (t: string): AppreciationTone => {
      const migration: Record<string, AppreciationTone> = {
        'ferme': 'severe',
        'neutre': 'standard',
        'bienveillant': 'encourageant',
        'constructif': 'standard',
        'caring': 'encourageant',
        'praising': 'elogieux'
      };
      return migration[t] || (t as AppreciationTone) || 'standard';
    };
    
    const tone = migrateTone(rawTone);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;
    const themeContext = buildThemeContext(themes || {});
    
    // Build exceptional subjects context (only if significant deviation)
    let exceptionalContext = "";
    if (exceptionalSubjects?.exceptional?.length > 0) {
      exceptionalContext += `\n- Matière exceptionnellement forte : ${exceptionalSubjects.exceptional[0]}`;
    }
    if (exceptionalSubjects?.struggling?.length > 0) {
      exceptionalContext += `\n- Matière en difficulté marquée : ${exceptionalSubjects.struggling[0]}`;
    }

    // Determine if short or long format
    const isShortFormat = maxCharacters <= 280;
    
    // Calculate minimum length (should be at least 85% of max, or previous tier)
    const minCharacters = Math.floor(maxCharacters * 0.85);

    const systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation générale de classe pour le bulletin du conseil de classe français.

CONTRAINTES DE LONGUEUR CRITIQUES :
- MINIMUM ABSOLU : ${minCharacters} caractères
- MAXIMUM ABSOLU : ${maxCharacters} caractères
- Tu DOIS produire un texte entre ${minCharacters} et ${maxCharacters} caractères. Un texte plus court est INACCEPTABLE.

CONTEXTE : Cette appréciation sera lue par les parents et l'administration. Elle doit synthétiser fidèlement les observations des professeurs.

${isShortFormat ? `
STRUCTURE COURTE (≤280 caractères) :
- 2-3 phrases courtes mais complètes
- Phrase 1 : Résultats généraux (qualitatif UNIQUEMENT, SANS AUCUN CHIFFRE)
- Phrase 2 : Ambiance de travail / comportement
- Phrase 3 optionnelle : Conclusion/perspective
` : `
STRUCTURE DÉVELOPPÉE (>280 caractères) - OBLIGATOIRE :
- 5-7 phrases pour REMPLIR l'espace disponible (${minCharacters}-${maxCharacters} caractères)
- Paragraphe 1 (2 phrases) : Résultats et tendances - DÉTAILLÉS, vocabulaire riche
- Paragraphe 2 (2-3 phrases) : Ambiance de travail, comportement, participation - DÉVELOPPÉS avec précision
- Paragraphe 3 (1-2 phrases) : Perspectives, attentes et encouragements - COMPLETS
- UTILISE TOUT L'ESPACE : ne t'arrête pas avant ${minCharacters} caractères !
`}

INTERDICTIONS ABSOLUES - TOUTE VIOLATION = ÉCHEC TOTAL :

🚫 ZÉRO CHIFFRE dans le texte :
- JAMAIS "moyenne de 14", "11.5", "12/20", "X/20", "X points"
- JAMAIS "60% des élèves", aucun pourcentage
- JAMAIS aucune statistique numérique

🚫 ZÉRO NOM :
- JAMAIS de noms de professeurs
- JAMAIS de noms d'élèves
- JAMAIS le nom ou niveau de la classe ("La classe de 3ème", "La 5e3", "Les élèves de 4ème")

✅ OBLIGATIONS STRICTES :
- Commencer DIRECTEMENT par : "Les résultats...", "Résultats...", "Le niveau..." ou "L'ensemble..."
- Vocabulaire 100% QUALITATIF : "satisfaisants", "corrects", "fragiles", "en progression", "insuffisants"
- Longueur entre ${minCharacters} et ${maxCharacters} caractères - IMPÉRATIF
- Base-toi UNIQUEMENT sur les thèmes fournis

TONALITÉ : ${toneInstruction}

${isShortFormat ? `
EXEMPLE CONFORME (${minCharacters}-${maxCharacters} car.) :
"Résultats corrects mais fragiles par manque de travail régulier. Les bavardages fréquents et la passivité de nombreux élèves perturbent les apprentissages. Des efforts soutenus sont attendus."
` : `
EXEMPLE CONFORME (${minCharacters}-${maxCharacters} car.) :
"Les résultats sont globalement corrects mais demeurent fragiles en raison d'un manque de travail personnel régulier et d'un investissement insuffisant dans les apprentissages. L'ambiance de travail est préoccupante : les bavardages incessants perturbent le bon déroulement des cours et une partie des élèves reste passive ou en retrait. La participation est trop timide et seule une minorité s'implique véritablement dans les échanges. Des progrès sont néanmoins possibles si chacun prend conscience de ses responsabilités. Le conseil attend une prise de conscience immédiate et des efforts soutenus pour inverser cette tendance négative."
`}`;

    const userPrompt = `Rédige l'appréciation générale pour le bulletin du conseil de classe.

RAPPEL CRITIQUE - LONGUEUR OBLIGATOIRE : entre ${minCharacters} et ${maxCharacters} caractères !

ANALYSE DES APPRÉCIATIONS DES ENSEIGNANTS :
${themeContext}
${exceptionalContext ? `\nMATIÈRES PARTICULIÈRES :${exceptionalContext}\n` : ''}

VÉRIFICATIONS À FAIRE AVANT DE RÉPONDRE :
1. ✓ Le texte fait-il entre ${minCharacters} et ${maxCharacters} caractères ? (OBLIGATOIRE)
2. ✓ Y a-t-il ZÉRO chiffre dans le texte ? (pas de 14, 12/20, moyenne de X)
3. ✓ Le texte commence-t-il par "Les résultats", "Résultats" ou "Le niveau" ? (pas par "La classe")
4. ✓ Aucun nom de professeur ni d'élève ?

${isShortFormat ? 'FORMAT COURT : 2-3 phrases denses.' : `FORMAT DÉVELOPPÉ : 5-7 phrases pour atteindre ${minCharacters} caractères minimum !`}

Génère maintenant l'appréciation (${minCharacters}-${maxCharacters} caractères, commence par "Les résultats" ou "Résultats") :`;

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
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez patienter quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits AI épuisés. Veuillez réessayer plus tard." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let appreciation = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response
    appreciation = appreciation.trim();
    
    // Remove any teacher names that might have slipped through
    appreciation = removeTeacherNames(appreciation);
    
    // CRITICAL: Remove any numerical grades/averages that might have slipped through
    // Patterns: "11.5", "12/20", "moyenne de 11", "11,5/20", "X points", "de 14", etc.
    const gradePatterns = [
      /\b\d{1,2}[,\.]\d{1,2}\s*(?:\/\s*20)?\b/g,  // 11.5 or 11,5 or 11.5/20
      /\b\d{1,2}\s*\/\s*20\b/g,                     // 12/20
      /\bmoyenne\s+(?:de\s+)?\d+[,\.]?\d*\b/gi,     // moyenne de 11.5
      /\bavec\s+une\s+moyenne\s+de\s+\d+[,\.]?\d*\b/gi, // avec une moyenne de 14
      /\bune\s+moyenne\s+de\s+\d+[,\.]?\d*\b/gi,    // une moyenne de 14
      /\bde\s+\d{1,2}[,\.]?\d*\s*(?:\/\s*20)?\b/g,  // de 14, de 11.5
      /\b\d{1,2}\s*points?\b/gi,                    // 11 points
      /\b\d{2,3}\s*%/g,                             // 60%
      /\b\d{1,2}\s*,\s*\d{1,2}\b/g,                 // 14,5
    ];
    
    gradePatterns.forEach(pattern => {
      if (pattern.test(appreciation)) {
        console.warn(`Moyenne/chiffre détecté et supprimé: ${appreciation.match(pattern)}`);
        appreciation = appreciation.replace(pattern, '');
      }
    });
    
    // Remove class name mentions
    const classNamePatterns = [
      /\bla\s+classe\s+de\s+\d+[eè](?:me)?\d*\b/gi,  // la classe de 3ème, la classe de 5e3
      /\bcette\s+classe\s+de\s+\d+[eè](?:me)?\b/gi,  // cette classe de 3ème
      /\bles\s+élèves\s+de\s+\d+[eè](?:me)?\b/gi,    // les élèves de 3ème
      /\bla\s+\d+[eè](?:me)?\d*\b/gi,                // la 3ème, la 5e3
      /\b(?:classe|élèves)\s+de\s+\d+[A-Z]+\b/gi,    // classe de 4BAY
    ];
    
    classNamePatterns.forEach(pattern => {
      if (pattern.test(appreciation)) {
        console.warn(`Nom de classe détecté et supprimé: ${appreciation.match(pattern)}`);
        appreciation = appreciation.replace(pattern, '');
      }
    });
    
    // Clean up orphan spaces after removals
    appreciation = appreciation.replace(/\s+/g, ' ').trim();
    appreciation = appreciation.replace(/\s+\./g, '.');
    appreciation = appreciation.replace(/\s+,/g, ',');
    
    // Enforce character limit
    if (appreciation.length > maxCharacters) {
      console.warn(`Dépassement détecté : ${appreciation.length}/${maxCharacters} caractères`);
      appreciation = truncateIntelligently(appreciation, maxCharacters);
    }

    return new Response(JSON.stringify({ 
      appreciation,
      characterCount: appreciation.length,
      maxCharacters 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});