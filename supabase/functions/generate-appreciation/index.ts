import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

// Input validation functions
function isValidTone(tone: unknown): tone is AppreciationTone {
  return typeof tone === 'string' && ['severe', 'standard', 'caring', 'praising'].includes(tone);
}

function isValidType(type: unknown): type is 'general' | 'individual' {
  return typeof type === 'string' && ['general', 'individual'].includes(type);
}

function sanitizeString(str: unknown, maxLength: number): string {
  if (typeof str !== 'string') return '';
  
  // Remove potential prompt injection patterns and limit length
  let clean = str.slice(0, maxLength)
    // Remove HTML-like and template characters
    .replace(/[<>{}]/g, '')
    // Remove prompt injection patterns (case insensitive)
    .replace(/\b(ignore|oublie|oublier|disregard|forget)\s+(previous|précédent|précédente|all|tout|toute|les|the|above|ci-dessus)\s+(instructions?|consignes?|règles?|rules?)/gi, '')
    .replace(/\b(system|système|assistant|user|utilisateur)\s*:/gi, '')
    .replace(/\b(new|nouvelle?|change|modifier?)\s+(instruction|consigne|prompt|règle|rule)/gi, '')
    .replace(/\b(pretend|fais\s+comme\s+si|act\s+as|agis\s+comme|you\s+are\s+now|tu\s+es\s+maintenant)/gi, '')
    .replace(/\b(reveal|révèle|show|montre|display|affiche)\s+(system|your|ton|ta|the|le|la)\s+(prompt|instruction|consigne|règle)/gi, '')
    .replace(/\b(override|bypass|contourne|ignore)\s+(safety|sécurité|filter|filtre|restriction|rule|règle)/gi, '')
    // Remove excessive newlines (potential formatting attacks)
    .replace(/\n{3,}/g, '\n\n')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
  
  return clean;
}

function validateNumber(num: unknown, min: number, max: number): number {
  if (typeof num !== 'number' || isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

interface SubjectInput {
  name: string;
  average?: number;
  grade?: number;
  classAverage?: number;
  appreciation?: string;
}

interface ClassDataInput {
  className?: string;
  trimester?: string;
  averageClass?: number;
  subjects?: SubjectInput[];
}

interface StudentInput {
  name?: string;
  average?: number;
  subjects?: SubjectInput[];
}

interface ValidatedRequest {
  type: 'general' | 'individual';
  tone: AppreciationTone;
  classData?: {
    className: string;
    trimester: string;
    averageClass: number;
    subjects: { name: string; average: number }[];
  };
  student?: {
    name: string;
    average: number;
    subjects: { name: string; grade: number; classAverage?: number; appreciation?: string }[];
  };
}

function validateRequest(body: unknown): ValidatedRequest | null {
  if (!body || typeof body !== 'object') return null;
  
  const rawBody = body as Record<string, unknown>;
  
  // Validate type (required)
  if (!isValidType(rawBody.type)) return null;
  
  // Validate tone (optional, defaults to standard)
  const tone: AppreciationTone = isValidTone(rawBody.tone) ? rawBody.tone : 'standard';
  
  const result: ValidatedRequest = {
    type: rawBody.type,
    tone,
  };
  
  // Validate classData if provided
  if (rawBody.classData && typeof rawBody.classData === 'object') {
    const cd = rawBody.classData as ClassDataInput;
    result.classData = {
      className: sanitizeString(cd.className, 50) || '3ème',
      trimester: sanitizeString(cd.trimester, 50) || '1er trimestre',
      averageClass: validateNumber(cd.averageClass, 0, 20),
      subjects: [],
    };
    
    if (Array.isArray(cd.subjects)) {
      result.classData.subjects = cd.subjects.slice(0, 30).map(s => ({
        name: sanitizeString(s?.name, 100),
        average: validateNumber(s?.average, 0, 20),
      })).filter(s => s.name);
    }
  }
  
  // Validate student if provided (required for individual type)
  if (rawBody.type === 'individual') {
    if (!rawBody.student || typeof rawBody.student !== 'object') return null;
    
    const st = rawBody.student as StudentInput;
    result.student = {
      name: sanitizeString(st.name, 100) || 'Élève',
      average: validateNumber(st.average, 0, 20),
      subjects: [],
    };
    
    if (Array.isArray(st.subjects)) {
      result.student.subjects = st.subjects.slice(0, 30).map(s => ({
        name: sanitizeString(s?.name, 100),
        grade: validateNumber(s?.grade, 0, 20),
        classAverage: s?.classAverage !== undefined ? validateNumber(s.classAverage, 0, 20) : undefined,
        appreciation: s?.appreciation ? sanitizeString(s.appreciation, 500) : undefined,
      })).filter(s => s.name);
    }
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Note: This is a public tool without user authentication
    // Security is maintained through input validation and rate limiting
    
    // Validate API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Parse and validate request body
    const rawBody = await req.json();
    const validatedRequest = validateRequest(rawBody);
    
    if (!validatedRequest) {
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, tone, classData, student } = validatedRequest;
    const toneInstruction = toneInstructions[tone];

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
        model: 'google/gemini-2.5-flash',
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
    console.log('AI Gateway response:', JSON.stringify(data, null, 2));
    
    // Handle different response formats
    let appreciation = data.choices?.[0]?.message?.content?.trim();
    
    // Fallback: some models return in different formats
    if (!appreciation && data.choices?.[0]?.text) {
      appreciation = data.choices[0].text.trim();
    }
    
    if (!appreciation) {
      console.error('No appreciation in response:', JSON.stringify(data));
      throw new Error('No appreciation generated - empty response from AI');
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
