import { BulletinEleveData } from './pdfParser';

// Types for student analysis
export interface StudentAnalysis {
  // Results keywords and quotes
  resultsKeywords: string[];
  resultsQuotes: string[];
  
  // Seriousness and work
  seriousKeywords: string[];
  seriousQuotes: string[];
  
  // Classroom behavior
  behaviorKeywords: string[];
  behaviorQuotes: string[];
  
  // Participation
  participationKeywords: string[];
  participationQuotes: string[];
  
  // Effort and progress
  effortKeywords: string[];
  effortQuotes: string[];
  
  // Distinguished subjects (±3 points from average)
  strongSubjects: {
    matiere: string;
    moyenne: number;
    appreciation: string;
  }[];
  weakSubjects: {
    matiere: string;
    moyenne: number;
    appreciation: string;
  }[];
  
  // Recurring issues (mentioned by 3+ teachers)
  recurringIssues: {
    type: string;
    count: number;
    quotes: string[];
  }[];
}

export interface Justification {
  sentence: string;
  source: string;
  quotes: string[];
}

export interface EnrichedAppreciation {
  text: string;
  justifications: Justification[];
}

// Keyword patterns for detection
const keywordPatterns = {
  // Results
  excellent: /excellent|très bon|remarquable|brillant/i,
  bon: /bon|satisfaisant|correct|solide|résultats\s+convenables?/i,
  fragile: /fragile|faible|insuffisant|en difficulté|préoccupant/i,
  
  // Seriousness
  serieux: /sérieux|appliqué|studieux|travailleur|rigoureux/i,
  negligent: /négligent|peu sérieux|superficiel|léger|manque de rigueur/i,
  
  // Behavior
  bavard: /bavard|bavardage|dissipé|agité|perturbateur|remuant/i,
  concentre: /concentré|attentif|calme|posé/i,
  insolent: /insolent|irrespectueux|impoli|provocateur|attitude déplacée/i,
  
  // Participation
  actif: /participe|actif|volontaire|impliqué|s'investit/i,
  timide: /discret|timide|réservé|effacé/i,
  passif: /passif|absent|ne participe pas|en retrait/i,
  
  // Efforts
  progres: /progrès|progression|amélioration|en hausse|évolue positivement/i,
  stagne: /stagne|stationnaire|n'évolue pas|se maintient/i,
  regresse: /régression|baisse|recul|dégradation/i,
  
  // Work issues
  travailNonFait: /travail non fait|devoirs? non rendus?|leçons? non apprises?|travail personnel insuffisant/i,
  efforts: /fait des efforts|s'investit|motivé|efforts louables/i
};

/**
 * Analyze a student's bulletin to extract themes, keywords and relevant quotes
 */
