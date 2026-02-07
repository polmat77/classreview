/**
 * ═══════════════════════════════════════════════════════════
 * APPRECIATION THEME ANALYZER
 * Analyse les appréciations des professeurs pour extraire
 * les thèmes récurrents (bavardages, travail, passivité, etc.)
 * ═══════════════════════════════════════════════════════════
 */

import { BulletinClasseData } from "./pdfParser";

export interface AppreciationThemes {
  // Résultats scolaires
  solide: number; // Résultats satisfaisants
  fragile: number; // Résultats faibles
  heterogene: number; // Disparités entre élèves
  progressif: number; // Progression observée

  // Ambiance de travail
  serieux: number; // Classe sérieuse, appliquée
  bavardages: number; // Bavardages perturbateurs
  participation: number; // Participation active
  passif: number; // Passivité, manque d'engagement oral
  concentration: number; // Bonne concentration
  travail: number; // Manque de travail personnel
  investissement: number; // Bon investissement
  difficile: number; // Difficile à mettre au travail / à canaliser

  // Relations et climat
  bonneAmbiance: number; // Bonne ambiance, climat agréable
  cohesion: number; // Cohésion du groupe
  tensions: number; // Tensions relationnelles
  respect: number; // Respect mutuel

  // Points d'attention
  absences: number; // Absentéisme
  retards: number; // Retards
  comportement: number; // Problèmes de comportement
}

export interface ExceptionalSubjects {
  exceptional: string[]; // Matières où la classe excelle
  struggling: string[]; // Matières en difficulté
}

/**
 * Dictionnaire de mots-clés pour chaque thème
 */
