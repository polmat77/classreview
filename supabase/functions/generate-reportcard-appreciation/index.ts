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

function getSubjectSkills(subject: string): string {
  const s = subject.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (s.includes('anglais') || s.includes('english')) {
    return `- Compréhension écrite (reading) et orale (listening)
- Expression écrite (writing) et orale (speaking)
- Maîtrise du vocabulaire et des structures grammaticales
- Participation aux échanges en anglais
- Qualité des productions (tâches finales, présentations orales)
- Prise de parole en continu et en interaction
- Ouverture culturelle aux pays anglophones`;
  }

  if (s.includes('espagnol')) {
    return `- Compréhension écrite et orale
- Expression écrite et orale en espagnol
- Maîtrise du vocabulaire et de la conjugaison
- Participation aux échanges en langue cible
- Ouverture culturelle au monde hispanophone`;
  }

  if (s.includes('allemand')) {
    return `- Compréhension écrite et orale
- Expression écrite et orale en allemand
- Maîtrise des déclinaisons et structures
- Participation aux échanges en langue cible
- Ouverture culturelle au monde germanophone`;
  }

  if (s.includes('italien')) {
    return `- Compréhension écrite et orale
- Expression écrite et orale en italien
- Maîtrise du vocabulaire et des structures
- Participation aux échanges en langue cible
- Ouverture culturelle au monde italophone`;
  }

  if (s.includes('lv1') || s.includes('lv2') || s.includes('langue')) {
    return `- Compréhension écrite et orale
- Expression écrite et orale
- Maîtrise du vocabulaire et des structures grammaticales
- Participation aux échanges en langue cible
- Qualité des productions écrites et orales`;
  }

  if (s.includes('francais') || s.includes('lettres')) {
    return `- Compréhension et analyse de textes littéraires
- Expression écrite (rédaction, argumentation, invention)
- Maîtrise de la langue (orthographe, grammaire, conjugaison)
- Expression orale et participation aux débats
- Culture littéraire et ouverture artistique`;
  }

  if (s.includes('math')) {
    return `- Raisonnement logique et démonstration
- Maîtrise du calcul et des techniques opératoires
- Résolution de problèmes
- Rigueur dans la rédaction
- Géométrie et représentation dans l'espace
- Utilisation des outils numériques (tableur, scratch)`;
  }

  if (s.includes('histoire') || s.includes('geo') || s.includes('emc') || s.includes('enseignement moral')) {
    return `- Connaissance des repères historiques et géographiques
- Analyse et interprétation de documents
- Argumentation et esprit critique
- Maîtrise du vocabulaire spécifique
- Qualité des productions écrites et orales
- Éducation à la citoyenneté`;
  }

  if (s.includes('svt') || s.includes('sciences de la vie')) {
    return `- Démarche scientifique et expérimentale
- Compréhension des phénomènes biologiques et géologiques
- Rigueur dans les comptes-rendus d'expérience
- Travaux pratiques et manipulation
- Responsabilité individuelle et collective (santé, environnement)`;
  }

  if (s.includes('physique') || s.includes('chimie') || s.includes('sciences physiques')) {
    return `- Démarche scientifique et expérimentale
- Maîtrise du calcul et des unités de mesure
- Compréhension des lois physiques et chimiques
- Rigueur dans les protocoles expérimentaux
- Sécurité en travaux pratiques`;
  }

  if (s.includes('technologie') || s.includes('techno')) {
    return `- Compréhension des systèmes techniques
- Programmation et algorithmique
- Conception et modélisation
- Travail en projet et en équipe
- Créativité et résolution de problèmes techniques`;
  }

  if (s.includes('arts plastiques') || s.includes('arts pla')) {
    return `- Créativité et expression plastique personnelle
- Maîtrise des techniques artistiques
- Culture artistique et analyse d'œuvres
- Engagement et initiative dans les projets
- Capacité à expliquer sa démarche`;
  }

  if (s.includes('musique') || s.includes('education musicale')) {
    return `- Pratique vocale et/ou instrumentale
- Écoute active et culture musicale
- Créativité et expression artistique
- Participation aux projets musicaux collectifs`;
  }

  if (s.includes('eps') || s.includes('education physique') || s.includes('sport')) {
    return `- Engagement moteur et investissement physique
- Respect des règles et esprit sportif
- Progrès techniques et condition physique
- Coopération et travail d'équipe
- Gestion de l'effort et persévérance`;
  }

  if (s.includes('latin') || s.includes('grec') || s.includes('langues anciennes')) {
    return `- Maîtrise de la morphologie et de la syntaxe
- Traduction et version
- Culture et civilisation antique
- Étymologie et enrichissement du vocabulaire français`;
  }

  if (s.includes('informatique') || s.includes('numerique') || s.includes('nsi') || s.includes('snt')) {
    return `- Algorithmique et programmation
- Maîtrise des outils numériques
- Compréhension des concepts fondamentaux (données, réseaux)
- Travail en projet et résolution de problèmes`;
  }

  return `- Maîtrise des compétences fondamentales de la discipline
- Qualité du travail personnel et investissement
- Participation et engagement en cours
- Progrès et capacité à se remettre en question`;
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
      subject: rawSubject,
      classData,
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

    // Determine subject from multiple sources
    const subject = (rawSubject || classData?.subject || '').trim();
    const isDisciplinaryMode = subject.length > 0;

    const getIndividualLengthGuidance = (limit: number): string => {
      if (limit <= 300) return "CONCIS : 2-3 phrases, aller à l'essentiel.";
      if (limit <= 350) return "STANDARD : 3 phrases, équilibre synthèse et détail.";
      if (limit <= 400) return "DÉTAILLÉ : 3-4 phrases, développe les points clés.";
      if (limit <= 450) return "DÉVELOPPÉ : 4 phrases, analyse plus complète.";
      return "COMPLET : 4-5 phrases maximum, analyse détaillée.";
    };

    let systemPrompt: string;
    let userPrompt: string;

    if (isDisciplinaryMode) {
      // ═══════════════════════════════════════════
      // MODE DISCIPLINAIRE (prof de matière)
      // ═══════════════════════════════════════════
      const subjectSkills = getSubjectSkills(subject);
      const className = classData?.className || '';
      const period = classData?.trimester || trimester || '';

      console.log(`Mode disciplinaire: ${subject} | Classe: ${className} | Période: ${period}`);

      systemPrompt = `Tu es un(e) enseignant(e) de ${subject} rédigeant tes appréciations de bulletin scolaire pour ta matière uniquement.

CONTEXTE :
- Matière enseignée : ${subject}
- Classe : ${className}
- Période : ${period}

CONTRAINTE ABSOLUE DE LONGUEUR :
- L'appréciation DOIT contenir MAXIMUM ${maxCharacters} caractères (espaces et ponctuation inclus)
- Compte précisément chaque caractère
- Ne dépasse JAMAIS cette limite, même de 1 caractère
- ${getIndividualLengthGuidance(maxCharacters)}

RÈGLES STRICTES :
- Commencer OBLIGATOIREMENT par le prénom "${firstName}"
- Rédaction à la troisième personne (ne jamais tutoyer ou vouvoyer l'élève)
- Ne PAS mentionner la moyenne chiffrée (elle apparaît déjà sur PRONOTE)
- ⚠️ INTERDIT de mentionner d'autres matières que ${subject}
- ⚠️ INTERDIT de parler "des matières", "des disciplines", "de l'ensemble des enseignements"
- ⚠️ INTERDIT de se positionner comme professeur principal ou conseil de classe
- L'appréciation concerne EXCLUSIVEMENT le travail et le comportement en ${subject}
- Mentionner les compétences spécifiques de ${subject} quand c'est pertinent
- Varier le vocabulaire (pas de formule répétitive d'un élève à l'autre)
- Terminer par un conseil ou un encouragement ciblé sur ${subject}

COMPÉTENCES SPÉCIFIQUES DE ${subject.toUpperCase()} À MOBILISER :
${subjectSkills}

TONALITÉ À ADOPTER :
${toneInstruction}`;

      let profil = 'Satisfaisant';
      if (average >= 16) profil = 'Excellent';
      else if (average >= 14) profil = 'Très bon';
      else if (average >= 12) profil = 'Satisfaisant';
      else if (average >= 10) profil = 'Correct';
      else if (average >= 8) profil = 'Fragile';
      else profil = 'En difficulté';

      userPrompt = `Rédige l'appréciation de ${subject} pour cet élève.

- Prénom : ${firstName}
- Niveau en ${subject} : ${profil}
- Sérieux en classe : ${seriousness !== null && seriousness !== undefined ? (seriousness > 14 ? "très sérieux" : seriousness > 10 ? "sérieux" : seriousness > 6 ? "insuffisant" : "problématique") : 'Non renseigné'}
- Participation orale : ${participation !== null && participation !== undefined ? (participation > 14 ? "excellente" : participation > 10 ? "satisfaisante" : participation > 6 ? "insuffisante" : "quasi inexistante") : 'Non renseigné'}
- Absences : ${absences || 0}
- Devoirs non rendus : ${nonRendus || 0}
${behaviorIssue ? `- Problème de comportement : ${typeof behaviorIssue === 'string' ? behaviorIssue : 'oui'}` : ''}
${isTalkative ? `- Bavardages signalés` : ''}
${specificObservations && specificObservations.length > 0 ? `- Observations de l'enseignant : ${specificObservations.join(", ")}` : ''}

⚠️ RAPPEL : Maximum ${maxCharacters} caractères. NE PAS mentionner de notes chiffrées. Appréciation de ${subject} UNIQUEMENT.`;

    } else {
      // ═══════════════════════════════════════════
      // MODE CONSEIL DE CLASSE (code existant inchangé)
      // ═══════════════════════════════════════════
      console.log(`Mode conseil de classe (pas de matière spécifiée)`);

      systemPrompt = `Tu es un professeur principal présentant un élève devant le conseil de classe. Tu dois être PRÉCIS et FACTUEL.

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

      userPrompt = `Génère une présentation orale pour le conseil de classe :\n\n`;
      userPrompt += `═══════════════════════════════════════════════════\n`;
      userPrompt += `DONNÉES DE L'ÉLÈVE :\n`;
      userPrompt += `- Prénom : ${firstName}\n`;
      userPrompt += `- Nom : ${lastName}\n`;
      userPrompt += `- Niveau de travail : ${workLevel}\n`;
      if (seriousness !== null && seriousness !== undefined) {
        userPrompt += `- Sérieux global : ${seriousness > 14 ? "très sérieux" : seriousness > 10 ? "sérieux" : seriousness > 6 ? "insuffisant" : "problématique"}\n`;
      }
      if (participation !== null && participation !== undefined) {
        userPrompt += `- Participation globale : ${participation > 14 ? "excellente" : participation > 10 ? "satisfaisante" : participation > 6 ? "insuffisante" : "quasi inexistante"}\n`;
      }
      if (absences && absences > 0) userPrompt += `- Absences : ${absences}\n`;
      if (nonRendus && nonRendus > 0) userPrompt += `- Devoirs non rendus : ${nonRendus}\n`;
      userPrompt += `═══════════════════════════════════════════════════\n\n`;
      
      if (behaviorIssue) {
        userPrompt += `⚠️ Problème de comportement signalé : ${typeof behaviorIssue === 'string' ? behaviorIssue : 'oui'}\n`;
      }
      if (isTalkative) userPrompt += `⚠️ Signalé comme bavard\n`;
      if (specificObservations && specificObservations.length > 0) {
        userPrompt += `📝 Observations personnelles du PP : ${specificObservations.join(", ")}\n`;
      }
      
      userPrompt += `\nTon demandé : ${tone}\n`;
      userPrompt += `\n⚠️ RAPPEL : Maximum ${maxCharacters} caractères. NE PAS mentionner de notes chiffrées.`;
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
      JSON.stringify({ error: "Une erreur est survenue lors de la génération" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
