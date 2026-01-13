import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentData {
  name: string;
  average: number;
  subjects?: { name: string; grade: number; classAverage?: number }[];
}

interface RequestBody {
  type: 'general' | 'individual';
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const body: RequestBody = await req.json();
    const { type, classData, student } = body;

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'general') {
      systemPrompt = `Tu es un professeur principal expérimenté rédigeant l'appréciation générale du conseil de classe pour un bulletin scolaire français.

Consignes:
- Maximum 255 caractères
- Ton professionnel et bienveillant
- Mentionner les points positifs et axes d'amélioration
- Utiliser un vocabulaire adapté au contexte scolaire français`;

      userPrompt = `Génère une appréciation générale de classe pour:
- Classe: ${classData?.className || '3ème'}
- Trimestre: ${classData?.trimester || '1er trimestre'}
- Moyenne de classe: ${classData?.averageClass || 'N/A'}/20
${classData?.subjects ? `- Matières fortes: ${classData.subjects.filter(s => s.average >= 14).map(s => s.name).join(', ')}` : ''}
${classData?.subjects ? `- Matières à renforcer: ${classData.subjects.filter(s => s.average < 10).map(s => s.name).join(', ')}` : ''}`;

    } else {
      systemPrompt = `Tu es un professeur principal expérimenté rédigeant des appréciations individuelles pour des bulletins scolaires français.

Consignes:
- Maximum 500 caractères
- Ton bienveillant et constructif
- Personnaliser selon le profil de l'élève
- Mentionner points forts et conseils d'amélioration
- Adapter le ton selon le niveau (encourager les élèves en difficulté, féliciter les excellents)`;

      const subjectsInfo = student?.subjects?.map(s => 
        `${s.name}: ${s.grade}/20${s.classAverage ? ` (moy. classe: ${s.classAverage})` : ''}`
      ).join(', ') || 'Non disponibles';

      userPrompt = `Génère une appréciation individuelle pour:
- Élève: ${student?.name}
- Moyenne générale: ${student?.average}/20
- Notes par matière: ${subjectsInfo}
${student?.average && student.average >= 16 ? '- Profil: Excellent élève' : ''}
${student?.average && student.average >= 12 && student.average < 16 ? '- Profil: Bon élève' : ''}
${student?.average && student.average < 12 ? '- Profil: Élève nécessitant un accompagnement' : ''}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_completion_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
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