const THEME_KEYWORDS = {
  // Résultats scolaires
  solide: [
    /r[eé]sultats?\s+(?:tr[èe]s\s+)?(?:satisfaisants?|corrects?|bons?|solides?)/gi,
    /\bbon(?:s|ne)?\s+(?:niveau|r[eé]sultats?)/gi,
    /\br[eé]ussissent?\s+bien/gi,
    /\bperformances?\s+satisfaisantes?/gi,
  ],
  fragile: [
    /r[eé]sultats?\s+(?:tr[èe]s\s+)?(?:fragiles?|faibles?|insuffisants?|pr[eé]occupants?)/gi,
    /\bdifficult[eé]s?\s+(?:importantes?|majeures?)/gi,
    /\ben\s+(?:grandes?\s+)?difficult[eé]/gi,
    /\blacunes?/gi,
    /\bniveau\s+(?:faible|insuffisant)/gi,
  ],
  heterogene: [
    /h[eé]t[eé]rog[èe]ne/gi,
    /\bdisparit[eé]s?/gi,
    /\b[eé]carts?\s+(?:importants?|entre\s+[eé]l[èe]ves)/gi,
    /\bprofils?\s+(?:tr[èe]s\s+)?diff[eé]rents?/gi,
    /\binvestissement\s+(?:variable|in[eé]gal)/gi,
  ],
  progressif: [
    /\bprogress(?:ion|if|e)/gi,
    /\bam[eé]liorat(?:ion|e)/gi,
    /\b[eé]volue(?:nt)?\s+(?:positivement|bien)/gi,
    /\ben\s+(?:bonne\s+)?voie/gi,
  ],

  // Ambiance de travail
  serieux: [
    /\bs[eé]rieu(?:x|se)/gi,
    /\bappliqu[eé](?:e|s)?/gi,
    /\bconscien(?:t|cieu)(?:x|se)/gi,
    /\brigueur/gi,
    /\bm[eé]thodique/gi,
  ],
  bavardages: [
    /\bbavard(?:age|e)s?/gi,
    /\bagit[eé](?:e|s)?/gi,
    /\bdissip[eé](?:e|s)?/gi,
    /\bbruyant(?:e|s)?/gi,
    /\bperturb(?:ant|e|ations?)/gi,
    /\bprises?\s+de\s+parole\s+anarchiques?/gi,
    /\btr[oe]p\s+de\s+bruit/gi,
  ],
  participation: [
    /\bparticip(?:e|ation)/gi,
    /\bvolontaire/gi,
    /\b[aà]\s+l['']?[eé]coute/gi,
    /\bs['']?impliqu(?:e|ent)/gi,
    /\bactif(?:s|ve)?/gi,
    /\bengag[eé](?:e|s)?/gi,
  ],
  passif: [
    /\bpassi(?:f|ve)(?:s|it[eé])?/gi,
    /\ben\s+retrait/gi,
    /\btimide(?:s)?/gi,
    /\bsilencieu(?:x|se)/gi,
    /\bmanque\s+(?:d[''])?(?:implication|engagement)/gi,
    /\bpeu\s+(?:impliqu[eé]|engag[eé])/gi,
  ],
  concentration: [/\bconcentr(?:ation|[eé])/gi, /\battent(?:if|ive)(?:s)?/gi, /\bfocus(?:alis[eé])?/gi],
  travail: [
    /\bmanque\s+de\s+travail/gi,
    /\btravail\s+(?:personnel\s+)?(?:insuffisant|faible|superficiel)/gi,
    /\bdevoirs?\s+non\s+(?:faits?|rendus?)/gi,
    /\bmanque\s+de\s+(?:rigueur|s[eé]rieux)/gi,
    /\bn['']?ont?\s+aucune\s+envie\s+de\s+progresser/gi,
    /\bpas\s+(?:assez\s+de\s+)?travail/gi,
  ],
  investissement: [
    /\binvest(?:i|issement)/gi,
    /\bimpliqu[eé](?:e|s)?\s+dans/gi,
    /\bmotiv[eé](?:e|s)?/gi,
    /\bs['']?engage(?:nt)?/gi,
  ],
  difficile: [
    /\bdifficile\s+[aà]\s+(?:canaliser|mettre\s+au\s+travail|faire\s+cours)/gi,
    /\bdifficile\s+[aà]\s+mobiliser/gi,
    /\b[eé]puisant\s+de\s+faire\s+cours/gi,
    /\bpeine\s+[aà]\s+se\s+concentrer/gi,
    /\bne\s+savent?\s+pas\s+pourquoi\s+ils?\s+viennent?/gi,
  ],

  // Relations et climat
  bonneAmbiance: [
    /\bbonne\s+ambiance/gi,
    /\bagr[eé]able/gi,
    /\bplaisant(?:e)?\s+[aà]\s+enseigner/gi,
    /\bclimat\s+(?:serein|positif)/gi,
  ],
  cohesion: [/\bcoh[eé]sion/gi, /\bsolidaire/gi, /\bentraide/gi, /\besp(?:rit|rit)\s+(?:de\s+)?(?:groupe|classe)/gi],
  tensions: [/\btensions?/gi, /\bconflits?/gi, /\banimosit[eé]/gi, /\brelations?\s+tendues?/gi],
  respect: [/\brespectueu(?:x|se)/gi, /\bbienveill(?:ant|ance)/gi, /\brelations?\s+saines?/gi],

  // Points d'attention
  absences: [/\babsent(?:s|ce|[eé]isme)/gi, /\bmanque\s+d['']?assiduit[eé]/gi],
  retards: [/\bretards?/gi, /\bponctualit[eé]/gi],
  comportement: [
    /\bcomportement/gi,
    /\bdiscipline/gi,
    /\binsolenc(?:e|t)/gi,
    /\bmanque\s+de\s+respect/gi,
    /\br[èe]gles?\s+(?:non\s+)?respect[eé]es?/gi,
  ],
};

/**
 * Compte les occurrences d'un thème dans les appréciations
 */
function countThemeOccurrences(appreciations: string[], keywords: RegExp[]): number {
  let count = 0;

  for (const appreciation of appreciations) {
    for (const regex of keywords) {
      if (regex.test(appreciation)) {
        count++;
        break; // Ne compter qu'une fois par appréciation (même si plusieurs keywords matchent)
      }
    }
  }

  return count;
}

/**
 * Analyse les appréciations des professeurs et extrait les thèmes
 */
