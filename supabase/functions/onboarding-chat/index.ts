import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, toolName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Tu es un assistant d'onboarding pour AIProject4You, une suite d'outils éducatifs pour enseignants français. Tu aides les utilisateurs à prendre en main l'outil ${toolName || "AIProject4You"}. Réponds UNIQUEMENT en français. Sois concis (max 3 phrases), bienveillant et pédagogue. Tu connais parfaitement :
- ClassCouncilAI : import PDF PRONOTE, génération d'appréciations de conseil de classe, export
- ReportCardAI : workflow 4 étapes (import PDF ou saisie manuelle, observations comportementales, génération IA par élève avec ton configurable, bilan de classe), limite caractères 200-500, 5 tons (Ferme/Neutre/Bienveillant/Encourageant/Constructif)
- QuizMaster : création quiz XML compatibles PRONOTE, types QCM/vrai-faux/réponse libre/cloze
- RGPD : toutes les données sont traitées localement dans le navigateur, aucune donnée élève n'est transmise à des serveurs externes.
Ne réponds PAS à des questions hors contexte éducatif ou non liées aux outils.`;

    // Keep only last 10 messages
    const trimmedMessages = (messages || []).slice(-10);

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
          ...trimmedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("onboarding-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