export const analyzeStudentBulletin = (
  bulletin: BulletinEleveData,
  moyenneGenerale: number
): StudentAnalysis => {
  const analysis: StudentAnalysis = {
    resultsKeywords: [],
    resultsQuotes: [],
    seriousKeywords: [],
    seriousQuotes: [],
    behaviorKeywords: [],
    behaviorQuotes: [],
    participationKeywords: [],
    participationQuotes: [],
    effortKeywords: [],
    effortQuotes: [],
    strongSubjects: [],
    weakSubjects: [],
    recurringIssues: []
  };
  
  const issueCounters: Record<string, { count: number; quotes: string[] }> = {};
  
  // Analyze each subject's appreciation
  bulletin.matieres.forEach(matiere => {
    const appr = matiere.appreciation || '';
    if (!appr.trim()) return;
    
    const formattedQuote = `${matiere.nom}: "${appr}"`;
    
    // Results detection
    if (keywordPatterns.excellent.test(appr)) {
      analysis.resultsKeywords.push('excellent');
      analysis.resultsQuotes.push(formattedQuote);
    } else if (keywordPatterns.bon.test(appr)) {
      analysis.resultsKeywords.push('bon');
      analysis.resultsQuotes.push(formattedQuote);
    } else if (keywordPatterns.fragile.test(appr)) {
      analysis.resultsKeywords.push('fragile');
      analysis.resultsQuotes.push(formattedQuote);
    }
    
    // Seriousness detection
    if (keywordPatterns.serieux.test(appr)) {
      analysis.seriousKeywords.push('sérieux');
      analysis.seriousQuotes.push(formattedQuote);
    } else if (keywordPatterns.negligent.test(appr)) {
      analysis.seriousKeywords.push('négligent');
      analysis.seriousQuotes.push(formattedQuote);
    }
    
    // Behavior detection
    if (keywordPatterns.bavard.test(appr)) {
      analysis.behaviorKeywords.push('bavard');
      analysis.behaviorQuotes.push(formattedQuote);
      
      // Track for recurring issues
      if (!issueCounters['bavardages']) {
        issueCounters['bavardages'] = { count: 0, quotes: [] };
      }
      issueCounters['bavardages'].count++;
      issueCounters['bavardages'].quotes.push(formattedQuote);
    }
    if (keywordPatterns.insolent.test(appr)) {
      analysis.behaviorKeywords.push('insolent');
      analysis.behaviorQuotes.push(formattedQuote);
      
      if (!issueCounters['insolence']) {
        issueCounters['insolence'] = { count: 0, quotes: [] };
      }
      issueCounters['insolence'].count++;
      issueCounters['insolence'].quotes.push(formattedQuote);
    }
    if (keywordPatterns.concentre.test(appr)) {
      analysis.behaviorKeywords.push('concentré');
      analysis.behaviorQuotes.push(formattedQuote);
    }
    
    // Participation detection
    if (keywordPatterns.actif.test(appr)) {
      analysis.participationKeywords.push('actif');
      analysis.participationQuotes.push(formattedQuote);
    } else if (keywordPatterns.timide.test(appr)) {
      analysis.participationKeywords.push('timide');
      analysis.participationQuotes.push(formattedQuote);
    } else if (keywordPatterns.passif.test(appr)) {
      analysis.participationKeywords.push('passif');
      analysis.participationQuotes.push(formattedQuote);
    }
    
    // Effort detection
    if (keywordPatterns.progres.test(appr)) {
      analysis.effortKeywords.push('progrès');
      analysis.effortQuotes.push(formattedQuote);
    } else if (keywordPatterns.regresse.test(appr)) {
      analysis.effortKeywords.push('régression');
      analysis.effortQuotes.push(formattedQuote);
    } else if (keywordPatterns.stagne.test(appr)) {
      analysis.effortKeywords.push('stagne');
      analysis.effortQuotes.push(formattedQuote);
    }
    
    // Work not done detection
    if (keywordPatterns.travailNonFait.test(appr)) {
      if (!issueCounters['travail non fait']) {
        issueCounters['travail non fait'] = { count: 0, quotes: [] };
      }
      issueCounters['travail non fait'].count++;
      issueCounters['travail non fait'].quotes.push(formattedQuote);
    }
    
    // Distinguished subjects (±3 points from average)
    const ecart = matiere.moyenneEleve - moyenneGenerale;
    if (ecart >= 3) {
      analysis.strongSubjects.push({
        matiere: matiere.nom,
        moyenne: matiere.moyenneEleve,
        appreciation: appr
      });
    } else if (ecart <= -3) {
      analysis.weakSubjects.push({
        matiere: matiere.nom,
        moyenne: matiere.moyenneEleve,
        appreciation: appr
      });
    }
  });
  
  // Sort distinguished subjects
  analysis.strongSubjects.sort((a, b) => b.moyenne - a.moyenne);
  analysis.weakSubjects.sort((a, b) => a.moyenne - b.moyenne);
  
  // Identify recurring issues (mentioned by 2+ teachers)
  Object.entries(issueCounters).forEach(([type, data]) => {
    if (data.count >= 2) {
      analysis.recurringIssues.push({
        type,
        count: data.count,
        quotes: data.quotes
      });
    }
  });
  
  return analysis;
};

/**
 * Format a number with French decimal notation
 */
