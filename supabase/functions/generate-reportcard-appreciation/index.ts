import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppreciationTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

// Migration des anciens tons vers les nouveaux
const migrateTone = (tone: string): AppreciationTone => {
  const migration: Record<string, AppreciationTone> = {
    'ferme': 'severe',
    'neutre': 'standard',
    'bienveillant': 'encourageant',
    'constructif': 'standard',
  };
  return migration[tone] || (tone as AppreciationTone) || 'standard';
};

const toneInstructions: Record<AppreciationTone, string> = {
  severe: "Sois direct et strict sur les problèmes identifiés. Le ton doit être ferme et les attentes clairement exprimées. Mentionne les manquements et exige un ressaisissement. Pas de complaisance.",
  standard: "Adopte un ton FACTUEL et RAISONNÉ. Base ton analyse sur le CROISEMENT OBJECTIF des données disponibles (moyenne, sérieux, participation, absences). L'appréciation doit être équilibrée, professionnelle et refléter fidèlement la réalité de l'élève. Pas de jugement émotionnel, uniquement des constats étayés.",
  encourageant: "Valorise les efforts et les progrès, même modestes. Souligne les points positifs et le potentiel de l'élève. Adopte un ton bienveillant et motivant. Termine sur une perspective positive d'amélioration.",
  elogieux: "Félicite chaleureusement l'élève pour ses excellents résultats. Utilise des superlatifs adaptés (remarquable, brillant, exemplaire). Mets en avant les qualités exceptionnelles. Le ton doit refléter la fierté du professeur.",
};

// Helper to determine work level description from average
function getWorkLevel(average: number | null): string {
  if (average === null) return "non évaluable";
  if (average >= 16) return "excellent";
  if (average >= 14) return "très bon";
  if (average >= 12) return "bon";
  if (average >= 10) return "correct";
  if (average >= 8) return "insuffisant";
  return "très insuffisant";
}

// Intelligent truncation to respect character limit
function truncateIntelligently(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastCut = Math.max(lastPeriod, lastExclamation);
  
  if (lastCut > maxChars * 0.7) {
    return truncated.substring(0, lastCut + 1);
  }
  
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated.substring(0, maxChars - 3) + '...';
}

interface ObservationParMatiere {
  matiere: string;
  comportement: string;
}

interface ComportementRecurrent {
  comportement: string;
  matieres: string[];
}

// Detect behaviors appearing in 2+ subjects
function detecterComportementsRecurrents(observations: ObservationParMatiere[]): ComportementRecurrent[] {
  if (!observations || observations.length === 0) return [];
  
  const groupes: Record<string, string[]> = {};
  observations.forEach((obs) => {
    if (!groupes[obs.comportement]) groupes[obs.comportement] = [];
    if (!groupes[obs.comportement].includes(obs.matiere)) {
      groupes[obs.comportement].push(obs.matiere);
    }
  });
  
  return Object.entries(groupes)
    .filter(([_, matieres]) => matieres.length >= 2)
    .map(([comportement, matieres]) => ({ comportement, matieres }));
}

