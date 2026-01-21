import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppreciationTone = 'neutre' | 'encourageant' | 'constructif' | 'ferme' | 'bienveillant';

const toneInstructions: Record<AppreciationTone, string> = {
  neutre: "Reste factuel et objectif, décris la situation sans jugement excessif.",
  encourageant: "Mets en avant les points positifs de la classe et encourage les efforts collectifs.",
  constructif: "Identifie les axes d'amélioration avec bienveillance tout en valorisant les acquis.",
  ferme: "Sois direct sur les problèmes identifiés, les attentes doivent être claires pour le prochain trimestre.",
  bienveillant: "Adopte un ton chaleureux et encourageant, mets en avant le potentiel du groupe.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { options, classStats, labels, maxCharacters = 400, tone = 'neutre' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine overall class tone
    const positiveIndicators = [
      options.workLevel === "serious",
      options.behavior === "respectful",
      options.participation === "active",
      options.progression === "improving",
    ].filter(Boolean).length;

    const classProfile = positiveIndicators >= 3 ? "positif" : positiveIndicators >= 2 ? "nuance" : "difficile";
    const toneInstruction = toneInstructions[tone as AppreciationTone] || toneInstructions.neutre;

    const systemPrompt = `Tu es un assistant pour enseignants français. Génère un bilan de classe pour le bulletin du conseil de classe.

CONTRAINTES STRICTES :
- Entre ${Math.round(maxCharacters * 0.75)} et ${maxCharacters} caractères exactement
- Ton professionnel adapté au contexte officiel
- Synthétique et percutant
- Une seule phrase ou deux phrases courtes maximum

STRUCTURE :
- Décrire l'ambiance générale de travail
- Mentionner le comportement collectif
- Évoquer la participation
- Conclure sur la progression ou les attentes

TON À ADOPTER : ${toneInstruction}

PROFIL DE CLASSE "${classProfile}" :
${classProfile === "positif" ? "- Classe globalement positive : valoriser les efforts et encourager à maintenir cette dynamique" : ""}
${classProfile === "nuance" ? "- Classe mitigée : équilibrer points positifs et axes d'amélioration" : ""}
${classProfile === "difficile" ? "- Classe en difficulté : être ferme sur les attentes tout en restant constructif" : ""}

IMPORTANT :
- Ne pas utiliser de formules génériques vides
- Être concret et spécifique
- Adapter le vocabulaire au niveau scolaire (collège)`;

    const userPrompt = `Génère un bilan de classe avec ces caractéristiques :
- Niveau de travail : ${labels.workLevel}
- Comportement : ${labels.behavior}
- Participation : ${labels.participation}
- Progression : ${labels.progression}
- Nombre d'élèves : ${classStats.totalStudents}
- Moyenne de classe : ${classStats.averageGrade.toFixed(1)}/20
- Ton demandé : ${tone}
- Longueur maximale : ${maxCharacters} caractères

Le bilan doit refléter fidèlement ces caractéristiques et être utilisable directement dans un bulletin officiel.`;

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
    const summary = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ summary }), {
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