import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AppreciationTone = 'severe' | 'standard' | 'caring' | 'praising';

const toneInstructions: Record<AppreciationTone, string> = {
  severe: `Adopte un ton SÉVÈRE : constat direct des difficultés, vocabulaire ferme avec notion d'avertissement, accent sur les lacunes et attentes non satisfaites, appel explicite à un changement. Utilise des formulations comme "insuffisant", "doit impérativement", "le conseil met en garde".`,
  
  standard: `Adopte un ton STANDARD : neutre et factuel, équilibre entre points positifs et axes d'amélioration, formulations institutionnelles classiques. Utilise des formulations comme "correct", "satisfaisant", "des efforts à poursuivre".`,
  
  caring: `Adopte un ton BIENVEILLANT : valorise les efforts même modestes, encourage explicitement, formule les critiques de manière positive (comme des conseils), reconnais le potentiel et la progression. Utilise des formulations comme "des efforts remarqués", "en progression", "nous croyons en tes capacités".`,
  
  praising: `Adopte un ton ÉLOGIEUX : célèbre les réussites et l'excellence, vocabulaire laudatif et enthousiaste, mise en avant des qualités remarquables, félicitations explicites. Utilise des formulations comme "félicitations du conseil", "excellent", "remarquable", "exemplaire".`
};

interface StudentData {
  name: string;
  average: number;
  subjects?: { name: string; grade: number; classAverage?: number; appreciation?: string }[];
}

interface RequestBody {
  type: 'general' | 'individual';
  tone?: AppreciationTone;
  classData?: {
    className: string;
    trimester: string;
    averageClass: number;
    subjects?: { name: string; average: number }[];
  };
  student?: StudentData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: RequestBody = await req.json();
    const { type, tone = 'standard', classData, student } = body;

    const toneInstruction = toneInstructions[tone] || toneInstructions.standard;

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'general') {
      systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation générale du conseil de classe pour un bulletin scolaire français.

RÈGLES STRICTES :
- Entre 200 et 255 caractères (strict)
- Rédaction impersonnelle à la troisième personne (parler de "la classe", "le groupe")
- Ton professionnel
- Synthétiser la dynamique générale, l'ambiance de travail et les axes de progression
- Ne pas lister les matières, mais donner une vision globale

TONALITÉ À ADOPTER :
${toneInstruction}`;

      const tendancesPositives = classData?.subjects?.filter(s => s.average >= 12).map(s => s.name).join(', ') || 'Non disponible';
      const pointsVigilance = classData?.subjects?.filter(s => s.average < 10).map(s => s.name).join(', ') || 'Aucun';
      const ambiance = classData?.averageClass && classData.averageClass >= 12 ? 'studieuse' : 'en progression';

      userPrompt = `Rédige l'appréciation générale du conseil de classe :
- Classe : ${classData?.className || '3ème'}
- Trimestre : ${classData?.trimester || '1er trimestre'}
- Moyenne de classe : ${classData?.averageClass || 'N/A'}/20
- Tendances positives observées : ${tendancesPositives}
- Points de vigilance : ${pointsVigilance}
- Ambiance générale : ${ambiance}`;

    } else {
      systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation du conseil de classe pour un bulletin scolaire français.

RÈGLES STRICTES :
- Entre 250 et 450 caractères (obligatoire)
- Commencer OBLIGATOIREMENT par le prénom de l'élève
- Rédaction à la troisième personne (ne jamais s'adresser directement à l'élève avec "tu" ou "vous")
- Ne PAS mentionner la moyenne chiffrée
- Synthétiser les appréciations des différents professeurs en un bilan cohérent
- Mentionner : attitude en classe, qualité du travail, points forts, axes de progression
- Terminer par une perspective ou un encouragement

TONALITÉ À ADOPTER :
${toneInstruction}`;

      const prenom = student?.name?.split(' ')[0] || 'L\'élève';
      
      let profil = 'Satisfaisant';
      if (student?.average && student.average >= 16) profil = 'Excellent';
      else if (student?.average && student.average >= 12) profil = 'Satisfaisant';
      else if (student?.average && student.average >= 8) profil = 'Fragile';
      else if (student?.average) profil = 'En difficulté';

      const pointsForts = student?.subjects?.filter(s => s.grade >= 14).map(s => s.name).join(', ') || 'À identifier';
      const axesAmelioration = student?.subjects?.filter(s => s.grade < 10).map(s => s.name).join(', ') || 'Maintenir les efforts';
      
      const syntheseAppreciations = student?.subjects?.map(s => {
        const appreciation = s.appreciation ? ` (${s.appreciation})` : '';
        if (s.grade >= 16) return `${s.name}: excellent travail${appreciation}`;
        if (s.grade >= 14) return `${s.name}: bon niveau${appreciation}`;
        if (s.grade >= 10) return `${s.name}: résultats corrects${appreciation}`;
        return `${s.name}: des efforts nécessaires${appreciation}`;
      }).join(', ') || 'Synthèse non disponible';

      userPrompt = `Rédige l'appréciation du conseil de classe pour cet élève :
- Prénom : ${prenom}
- Classe : ${classData?.className || '3ème'}
- Trimestre : ${classData?.trimester || '1er trimestre'}
- Profil général : ${profil}

Synthèse des appréciations des professeurs :
${syntheseAppreciations}

Points forts relevés : ${pointsForts}
Axes d'amélioration : ${axesAmelioration}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés, veuillez ajouter des crédits à votre espace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const appreciation = data.choices?.[0]?.message?.content?.trim();

    if (!appreciation) {
      throw new Error('No appreciation generated');
    }

    return new Response(
      JSON.stringify({ appreciation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating appreciation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