// Categorize subjects by results
function categoriserResultats(observations: ObservationParMatiere[]): { reussites: string[]; difficultes: string[] } {
  if (!observations || observations.length === 0) return { reussites: [], difficultes: [] };
  
  const reussites = [...new Set(observations.filter(o => o.comportement === "Excellents résultats").map(o => o.matiere))];
  const difficultes = [...new Set(observations.filter(o => o.comportement === "Difficultés importantes").map(o => o.matiere))];
  
  return { reussites, difficultes };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      student, 
      classAverage, 
      subject, 
      trimester, 
      maxCharacters = 400, 
      tone: rawTone = 'standard' 
    } = await req.json();
    
    const tone = migrateTone(rawTone);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { 
      firstName, 
      lastName,
      average, 
      seriousness,
      participation,
      absences,
      nonRendus,
      behaviorIssue,
      isTalkative,
      specificObservations,
      observationsParMatiere = []
    } = student;

    // Calculate target with safety margin
    const targetChars = Math.floor(maxCharacters * 0.85);
    const minChars = Math.floor(maxCharacters * 0.6);
    
    // Get work level description instead of numerical average
    const workLevel = getWorkLevel(average);
    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;

    // Process subject-specific observations
    const comportementsRecurrents = detecterComportementsRecurrents(observationsParMatiere);
    const { reussites, difficultes } = categoriserResultats(observationsParMatiere);
    
    const matieresReussitesStr = reussites.length > 0 ? reussites.join(", ") : "Non spécifié";
    const matieresDifficultesStr = difficultes.length > 0 ? difficultes.join(", ") : "Non spécifié";
    const comportementsRecurrentsStr = comportementsRecurrents.length > 0
      ? comportementsRecurrents.map(c => `${c.comportement} en : ${c.matieres.join(", ")}`).join(" | ")
      : "Aucun signalement";

    // Build enhanced system prompt for bulletin analysis style
    const systemPrompt = `Tu es un professeur principal présentant un élève devant le conseil de classe. Tu dois être PRÉCIS et FACTUEL en mentionnant les matières spécifiques quand tu as cette information.

CONTRAINTE DE LONGUEUR ABSOLUE ET NON NÉGOCIABLE :
- MINIMUM : ${minChars} caractères
- MAXIMUM : ${maxCharacters} caractères  
- CIBLE IDÉALE : ${targetChars} caractères
⚠️ Si ton texte dépasse ${maxCharacters} caractères, il sera REJETÉ.

───────────────────────────────────────────────────
TON À ADOPTER : ${tone}
${toneInstruction}
───────────────────────────────────────────────────

STRUCTURE OBLIGATOIRE DE TA PRÉSENTATION :

1. OUVERTURE (1 phrase)
   Commence TOUJOURS par : "${firstName} obtient [niveau qualitatif] ce trimestre."
   Utilise le niveau "${workLevel}" pour formuler : excellent/très satisfaisant/satisfaisant/correct/insuffisant/préoccupant

2. RÉSULTATS PAR DOMAINE (2-3 phrases)
   - SI matières de réussite spécifiées (${matieresReussitesStr}) : NOMME-les explicitement
     Exemple : "Il/Elle réussit particulièrement en mathématiques et SVT."
   - SI matières en difficulté spécifiées (${matieresDifficultesStr}) : NOMME-les explicitement
     Exemple : "En revanche, des difficultés persistent en français et histoire-géographie."
   - SI aucune matière spécifiée : commente les résultats de manière globale basée sur le niveau de travail

3. ATTITUDE ET COMPORTEMENT (2-3 phrases)
   - Commente le sérieux et la participation globale
   - SI comportements récurrents détectés (2+ matières) : NOMME les matières concernées
     Données disponibles : ${comportementsRecurrentsStr}
     Exemple : "Des bavardages sont régulièrement signalés en anglais et histoire-géographie."
   - SI aucun comportement récurrent : commente l'attitude de manière générale

4. POINTS D'ALERTE (1 phrase si pertinent)
   - Mentionne les absences si > 3
   - Mentionne les devoirs non rendus si > 2

5. CONCLUSION (1 phrase)
   - Conseil concret ou perspective d'amélioration

───────────────────────────────────────────────────

RÈGLES ABSOLUES :
✅ TOUJOURS commencer par le prénom "${firstName}"
✅ TOUJOURS nommer les matières spécifiques QUAND elles sont fournies
✅ TOUJOURS mentionner un comportement dès qu'il apparaît dans 2+ matières
✅ Être factuel et précis, jamais vague
✅ Ton professionnel mais bienveillant
✅ Longueur : ${minChars}-${maxCharacters} caractères

❌ INTERDICTIONS :
❌ Ne JAMAIS mentionner de notes chiffrées (pas de "12/20", "moyenne de 15")
❌ Ne JAMAIS répéter le niveau qualitatif dans le corps du texte
❌ Ne JAMAIS dire "dans l'ensemble", "globalement" SI tu peux nommer des matières précises
❌ Ne JAMAIS inventer de matières non mentionnées dans les données
❌ Ne JAMAIS porter de jugement sur la personnalité de l'élève
❌ Ne JAMAIS mentionner un comportement qui apparaît dans une seule matière sauf si observation spécifique le demande`;

    // Build context with all available data
    let context = `Génère une présentation orale pour le conseil de classe :\n\n`;
    context += `═══════════════════════════════════════════════════\n`;
    context += `DONNÉES DE L'ÉLÈVE :\n`;
    context += `- Prénom : ${firstName}\n`;
    context += `- Nom : ${lastName}\n`;
    context += `- Niveau de travail : ${workLevel}\n`;
    if (seriousness !== null && seriousness !== undefined) {
      context += `- Sérieux global : ${seriousness > 14 ? "très sérieux" : seriousness > 10 ? "sérieux" : seriousness > 6 ? "insuffisant" : "problématique"}\n`;
    }
    if (participation !== null && participation !== undefined) {
      context += `- Participation globale : ${participation > 14 ? "excellente" : participation > 10 ? "satisfaisante" : participation > 6 ? "insuffisante" : "quasi inexistante"}\n`;
    }
    if (absences && absences > 0) context += `- Absences : ${absences}\n`;
    if (nonRendus && nonRendus > 0) context += `- Devoirs non rendus : ${nonRendus}\n`;
    
    context += `\n═══════════════════════════════════════════════════\n`;
    context += `MATIÈRES DE RÉUSSITE :\n${matieresReussitesStr}\n\n`;
    context += `MATIÈRES EN DIFFICULTÉ :\n${matieresDifficultesStr}\n\n`;
    context += `COMPORTEMENTS RÉCURRENTS (2+ matières) :\n${comportementsRecurrentsStr}\n`;
    context += `═══════════════════════════════════════════════════\n\n`;
    
    if (behaviorIssue) {
      context += `⚠️ Problème de comportement signalé : ${typeof behaviorIssue === 'string' ? behaviorIssue : 'oui'}\n`;
    }
    if (isTalkative) context += `⚠️ Signalé comme bavard\n`;
    if (specificObservations && specificObservations.length > 0) {
      context += `📝 Observations personnelles du PP : ${specificObservations.join(", ")}\n`;
    }
    
    context += `\nTon demandé : ${tone}\n`;
    context += `\n⚠️ RAPPEL : Maximum ${maxCharacters} caractères. NE PAS mentionner de notes chiffrées.`;

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
          { role: "user", content: context },
        ],
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
    
    // Post-process: truncate if still too long
    if (appreciation.length > maxCharacters) {
      console.log(`Truncating appreciation from ${appreciation.length} to ${maxCharacters} chars`);
      appreciation = truncateIntelligently(appreciation, maxCharacters);
    }

    return new Response(JSON.stringify({ appreciation }), {
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
