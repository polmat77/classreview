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
    observations.push("Bavardages perturbateurs mentionnés par plusieurs professeurs");
  } else if (themes.bavardages >= 2) {
    observations.push("Quelques bavardages signalés");
  }
  
  if (themes.participation >= 3) {
    if (themes.passif >= 2) {
      observations.push("Participation décrite comme timide ou insuffisante");
    } else {
      observations.push("Participation active soulignée");
    }
  } else if (themes.passif >= 3) {
    observations.push("Passivité observée chez certains élèves");
  }
  
  if (themes.concentration >= 3) {
    observations.push("Bonne concentration notée en classe");
  }
  
  if (themes.travail >= 3) {
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
    observations.push("Comportement nécessitant une vigilance particulière");
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
    const themeContext = buildThemeContext(themes || {});
    
    // Build exceptional subjects context (only if significant deviation)
    let exceptionalContext = "";
    if (exceptionalSubjects?.exceptional?.length > 0) {
      exceptionalContext += `\n- Matière exceptionnellement forte : ${exceptionalSubjects.exceptional[0]}`;
    }
    if (exceptionalSubjects?.struggling?.length > 0) {
      exceptionalContext += `\n- Matière en difficulté marquée : ${exceptionalSubjects.struggling[0]}`;
    }

    const systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation générale de classe pour le bulletin du conseil de classe français.

CONTEXTE : Cette appréciation sera lue par les parents et l'administration. Elle doit synthétiser les observations de TOUS les professeurs de la classe.

OBJECTIF : Produire une appréciation de 150-${maxWords} mots (environ 8-12 phrases) structurée en 3 paragraphes distincts.

STRUCTURE OBLIGATOIRE :

**Paragraphe 1 - RÉSULTATS SCOLAIRES (2-3 phrases)**
- Tendance générale des résultats (satisfaisants / corrects / fragiles / en difficulté)
- Hétérogénéité de la classe si pertinente (disparités entre élèves)
- Progression observée si mentionnée par plusieurs enseignants
- Matière exceptionnelle UNIQUEMENT si écart très significatif (≥ 4 points vs moyenne)

**Paragraphe 2 - AMBIANCE DE TRAVAIL (3-4 phrases)**
- Sérieux et application dans le travail
- Concentration et attention en classe
- Participation (active / timide / insuffisante)
- Comportements perturbateurs (bavardages, agitation) SI mentionnés par plusieurs profs
- Investissement et motivation
- Travail personnel (devoirs, leçons)

**Paragraphe 3 - CLIMAT DE CLASSE ET PERSPECTIVES (2-3 phrases)**
- Relations entre élèves (cohésion / tensions / respect)
- Ambiance générale de la classe
- Points d'attention (assiduité, ponctualité, comportement) SI significatifs
- Conclusion avec encouragements OU attentes selon le bilan global

RÈGLES STRICTES - VIOLATIONS = ÉCHEC :

❌ INTERDICTIONS ABSOLUES :
- JAMAIS de moyennes chiffrées (pas de "11.5", "12/20", "moyenne de X")
- JAMAIS de noms de professeurs (pas de "M. Dupont", "Mme Martin", "l'enseignant de...")
- JAMAIS de liste de matières (sauf UNE matière si vraiment exceptionnelle)
- JAMAIS mentionner le nom de la classe (pas de "La classe de 5e3", "Cette 4BAY", "Les élèves de 3ème")
- JAMAIS mentionner le nombre exact d'élèves (pas de "les 25 élèves")

✅ OBLIGATIONS :
- Commencer directement par l'analyse : "Les résultats...", "La classe présente..."
- Basé UNIQUEMENT sur les appréciations réelles des professeurs fournies
- Vocabulaire professionnel et institutionnel français
- Formulations qualitatives ("satisfaisants", "fragiles", "en progression")
- Les 3 paragraphes DOIVENT être séparés par des doubles sauts de ligne

TONALITÉ :
${toneInstruction}

FORMULATIONS À PRIVILÉGIER :
✅ "Les résultats sont globalement satisfaisants"
✅ "La classe présente de fortes disparités"
✅ "L'ambiance de travail est perturbée par des bavardages fréquents"
✅ "La participation reste timide et gagnerait à être encouragée"
✅ "Le climat relationnel est positif avec une bonne cohésion"
✅ "Des efforts soutenus sont attendus pour le prochain trimestre"
✅ "Le conseil encourage à poursuivre dans cette voie"

FORMULATIONS À ÉVITER :
❌ "La classe de 5e3 présente..." (ne pas nommer la classe)
❌ "La moyenne de 11.5 est correcte" (pas de chiffres)
❌ "M. Dupont signale..." (pas de noms de profs)
❌ "Les mathématiques, le français et l'histoire..." (pas de liste)
❌ "Les 23 élèves..." (pas de nombre exact)`;

    const userPrompt = `Rédige l'appréciation générale de classe pour le bulletin du conseil de classe.

CONTEXTE :
- Période : ${classData?.period || "ce trimestre"}

ANALYSE DES APPRÉCIATIONS DES ENSEIGNANTS :
${themeContext}
${exceptionalContext ? `\nMATIÈRES PARTICULIÈRES :${exceptionalContext}\n` : ''}

CONSIGNES DE RÉDACTION :
1. Commence DIRECTEMENT par l'analyse (pas de "La classe de X...")
2. Rédige en 3 paragraphes distincts séparés par des doubles sauts de ligne
3. Base-toi EXCLUSIVEMENT sur les observations des enseignants ci-dessus
4. N'invente AUCUNE information non présente dans l'analyse
5. N'inclus AUCUN chiffre, moyenne, nom de professeur ou nom de classe
6. Longueur : 150-${maxWords} mots maximum

Génère maintenant l'appréciation (commence directement sans préambule) :`;

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
