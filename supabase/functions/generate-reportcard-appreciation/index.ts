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
    const { student } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { firstName, average, observations, absences } = student;

    const systemPrompt = `Tu es un assistant pour enseignants français. Tu génères des appréciations de bulletin scolaire.

Règles STRICTES :
- Entre 300 et 400 caractères exactement
- Commence par une phrase sur le travail du trimestre
- Mentionne la participation orale
- Évoque l'attitude et le sérieux
- Mentionne les absences si nombreuses (>5)
- Sois ferme et direct pour les élèves problématiques
- Sois encourageant pour les bons élèves
- Reste professionnel et constructif
- Utilise la 3ème personne avec le prénom
- PAS de notes numériques dans le texte`;

    let context = `Prénom: ${firstName}\n`;
    if (average !== null) context += `Moyenne: ${average}/20\n`;
    if (absences) context += `Absences: ${absences}\n`;
    if (observations && observations.length > 0) {
      context += `Observations: ${observations.join(", ")}\n`;
    }

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
          { role: "user", content: `Génère une appréciation pour cet élève:\n${context}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
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