const formatFrenchNumber = (num: number): string => {
  return num.toFixed(2).replace('.', ',');
};

/**
 * Generate an enriched appreciation with justifications
 */
export const generateLocalAppreciation = (
  bulletin: BulletinEleveData,
  analysis: StudentAnalysis,
  moyenneGenerale: number,
  moyennePrecedente?: number,
  trimestre?: number
): EnrichedAppreciation => {
  const sentences: string[] = [];
  const justifications: Justification[] = [];
  const prenom = bulletin.prenom;
  
  // === SENTENCE 1: EVOLUTION (if 2nd or 3rd trimester) ===
  if (moyennePrecedente !== undefined && trimestre && trimestre > 1) {
    const evolution = moyenneGenerale - moyennePrecedente;
    
    if (evolution > 1) {
      const sentence = `${prenom} progresse avec une moyenne en hausse de ${formatFrenchNumber(Math.abs(evolution))} points par rapport au trimestre précédent.`;
      sentences.push(sentence);
      justifications.push({
        sentence,
        source: "Comparaison des moyennes",
        quotes: [
          `Trimestre ${trimestre - 1}: ${formatFrenchNumber(moyennePrecedente)}`,
          `Trimestre ${trimestre}: ${formatFrenchNumber(moyenneGenerale)}`
        ]
      });
    } else if (evolution < -1) {
      const sentence = `${prenom} voit sa moyenne baisser de ${formatFrenchNumber(Math.abs(evolution))} points, ce qui est préoccupant.`;
      sentences.push(sentence);
      justifications.push({
        sentence,
        source: "Comparaison des moyennes",
        quotes: [
          `Trimestre ${trimestre - 1}: ${formatFrenchNumber(moyennePrecedente)}`,
          `Trimestre ${trimestre}: ${formatFrenchNumber(moyenneGenerale)}`
        ]
      });
    } else {
      const sentence = `${prenom} maintient ses résultats par rapport au trimestre précédent.`;
      sentences.push(sentence);
      justifications.push({
        sentence,
        source: "Comparaison des moyennes",
        quotes: [`Évolution: ${evolution > 0 ? '+' : ''}${formatFrenchNumber(evolution)} points`]
      });
    }
  }
  
  // === SENTENCE 2: GENERAL RESULTS ===
  const positiveResults = analysis.resultsKeywords.filter(k => k === 'excellent' || k === 'bon').length;
  const negativeResults = analysis.resultsKeywords.filter(k => k === 'fragile').length;
  
  let resultsText = "";
  let resultsQuotes: string[] = [];
  
  if (positiveResults > negativeResults * 2) {
    resultsText = "Les résultats sont satisfaisants dans l'ensemble des disciplines.";
    resultsQuotes = analysis.resultsQuotes.filter(q => 
      q.toLowerCase().includes('bon') || 
      q.toLowerCase().includes('satisfaisant') ||
      q.toLowerCase().includes('excellent')
    ).slice(0, 3);
  } else if (negativeResults > positiveResults) {
    resultsText = "Les résultats sont fragiles et nécessitent davantage de travail.";
    resultsQuotes = analysis.resultsQuotes.filter(q => 
      q.toLowerCase().includes('fragile') || 
      q.toLowerCase().includes('insuffisant')
    ).slice(0, 3);
  } else {
    resultsText = "Les résultats sont corrects mais inégaux selon les matières.";
    resultsQuotes = [
      ...analysis.resultsQuotes.filter(q => q.toLowerCase().includes('bon')).slice(0, 2),
      ...analysis.resultsQuotes.filter(q => q.toLowerCase().includes('fragile')).slice(0, 1)
    ];
  }
  
  if (resultsText) {
    sentences.push(resultsText);
    if (resultsQuotes.length > 0) {
      justifications.push({
        sentence: resultsText,
        source: "Appréciations des professeurs",
        quotes: resultsQuotes
      });
    }
  }
  
  // === SENTENCE 3: SERIOUSNESS AND WORK ===
  const serious = analysis.seriousKeywords.filter(k => k === 'sérieux').length;
  const negligent = analysis.seriousKeywords.filter(k => k === 'négligent').length;
  
  let workText = "";
  let workQuotes: string[] = [];
  
  if (serious >= 2) {
    workText = "Le travail est sérieux et régulier.";
    workQuotes = analysis.seriousQuotes.filter(q => 
      q.toLowerCase().includes('sérieux') || 
      q.toLowerCase().includes('appliqué')
    ).slice(0, 3);
  } else if (negligent >= 2) {
    workText = "Le travail manque de sérieux et de régularité.";
    workQuotes = analysis.seriousQuotes.filter(q => 
      q.toLowerCase().includes('négligent') || 
      q.toLowerCase().includes('superficiel')
    ).slice(0, 3);
  }
  
  // Work not done issue
  const workNotDone = analysis.recurringIssues.find(i => i.type === 'travail non fait');
  if (workNotDone && workNotDone.count >= 2) {
    if (workText) {
      workText = workText.replace('.', ', et le travail personnel n\'est pas toujours effectué.');
    } else {
      workText = "Le travail personnel n'est pas toujours effectué.";
    }
    workQuotes.push(...workNotDone.quotes.slice(0, 2));
  }
  
  if (workText) {
    sentences.push(workText);
    if (workQuotes.length > 0) {
      justifications.push({
        sentence: workText,
        source: "Sérieux dans le travail",
        quotes: workQuotes
      });
    }
  }
  
  // === SENTENCE 4: CLASSROOM BEHAVIOR ===
  let behaviorText = "";
  let behaviorQuotes: string[] = [];
  
  const bavardages = analysis.recurringIssues.find(i => i.type === 'bavardages');
  const insolence = analysis.recurringIssues.find(i => i.type === 'insolence');
  
  if (bavardages && bavardages.count >= 2) {
    behaviorText = "Des bavardages récurrents perturbent le travail en classe.";
    behaviorQuotes = bavardages.quotes.slice(0, 3);
  }
  
  if (insolence && insolence.count >= 2) {
    if (behaviorText) {
      behaviorText = behaviorText.replace('.', ' et des attitudes d\'insolence sont à déplorer.');
    } else {
      behaviorText = "Des attitudes d'insolence sont à déplorer.";
    }
    behaviorQuotes.push(...insolence.quotes.slice(0, 2));
  }
  
  // Participation (if no behavior issues)
  if (!behaviorText) {
    const activeParticipation = analysis.participationKeywords.filter(k => k === 'actif').length;
    const passiveParticipation = analysis.participationKeywords.filter(k => k === 'passif' || k === 'timide').length;
    
    if (activeParticipation >= 2) {
      behaviorText = "La participation en classe est active et volontaire.";
      behaviorQuotes = analysis.participationQuotes.filter(q => 
        q.toLowerCase().includes('participe') || 
        q.toLowerCase().includes('actif') ||
        q.toLowerCase().includes('volontaire')
      ).slice(0, 3);
    } else if (passiveParticipation >= 2) {
      behaviorText = "La participation gagnerait à être plus fréquente.";
      behaviorQuotes = analysis.participationQuotes.filter(q => 
        q.toLowerCase().includes('timide') || 
        q.toLowerCase().includes('discret') ||
        q.toLowerCase().includes('passif')
      ).slice(0, 3);
    }
  }
  
  if (behaviorText) {
    sentences.push(behaviorText);
    if (behaviorQuotes.length > 0) {
      justifications.push({
        sentence: behaviorText,
        source: "Comportement en classe",
        quotes: behaviorQuotes
      });
    }
  }
  
  // === SENTENCE 5: ATTENDANCE (if significant) ===
  const absences = bulletin.absences || 0;
  const retards = bulletin.retards || 0;
  
  if (absences > 10) {
    const absenceText = `L'assiduité est insuffisante avec ${absences} demi-journées d'absence.`;
    sentences.push(absenceText);
    justifications.push({
      sentence: absenceText,
      source: "Assiduité",
      quotes: [`${absences} demi-journées d'absence enregistrées`]
    });
  } else if (retards >= 5) {
    const retardText = `La ponctualité doit être améliorée (${retards} retards).`;
    sentences.push(retardText);
    justifications.push({
      sentence: retardText,
      source: "Ponctualité",
      quotes: [`${retards} retards enregistrés`]
    });
  }
  
  // === SENTENCE 6: DISTINGUISHED SUBJECTS ===
  if (analysis.strongSubjects.length > 0) {
    const topSubject = analysis.strongSubjects[0];
    const subjectText = `${topSubject.matiere} est particulièrement réussi.`;
    sentences.push(subjectText);
    justifications.push({
      sentence: subjectText,
      source: "Matières distinguées",
      quotes: [
        `${topSubject.matiere}: ${formatFrenchNumber(topSubject.moyenne)}/20`,
        topSubject.appreciation ? `"${topSubject.appreciation}"` : ''
      ].filter(Boolean)
    });
  } else if (analysis.weakSubjects.length > 0) {
    const weakSubject = analysis.weakSubjects[0];
    const subjectText = `Un effort particulier est attendu en ${weakSubject.matiere}.`;
    sentences.push(subjectText);
    justifications.push({
      sentence: subjectText,
      source: "Matières en difficulté",
      quotes: [
        `${weakSubject.matiere}: ${formatFrenchNumber(weakSubject.moyenne)}/20`,
        weakSubject.appreciation ? `"${weakSubject.appreciation}"` : ''
      ].filter(Boolean)
    });
  }
  
  // === SENTENCE 7: EFFORTS (if mentioned) ===
  const progres = analysis.effortKeywords.filter(k => k === 'progrès').length;
  if (progres >= 2) {
    const effortText = "Des efforts sont à souligner et méritent d'être poursuivis.";
    sentences.push(effortText);
    justifications.push({
      sentence: effortText,
      source: "Efforts constatés",
      quotes: analysis.effortQuotes.slice(0, 3)
    });
  }
  
  return {
    text: sentences.join(' '),
    justifications
  };
};

