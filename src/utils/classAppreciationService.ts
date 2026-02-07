/**
 * ═══════════════════════════════════════════════════════════
 * CLASS APPRECIATION SERVICE
 * Orchestre l'analyse des thèmes et la génération de l'appréciation
 * ═══════════════════════════════════════════════════════════
 */

import { supabase } from '@/integrations/supabase/client';
import { BulletinClasseData } from '@/utils/pdfParser';
import { 
  analyzeTeacherAppreciations, 
  identifyExceptionalSubjects,
  AppreciationThemes,
  ExceptionalSubjects
} from '@/utils/appreciationThemeAnalyzer';

export type AppreciationTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

export interface GenerateAppreciationParams {
  bulletinData: BulletinClasseData;
  tone: AppreciationTone;
  maxCharacters: number;
}

export interface GenerateAppreciationResponse {
  appreciation: string;
  characterCount: number;
  maxCharacters: number;
  minCharacters: number;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Génère l'appréciation générale de la classe
 */
export async function generateClassAppreciation(
  params: GenerateAppreciationParams
): Promise<GenerateAppreciationResponse> {
  
  console.log('🚀 Génération de l\'appréciation de classe...');
  console.log(`   Tonalité : ${params.tone}`);
  console.log(`   Longueur max : ${params.maxCharacters} caractères`);
  
  // Étape 1 : Analyser les thèmes des appréciations
  const themes: AppreciationThemes = analyzeTeacherAppreciations(params.bulletinData);
  
  // Étape 2 : Identifier les matières exceptionnelles
  const exceptionalSubjects: ExceptionalSubjects = identifyExceptionalSubjects(params.bulletinData);
  
  // Étape 3 : Appeler l'Edge Function
  console.log('📡 Appel à l\'Edge Function generate-class-appreciation...');
  
  const { data, error } = await supabase.functions.invoke('generate-class-appreciation', {
    body: {
      classData: params.bulletinData,
      themes: themes,
      exceptionalSubjects: exceptionalSubjects,
      tone: params.tone,
      maxCharacters: params.maxCharacters
    }
  });
  
  if (error) {
    console.error('❌ Erreur Edge Function:', error);
    throw new Error(`Erreur lors de la génération : ${error.message}`);
  }
  
  if (!data || !data.appreciation) {
    console.error('❌ Réponse invalide de l\'Edge Function:', data);
    throw new Error('Réponse invalide du serveur');
  }
  
  console.log('✅ Appréciation générée avec succès');
  console.log(`   Longueur : ${data.characterCount}/${data.maxCharacters} caractères`);
  
  if (data.validation && !data.validation.isValid) {
    console.warn('⚠️ Validation échouée :', data.validation.errors);
  }
  
  return data as GenerateAppreciationResponse;
}

/**
 * Récupère un résumé des thèmes pour affichage (optionnel)
 */
export function getThemesSummary(themes: AppreciationThemes): string[] {
  const summary: string[] = [];
  
  if (themes.bavardages >= 5) {
    summary.push('Bavardages généralisés (signalés par la majorité des enseignants)');
  } else if (themes.bavardages >= 3) {
    summary.push('Bavardages perturbateurs');
  }
  
  if (themes.travail >= 5) {
    summary.push('Manque de travail personnel très important');
  } else if (themes.travail >= 3) {
    summary.push('Travail personnel insuffisant');
  }
  
  if (themes.passif >= 4) {
    summary.push('Passivité généralisée');
  } else if (themes.passif >= 2) {
    summary.push('Participation timide');
  }
  
  if (themes.difficile >= 5) {
    summary.push('Classe très difficile à canaliser');
  } else if (themes.difficile >= 3) {
    summary.push('Difficultés à mettre au travail');
  }
  
  if (themes.serieux >= 4) {
    summary.push('Classe sérieuse et appliquée');
  }
  
  if (themes.bonneAmbiance >= 3) {
    summary.push('Bonne ambiance de classe');
  }
  
  return summary;
}
