import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppreciationTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

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

function getWorkLevel(average: number | null): string {
  if (average === null) return "non évaluable";
  if (average >= 16) return "excellent";
  if (average >= 14) return "très bon";
  if (average >= 12) return "bon";
  if (average >= 10) return "correct";
  if (average >= 8) return "insuffisant";
  return "très insuffisant";
}

function truncateIntelligently(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastCut = Math.max(lastPeriod, lastExclamation);
  if (lastCut > maxChars * 0.7) return truncated.substring(0, lastCut + 1);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) return truncated.substring(0, lastSpace) + '...';
  return truncated.substring(0, maxChars - 3) + '...';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Token invalide ou expiré' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { 
      firstName, lastName, average, seriousness, participation,
      absences, nonRendus, behaviorIssue, isTalkative, specificObservations
    } = student;

    const targetChars = Math.floor(maxCharacters * 0.85);
    const minChars = Math.floor(maxCharacters * 0.6);
    const workLevel = getWorkLevel(average);
    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;

    const systemPrompt = `Tu es un professeur principal présentant un élève devant le conseil de classe. Tu dois être PRÉCIS et FACTUEL.

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

2. RÉSULTATS (2-3 phrases)
   Commente les résultats de manière globale basée sur le niveau de travail.

3. ATTITUDE ET COMPORTEMENT (2-3 phrases)
   Commente le sérieux et la participation globale.

4. POINTS D'ALERTE (1 phrase si pertinent)
   - Mentionne les absences si > 3
   - Mentionne les devoirs non rendus si > 2

5. CONCLUSION (1 phrase)
   Conseil concret ou perspective d'amélioration

───────────────────────────────────────────────────

RÈGLES ABSOLUES :
✅ TOUJOURS commencer par le prénom "${firstName}"
✅ Être factuel et précis
✅ Ton professionnel mais bienveillant
✅ Longueur : ${minChars}-${maxCharacters} caractères

❌ INTERDICTIONS :
❌ Ne JAMAIS mentionner de notes chiffrées (pas de "12/20", "moyenne de 15")
❌ Ne JAMAIS répéter le niveau qualitatif dans le corps du texte
❌ Ne JAMAIS porter de jugement sur la personnalité de l'élève`;

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
