import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
  severe: "Sois direct et strict sur les problèmes identifiés. Le bilan doit pointer clairement les manquements collectifs et exiger un changement d'attitude.",
  standard: "Adopte un ton FACTUEL et RAISONNÉ. Le bilan doit être une analyse objective de la dynamique de classe, basée sur les observations concrètes. Équilibre entre constats positifs et axes d'amélioration.",
  encourageant: "Mets en avant les points positifs de la classe et valorise les efforts collectifs. Le ton doit être bienveillant et motivant pour la suite.",
  elogieux: "Félicite chaleureusement la classe pour son excellent trimestre. Utilise des formulations enthousiastes et valorisantes pour souligner la qualité du travail collectif.",
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
    // Authentication: Validate JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with auth header to validate token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Validate JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Token invalide ou expiré' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { options, classStats, labels, maxCharacters = 400, tone: rawTone = 'standard' } = await req.json();
    const tone = migrateTone(rawTone);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate target with safety margin
    const targetChars = Math.floor(maxCharacters * 0.85);
    const minChars = Math.floor(maxCharacters * 0.6);

    // Determine overall class tone
    const positiveIndicators = [
      options.workLevel === "serious",
      options.behavior === "respectful",
      options.participation === "active",
      options.progression === "improving",
    ].filter(Boolean).length;

    const classProfile = positiveIndicators >= 3 ? "positif" : positiveIndicators >= 2 ? "nuance" : "difficile";
    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;

    const systemPrompt = `Tu es un assistant pour enseignants français. Génère un bilan de classe pour le bulletin du conseil de classe.

CONTRAINTE DE LONGUEUR ABSOLUE ET NON NÉGOCIABLE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MINIMUM : ${minChars} caractères
⚠️ MAXIMUM : ${maxCharacters} caractères
⚠️ CIBLE IDÉALE : ${targetChars} caractères
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si ton texte dépasse ${maxCharacters} caractères, il sera REJETÉ. Compte soigneusement.

RÈGLES STRICTES À RESPECTER IMPÉRATIVEMENT :
- NE JAMAIS mentionner la moyenne de classe en chiffres (pas de "13.9/20", "moyenne de 14", "14/20", etc.)
- NE JAMAIS mentionner le nombre exact d'élèves (pas de "les 23 élèves", "cette classe de 28 élèves")
- NE JAMAIS écrire de notes numériques dans le bilan
- Utiliser UNIQUEMENT des formulations qualitatives (excellents résultats, satisfaisants, insuffisants, etc.)
- Ton professionnel adapté au contexte officiel
- Synthétique et percutant
- Texte fluide en un seul paragraphe (pas de liste à puces)
- Pas de formule de politesse finale

STRUCTURE DU BILAN (à adapter selon les caractéristiques) :
1. Phrase d'accroche sur l'ambiance générale de travail
2. Mention du comportement collectif
3. Évocation de la participation
4. Conclusion sur la progression et les attentes pour la suite

TON À ADOPTER : ${toneInstruction}

PROFIL DE CLASSE "${classProfile}" :
${classProfile === "positif" ? "- Classe globalement positive : valoriser les efforts et encourager à maintenir cette dynamique" : ""}
${classProfile === "nuance" ? "- Classe mitigée : équilibrer points positifs et axes d'amélioration" : ""}
${classProfile === "difficile" ? "- Classe en difficulté : être ferme sur les attentes tout en restant constructif" : ""}

EXEMPLES DE FORMULATIONS CORRECTES :
✅ "Cette classe montre un investissement satisfaisant..."
✅ "Le groupe fait preuve d'un sérieux remarquable..."
✅ "L'ambiance de travail reste perfectible..."
✅ "Les résultats de cette classe sont encourageants..."

FORMULATIONS INTERDITES :
❌ "avec une moyenne de classe de 13.9/20"
❌ "les 23 élèves de cette classe"
❌ "la moyenne générale de 14/20"
❌ "une moyenne honorable de 13.9"

RAPPEL FINAL : Tu dois produire EXACTEMENT entre ${minChars} et ${maxCharacters} caractères. Pas plus.`;

    const userPrompt = `Génère un bilan de classe avec ces caractéristiques :
- Niveau de travail : ${labels.workLevel}
- Comportement : ${labels.behavior}
- Participation : ${labels.participation}
- Progression : ${labels.progression}
- Ton demandé : ${tone}
- Longueur maximale : ${maxCharacters} caractères

Le bilan doit refléter fidèlement ces caractéristiques et être utilisable directement dans un bulletin officiel.
RAPPEL : Maximum ${maxCharacters} caractères. Sois concis et direct.`;

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
    let summary = data.choices?.[0]?.message?.content || "";
    
    // Post-processing: truncate if still too long
    if (summary.length > maxCharacters) {
      console.log(`Summary too long: ${summary.length}/${maxCharacters}, truncating...`);
      summary = truncateIntelligently(summary, maxCharacters);
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue lors de la génération" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});