export function analyzeTeacherAppreciations(bulletinData: BulletinClasseData): AppreciationThemes {
  // Extraire toutes les appréciations
  const appreciations = bulletinData.matieres.map((m) => m.appreciation.toLowerCase());

  console.log("📊 Analyse thématique des appréciations...");
  console.log(`   Nombre d'appréciations à analyser : ${appreciations.length}`);

  // Compter les occurrences de chaque thème
  const themes: AppreciationThemes = {
    solide: countThemeOccurrences(appreciations, THEME_KEYWORDS.solide),
    fragile: countThemeOccurrences(appreciations, THEME_KEYWORDS.fragile),
    heterogene: countThemeOccurrences(appreciations, THEME_KEYWORDS.heterogene),
    progressif: countThemeOccurrences(appreciations, THEME_KEYWORDS.progressif),

    serieux: countThemeOccurrences(appreciations, THEME_KEYWORDS.serieux),
    bavardages: countThemeOccurrences(appreciations, THEME_KEYWORDS.bavardages),
    participation: countThemeOccurrences(appreciations, THEME_KEYWORDS.participation),
    passif: countThemeOccurrences(appreciations, THEME_KEYWORDS.passif),
    concentration: countThemeOccurrences(appreciations, THEME_KEYWORDS.concentration),
    travail: countThemeOccurrences(appreciations, THEME_KEYWORDS.travail),
    investissement: countThemeOccurrences(appreciations, THEME_KEYWORDS.investissement),
    difficile: countThemeOccurrences(appreciations, THEME_KEYWORDS.difficile),

    bonneAmbiance: countThemeOccurrences(appreciations, THEME_KEYWORDS.bonneAmbiance),
    cohesion: countThemeOccurrences(appreciations, THEME_KEYWORDS.cohesion),
    tensions: countThemeOccurrences(appreciations, THEME_KEYWORDS.tensions),
    respect: countThemeOccurrences(appreciations, THEME_KEYWORDS.respect),

    absences: countThemeOccurrences(appreciations, THEME_KEYWORDS.absences),
    retards: countThemeOccurrences(appreciations, THEME_KEYWORDS.retards),
    comportement: countThemeOccurrences(appreciations, THEME_KEYWORDS.comportement),
  };

  // Log des thèmes les plus fréquents
  const sortedThemes = Object.entries(themes)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedThemes.length > 0) {
    console.log("   Top 5 thèmes détectés :");
    sortedThemes.forEach(([theme, count]) => {
      console.log(`     - ${theme}: ${count} mention(s)`);
    });
  } else {
    console.log("   ⚠️ Aucun thème détecté dans les appréciations");
  }

  return themes;
}

/**
 * Identifie les matières exceptionnelles (très bonnes ou très faibles)
 */
export function identifyExceptionalSubjects(bulletinData: BulletinClasseData): ExceptionalSubjects {
  if (bulletinData.matieres.length === 0) {
    return { exceptional: [], struggling: [] };
  }

  // Calculer la moyenne générale
  const moyenneGenerale = bulletinData.matieres.reduce((sum, m) => sum + m.moyenne, 0) / bulletinData.matieres.length;

  // Seuils : +/- 2 points par rapport à la moyenne
  const seuilExceptionnel = moyenneGenerale + 2;
  const seuilDifficile = moyenneGenerale - 2;

  const exceptional: string[] = [];
  const struggling: string[] = [];

  for (const matiere of bulletinData.matieres) {
    if (matiere.moyenne >= seuilExceptionnel) {
      exceptional.push(matiere.nom);
    } else if (matiere.moyenne <= seuilDifficile) {
      struggling.push(matiere.nom);
    }
  }

  console.log("📊 Matières exceptionnelles :");
  if (exceptional.length > 0) {
    console.log(`   ✅ Points forts (>${seuilExceptionnel.toFixed(1)}) : ${exceptional.join(", ")}`);
  }
  if (struggling.length > 0) {
    console.log(`   ⚠️ Difficultés (<${seuilDifficile.toFixed(1)}) : ${struggling.join(", ")}`);
  }

  return { exceptional, struggling };
}