/**
 * Build analysis data to send to the AI for enhanced generation
 */
export const buildAnalysisContext = (
  bulletin: BulletinEleveData,
  analysis: StudentAnalysis,
  moyenneGenerale: number
): {
  analysisContext: string;
  localJustifications: Justification[];
} => {
  const localResult = generateLocalAppreciation(
    bulletin,
    analysis,
    moyenneGenerale,
    undefined,
    undefined
  );
  
  const contextParts: string[] = [];
  
  // Add results context
  if (analysis.resultsQuotes.length > 0) {
    contextParts.push(`Résultats: ${analysis.resultsQuotes.slice(0, 3).join(' | ')}`);
  }
  
  // Add seriousness context
  if (analysis.seriousQuotes.length > 0) {
    contextParts.push(`Travail: ${analysis.seriousQuotes.slice(0, 3).join(' | ')}`);
  }
  
  // Add behavior context
  if (analysis.behaviorQuotes.length > 0) {
    contextParts.push(`Comportement: ${analysis.behaviorQuotes.slice(0, 3).join(' | ')}`);
  }
  
  // Add recurring issues
  if (analysis.recurringIssues.length > 0) {
    const issues = analysis.recurringIssues.map(i => 
      `${i.type} (mentionné ${i.count} fois)`
    ).join(', ');
    contextParts.push(`Problèmes récurrents: ${issues}`);
  }
  
  // Add distinguished subjects
  if (analysis.strongSubjects.length > 0) {
    contextParts.push(`Points forts: ${analysis.strongSubjects.map(s => `${s.matiere} (${formatFrenchNumber(s.moyenne)})`).join(', ')}`);
  }
  if (analysis.weakSubjects.length > 0) {
    contextParts.push(`Points faibles: ${analysis.weakSubjects.map(s => `${s.matiere} (${formatFrenchNumber(s.moyenne)})`).join(', ')}`);
  }
  
  return {
    analysisContext: contextParts.join('\n'),
    localJustifications: localResult.justifications
  };
};
