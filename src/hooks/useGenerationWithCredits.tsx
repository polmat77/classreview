import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { UpgradeModal } from '@/components/credits/UpgradeModal';

interface UseGenerationWithCreditsOptions {
  tool: 'reportcard' | 'classcouncil' | 'quizmaster';
  action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration';
  classId?: string;
}

interface GenerationResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  wasFree?: boolean;
}

/**
 * Hook that wraps AI generation functions with credit checking
 * Handles authentication, credit verification, consumption, and upgrade modal
 */
export function useGenerationWithCredits(options: UseGenerationWithCreditsOptions) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { canGenerate, consumeCredits, consumeRegeneration, getFreeRegenerationsRemaining } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Execute a generation function with credit checking
   */
  const executeWithCredits = useCallback(async (
    cost: number,
    generateFn: () => Promise<unknown>,
    metadata?: Record<string, unknown>
  ): Promise<GenerationResult> => {
    // Step 1: Check authentication
    if (!isAuthenticated) {
      openAuthModal();
      return { success: false };
    }

    // Step 2: Check credits
    if (!canGenerate(cost)) {
      setShowUpgradeModal(true);
      return { success: false };
    }

    setIsProcessing(true);

    try {
      // Step 3: Consume credits BEFORE generation
      const creditSuccess = await consumeCredits(
        cost,
        options.tool,
        options.action,
        options.classId,
        metadata
      );

      if (!creditSuccess) {
        setShowUpgradeModal(true);
        return { success: false };
      }

      // Step 4: Execute the actual generation
      const result = await generateFn();
      return { success: true, data: result };
    } catch (error) {
      console.error('Generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, openAuthModal, canGenerate, consumeCredits, options]);

  /**
   * Execute a regeneration with free regeneration checking
   */
  const executeRegeneration = useCallback(async (
    type: 'appreciation' | 'bilan',
    generateFn: () => Promise<unknown>
  ): Promise<GenerationResult> => {
    // Step 1: Check authentication
    if (!isAuthenticated) {
      openAuthModal();
      return { success: false };
    }

    const classId = options.classId || 'default';
    const cost = type === 'bilan' ? 5 : 1;

    setIsProcessing(true);

    try {
      // Step 2: Attempt regeneration (handles free vs paid automatically)
      const { success, isFree } = await consumeRegeneration(classId, type, options.tool);

      if (!success) {
        // Check if it's because of no credits
        if (!canGenerate(cost)) {
          setShowUpgradeModal(true);
        }
        return { success: false };
      }

      // Step 3: Execute the actual generation
      const result = await generateFn();
      return { success: true, data: result, wasFree: isFree };
    } catch (error) {
      console.error('Regeneration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, openAuthModal, consumeRegeneration, canGenerate, options]);

  /**
   * Check how many free regenerations remain for this class
   */
  const checkFreeRegenerations = useCallback((type: 'appreciation' | 'bilan'): number => {
    const classId = options.classId || 'default';
    return getFreeRegenerationsRemaining(classId, type);
  }, [getFreeRegenerationsRemaining, options.classId]);

  /**
   * Render the upgrade modal (must be included in component JSX)
   */
  const UpgradeModalComponent = useCallback(() => (
    <UpgradeModal 
      open={showUpgradeModal} 
      onClose={() => setShowUpgradeModal(false)} 
    />
  ), [showUpgradeModal]);

  return {
    executeWithCredits,
    executeRegeneration,
    checkFreeRegenerations,
    isProcessing,
    showUpgradeModal,
    setShowUpgradeModal,
    UpgradeModalComponent,
  };
}

export default useGenerationWithCredits;
