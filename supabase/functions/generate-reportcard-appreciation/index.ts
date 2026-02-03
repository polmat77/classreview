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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student, classAverage, subject, trimester, maxCharacters = 400, tone: rawTone = 'standard' } = await req.json();
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
      specificObservations 
    } = student;

    // Calculate target with safety margin
    const targetChars = Math.floor(maxCharacters * 0.85);
    const minChars = Math.floor(maxCharacters * 0.6);
    
    // Get work level description instead of numerical average
    const workLevel = getWorkLevel(average);

    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;

    const systemPrompt = `Tu es un professeur expérimenté rédigeant une appréciation pour un bulletin scolaire de collège/lycée.

CONTRAINTE DE LONGUEUR ABSOLUE ET NON NÉGOCIABLE :
- MINIMUM : ${minChars} caractères
- MAXIMUM : ${maxCharacters} caractères  
- CIBLE IDÉALE : ${targetChars} caractères
⚠️ Si ton texte dépasse ${maxCharacters} caractères, il sera REJETÉ. Compte tes caractères.

RÈGLES STRICTES À RESPECTER IMPÉRATIVEMENT :
- NE JAMAIS mentionner la moyenne chiffrée de l'élève (pas de "12/20", "moyenne de 15", "17.9/20", etc.)
- NE JAMAIS comparer avec la moyenne de classe en chiffres
- NE JAMAIS écrire de notes numériques dans l'appréciation
- Utiliser UNIQUEMENT des formulations qualitatives (excellent, satisfaisant, insuffisant, etc.)
- Commencer directement par le prénom "${firstName}"
- Ne pas commencer par "L'élève" ou "${firstName} est un/une élève"
- Pas de formule de politesse finale
- En français correct et professionnel

TON À ADOPTER : ${tone}
${toneInstruction}

FORMULATIONS QUALITATIVES À UTILISER selon le niveau "${workLevel}" :
- Excellent (≥16) : "trimestre remarquable", "excellents résultats", "travail exemplaire", "très bonne maîtrise"
- Très bon (14-16) : "trimestre très satisfaisant", "très bons résultats", "investissement sérieux"
- Bon (12-14) : "trimestre satisfaisant", "bons résultats", "travail sérieux"
- Correct (10-12) : "résultats corrects", "peut mieux faire", "des efforts à poursuivre"
- Insuffisant (8-10) : "résultats insuffisants", "manque de travail", "doit fournir plus d'efforts"
- Très insuffisant (<8) : "situation préoccupante", "résultats alarmants", "ressaisissement impératif"

STRUCTURE (adapter selon le profil) :
1. Phrase d'accroche qualitative sur le bilan du trimestre (SANS chiffres)
2. Mention de la participation orale si pertinent
3. Commentaire sur l'attitude/sérieux
4. Si absences ou non-rendus : le mentionner
5. Encouragement ou avertissement adapté au profil

EXEMPLES CORRECTS :
✅ "Lilou réalise un excellent trimestre. Sa participation orale est remarquable et son travail très rigoureux."
✅ "Les résultats de Flavio sont satisfaisants ce trimestre. Il participe avec pertinence mais gagnerait à approfondir son travail personnel."
✅ "Kyle présente des résultats insuffisants qui traduisent un manque d'investissement. Un ressaisissement s'impose."

FORMULATIONS INTERDITES :
❌ "avec une moyenne de 17.9/20"
❌ "obtient 13/20"
❌ "nettement au-dessus de la moyenne de classe (12.5)"
❌ "sa moyenne de 9.16"
❌ Toute mention chiffrée de notes ou moyennes

RAPPEL FINAL : Maximum ${maxCharacters} caractères. Sois concis et percutant.`;

    let context = `Génère une appréciation pour cet élève :\n`;
    context += `- Prénom : ${firstName}\n`;
    context += `- Nom : ${lastName}\n`;
    context += `- Niveau de travail : ${workLevel}\n`;
    if (seriousness !== null && seriousness !== undefined) context += `- Sérieux en classe : ${seriousness > 14 ? "très sérieux" : seriousness > 10 ? "sérieux" : seriousness > 6 ? "insuffisant" : "problématique"}\n`;
    if (participation !== null && participation !== undefined) context += `- Participation orale : ${participation > 14 ? "excellente" : participation > 10 ? "satisfaisante" : participation > 6 ? "insuffisante" : "quasi inexistante"}\n`;
    if (absences && absences > 0) context += `- Absences aux évaluations : ${absences}\n`;
    if (nonRendus && nonRendus > 0) context += `- Devoirs non rendus : ${nonRendus}\n`;
    if (behaviorIssue) context += `- Problème de comportement : ${typeof behaviorIssue === 'string' ? behaviorIssue : 'signalé'}\n`;
    if (isTalkative) context += `- Signalé comme bavard\n`;
    if (specificObservations && specificObservations.length > 0) {
      context += `- Observations spécifiques : ${specificObservations.join(", ")}\n`;
    }
    if (subject) context += `- Matière : ${subject}\n`;
    if (trimester) context += `- Période : ${trimester}\n`;
    context += `\nTon demandé : ${tone}\n`;
    context += `\n⚠️ RAPPEL CRITIQUE : Maximum ${maxCharacters} caractères. NE PAS mentionner de notes chiffrées.`;

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
