import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student, classAverage, subject, trimester } = await req.json();
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

    // Determine student profile for tone adaptation
    let studentProfile = "moyen";
    if (average !== null) {
      if (average >= 16) studentProfile = "excellent";
      else if (average >= 12) studentProfile = "correct";
      else if (average >= 8) studentProfile = "difficulte";
      else studentProfile = "grande_difficulte";
    }

    const systemPrompt = `Tu es un assistant pour enseignants français. Génère une appréciation de bulletin scolaire.

CONTRAINTES STRICTES :
- Entre 300 et 400 caractères exactement
- Ton professionnel et constructif
- En français correct
- Pas de formule de politesse finale
- Utiliser le prénom "${firstName}" au début de la première phrase
- Ne JAMAIS commencer par "L'élève" ou "${firstName} est un/une élève"

STRUCTURE OBLIGATOIRE :
1. Phrase sur le bilan du trimestre (liée à la moyenne)
2. Mention de la participation orale si pertinent
3. Commentaire sur l'attitude/sérieux
4. Si absences (${absences || 0}) ou non-rendus (${nonRendus || 0}) significatifs : le mentionner
5. Encouragement ou avertissement selon le profil

TON À ADAPTER selon le profil "${studentProfile}" :
- Excellent (>16) : valorisant, encourager à maintenir l'excellence
- Correct (12-16) : positif avec axes d'amélioration identifiés
- Difficulté (8-12) : constructif, identifier les efforts ou les manques
- Grande difficulté (<8) : ferme, urgence de se ressaisir
${behaviorIssue ? "- Problème de comportement signalé : ton direct et ferme" : ""}
${isTalkative ? "- Élève bavard : mentionner que le bavardage nuit au travail" : ""}

IMPORTANT : 
- La moyenne de l'élève est ${average !== null ? average.toFixed(1) : "non disponible"}/20
- La moyenne de classe est ${classAverage ? classAverage.toFixed(1) : "environ 12"}/20
- Comparer subtilement la performance de l'élève à la classe si pertinent`;

    let context = `Génère une appréciation pour cet élève :\n`;
    context += `- Prénom : ${firstName}\n`;
    context += `- Nom : ${lastName}\n`;
    if (average !== null) context += `- Moyenne : ${average.toFixed(1)}/20\n`;
    if (seriousness !== null && seriousness !== undefined) context += `- Note de sérieux : ${seriousness}/20\n`;
    if (participation !== null && participation !== undefined) context += `- Note de participation : ${participation}/20\n`;
    if (absences && absences > 0) context += `- Absences aux évaluations : ${absences}\n`;
    if (nonRendus && nonRendus > 0) context += `- Devoirs non rendus : ${nonRendus}\n`;
    if (behaviorIssue) context += `- Problème de comportement : ${behaviorIssue}\n`;
    if (isTalkative) context += `- Signalé comme bavard\n`;
    if (specificObservations && specificObservations.length > 0) {
      context += `- Observations spécifiques : ${specificObservations.join(", ")}\n`;
    }
    if (subject) context += `- Matière : ${subject}\n`;
    if (trimester) context += `- Période : ${trimester}\n`;

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
    const appreciation = data.choices?.[0]?.message?.content || "";

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
