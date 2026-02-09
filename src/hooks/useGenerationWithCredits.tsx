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
  error?: Error | string;
  wasFree?: boolean;
}

/**
 * Hook that wraps AI generation functions with SERVER-SIDE credit checking
 * All credit validation happens on the server to prevent bypass
 */
export function useGenerationWithCredits(options: UseGenerationWithCreditsOptions) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { canGenerate, consumeCreditsServer, getFreeRegenerationsRemaining } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Execute a generation function with SERVER-SIDE credit checking
   * Credits are consumed BEFORE the generation is executed
   */
  const executeWithCredits = useCallback(async (
    cost: number,
    generateFn: () => Promise<unknown>,
    metadata?: Record<string, unknown>
  ): Promise<GenerationResult> => {
    // Step 1: Check authentication (UI-level check)
    if (!isAuthenticated) {
      openAuthModal();
      return { success: false, error: 'AUTH_REQUIRED' };
    }

    // Step 2: UI hint - quick client-side check (real validation is server-side)
    if (!canGenerate(cost)) {
      setShowUpgradeModal(true);
      return { success: false, error: 'NO_CREDITS' };
    }

    setIsProcessing(true);

    try {
      // Step 3: SERVER-SIDE credit consumption (CRITICAL - this is the real check)
      const creditResult = await consumeCreditsServer(
        cost,
        options.tool,
        options.action,
        options.classId,
        metadata
      );

      if (!creditResult.success) {
        if (creditResult.error === 'NO_CREDITS') {
          setShowUpgradeModal(true);
        } else if (creditResult.error === 'AUTH_REQUIRED') {
          openAuthModal();
        }
        return { success: false, error: creditResult.error };
      }

      // Step 4: Execute the actual generation (only after server confirmed credits)
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
  }, [isAuthenticated, openAuthModal, canGenerate, consumeCreditsServer, options]);

  /**
   * Execute a regeneration with SERVER-SIDE free regeneration checking
   */
  const executeRegeneration = useCallback(async (
    type: 'appreciation' | 'bilan',
    generateFn: () => Promise<unknown>
  ): Promise<GenerationResult> => {
    // Step 1: Check authentication
    if (!isAuthenticated) {
      openAuthModal();
      return { success: false, error: 'AUTH_REQUIRED' };
    }

    const classId = options.classId || 'default';
    const cost = type === 'bilan' ? 5 : 1;

    setIsProcessing(true);

    try {
      // Step 2: SERVER-SIDE regeneration check (handles free vs paid automatically)
      const creditResult = await consumeCreditsServer(
        cost,
        options.tool,
        'regeneration',
        classId,
        { type },
        true, // isRegeneration
        type  // regenerationType
      );

      if (!creditResult.success) {
        if (creditResult.error === 'NO_CREDITS') {
          setShowUpgradeModal(true);
        } else if (creditResult.error === 'AUTH_REQUIRED') {
          openAuthModal();
        }
        return { success: false, error: creditResult.error };
      }

      // Step 3: Execute the actual generation
      const result = await generateFn();
      return { success: true, data: result, wasFree: creditResult.wasFree };
    } catch (error) {
      console.error('Regeneration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, openAuthModal, consumeCreditsServer, options]);

  /**
   * Check how many free regenerations remain for this class (UI hint only)
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

