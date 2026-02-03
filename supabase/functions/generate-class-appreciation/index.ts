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

// Helper function to truncate intelligently
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const bestCut = Math.max(lastPeriod, lastExclamation);
  
  if (bestCut > maxLength * 0.7) {
    return truncated.substring(0, bestCut + 1);
  }
  
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '.';
  }
  
  return truncated.substring(0, maxLength - 3) + '...';
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
      maxWords = 200 
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
    
    // Build theme analysis context
    const buildThemeContext = (themes: Record<string, number>) => {
      const parts: string[] = [];
      
      // Academic
      if (themes.solide > themes.fragile) parts.push("Résultats globalement satisfaisants");
      else if (themes.fragile > themes.solide) parts.push("Résultats fragiles, difficultés scolaires");
      else parts.push("Résultats corrects");
      
      if (themes.heterogene >= 3) parts.push("Forte hétérogénéité entre élèves");
      if (themes.progressif >= 2) parts.push("Progression observée");
      
      // Work atmosphere
      if (themes.serieux >= 3) parts.push("Classe sérieuse et appliquée");
      if (themes.bavardages >= 3) parts.push("Bavardages perturbateurs fréquents");
      if (themes.participation >= 2) {
        if (themes.passif >= 2) parts.push("Participation timide");
        else parts.push("Participation active");
      }
      if (themes.concentration >= 2) parts.push("Bonne concentration");
      if (themes.investissement >= 2) parts.push("Investissement satisfaisant");
      if (themes.passif >= 3) parts.push("Passivité de certains élèves");
      if (themes.travail >= 2) parts.push("Travail personnel insuffisant");
      
      // Relations
      if (themes.bonneAmbiance >= 2) parts.push("Bonne ambiance de classe");
      if (themes.cohesion >= 2) parts.push("Cohésion de groupe");
      if (themes.tensions >= 2) parts.push("Tensions relationnelles");
      if (themes.respect >= 2) parts.push("Relations respectueuses");
      
      // Attention points
      if (themes.absences >= 3) parts.push("Absentéisme préoccupant");
      if (themes.retards >= 3) parts.push("Problèmes de ponctualité");
      if (themes.comportement >= 3) parts.push("Comportement à surveiller");
      
      return parts.join(". ") + ".";
    };

    const systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation de classe pour un bulletin du conseil de classe français.

OBJECTIF : Produire une appréciation de 150-${maxWords} mots (environ 8-12 phrases) structurée en 3 paragraphes.

STRUCTURE OBLIGATOIRE :
1. RÉSULTATS SCOLAIRES (2-3 phrases) : Tendance générale, hétérogénéité si pertinente, matières exceptionnelles si écart significatif.
2. AMBIANCE DE TRAVAIL (2-3 phrases) : Sérieux, concentration, participation, comportements perturbateurs si mentionnés.
3. CLIMAT ET PERSPECTIVES (2-3 phrases) : Relations entre élèves, points d'attention, encouragement ou attentes.

RÈGLES STRICTES - À RESPECTER ABSOLUMENT :
❌ JAMAIS de moyennes chiffrées (pas de "11,61/20", "moyenne de 12", etc.)
❌ JAMAIS de noms de professeurs (pas de "M. Dupont signale...")
❌ JAMAIS de liste exhaustive de matières
❌ JAMAIS mentionner le nombre exact d'élèves
✅ Formulations qualitatives uniquement ("satisfaisants", "en progression", "fragiles")
✅ Mentionner une matière SEULEMENT si écart ≥ 4 points vs moyenne générale
✅ Vocabulaire professionnel et institutionnel
✅ Séparer les 3 paragraphes par des sauts de ligne

TONALITÉ :
${toneInstruction}

EXEMPLES DE FORMULATIONS CORRECTES :
- "La classe présente globalement des résultats satisfaisants"
- "L'ambiance de travail est perturbée par des bavardages"
- "La participation reste timide et gagnerait à être encouragée"
- "Le climat relationnel est positif"
- "Des efforts soutenus sont attendus pour le prochain trimestre"`;

    const themeContext = buildThemeContext(themes || {});
    
    let exceptionalContext = "";
    if (exceptionalSubjects?.exceptional?.length > 0) {
      exceptionalContext += `\n- Matière exceptionnellement forte : ${exceptionalSubjects.exceptional[0]}`;
    }
    if (exceptionalSubjects?.struggling?.length > 0) {
      exceptionalContext += `\n- Matière en difficulté marquée : ${exceptionalSubjects.struggling[0]}`;
    }

    const userPrompt = `Rédige l'appréciation de classe pour :
- Classe : ${classData?.className || "cette classe"}
- Période : ${classData?.period || "ce trimestre"}

ANALYSE THÉMATIQUE (basée sur les observations des enseignants) :
${themeContext}
${exceptionalContext}

Génère une appréciation en 3 paragraphes séparés, sans mentionner de chiffres ni de noms de professeurs.
Longueur cible : 150-${maxWords} mots.`;

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
