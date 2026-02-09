import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCost {
  tool: 'reportcard' | 'classcouncil' | 'quizmaster';
  action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration';
  students: number;
  classId?: string;
}

// Limits for free regenerations (for UI display only - actual check is server-side)
const FREE_REGEN_LIMITS = {
  appreciation: 3,
  bilan: 1,
};

// Minimum balance before blocking (for UI hint only - actual check is server-side)
const MIN_BALANCE = -5;

interface ServerConsumeResponse {
  success: boolean;
  error?: 'AUTH_REQUIRED' | 'NO_CREDITS' | 'PROFILE_NOT_FOUND' | 'UPDATE_FAILED' | 'RACE_CONDITION' | 'INTERNAL_ERROR';
  message?: string;
  credits_used?: number;
  was_free_regeneration?: boolean;
  balance?: number;
  new_balance?: {
    free_remaining: number;
    paid_remaining: number;
    total: number;
  };
}

export function useCredits() {
  const { profile, isAuthenticated, refreshProfile, openAuthModal } = useAuth();

  // Balance calculations (for UI display only)
  const freeRemaining = profile?.free_students_remaining ?? 0;
  const paidBalance = profile?.students_balance ?? 0;
  const totalBalance = freeRemaining + paidBalance;

  // Check if user can perform an action (UI hint only - real check is server-side)
  const canGenerate = useCallback((cost: number): boolean => {
    if (!isAuthenticated) return false;
    
    // Allow if user has at least 1 student remaining
    if (totalBalance >= 1) return true;
    
    return false;
  }, [isAuthenticated, totalBalance]);

  // Get remaining free regenerations for a class (UI hint only)
  const getFreeRegenerationsRemaining = useCallback((classId: string, type: 'appreciation' | 'bilan'): number => {
    if (!profile) return 0;
    
    const freeRegens = profile.free_regenerations_used as Record<string, number> || {};
    const key = `${classId}_${type === 'appreciation' ? 'appreciations' : 'bilan'}`;
    const used = freeRegens[key] || 0;
    const limit = FREE_REGEN_LIMITS[type];
    
    return Math.max(0, limit - used);
  }, [profile]);

  /**
   * CRITICAL: Server-side credit consumption
   * This is the ONLY way to consume credits - all validation happens server-side
   */
  const consumeCreditsServer = useCallback(async (
    cost: number,
    tool: 'reportcard' | 'classcouncil' | 'quizmaster',
    action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration',
    classId?: string,
    metadata?: Record<string, unknown>,
    isRegeneration?: boolean,
    regenerationType?: 'appreciation' | 'bilan'
  ): Promise<{ success: boolean; wasFree?: boolean; error?: string }> => {
    if (!isAuthenticated) {
      openAuthModal();
      return { success: false, error: 'AUTH_REQUIRED' };
    }

    try {
      const { data, error } = await supabase.functions.invoke<ServerConsumeResponse>('check-and-consume-credits', {
        body: {
          tool,
          action,
          students_cost: cost,
          class_id: classId || null,
          is_regeneration: isRegeneration || false,
          regeneration_type: regenerationType || null,
          metadata,
        },
      });

      if (error) {
        console.error('Server credit check error:', error);
        return { success: false, error: 'INTERNAL_ERROR' };
      }

      if (!data?.success) {
        console.log('Credit consumption denied:', data?.error, data?.message);
        return { 
          success: false, 
          error: data?.error || 'UNKNOWN_ERROR',
          wasFree: false 
        };
      }

      // Refresh profile to get updated balances
      await refreshProfile();

      return { 
        success: true, 
        wasFree: data.was_free_regeneration || false 
      };
    } catch (err) {
      console.error('Error calling credit server:', err);
      return { success: false, error: 'INTERNAL_ERROR' };
    }
  }, [isAuthenticated, openAuthModal, refreshProfile]);

  /**
   * Consume credits for an action
   * @deprecated Use consumeCreditsServer for all new code
   */
  const consumeCredits = useCallback(async (
    cost: number,
    tool: string,
    action: string,
    classId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<boolean> => {
    const result = await consumeCreditsServer(
      cost,
      tool as 'reportcard' | 'classcouncil' | 'quizmaster',
      action as 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration',
      classId,
      metadata
    );
    return result.success;
  }, [consumeCreditsServer]);

  /**
   * Consume a regeneration (may be free or paid)
   * Uses server-side validation for free regeneration limits
   */
  const consumeRegeneration = useCallback(async (
    classId: string,
    type: 'appreciation' | 'bilan',
    tool: string
  ): Promise<{ success: boolean; isFree: boolean; cost: number }> => {
    const cost = type === 'bilan' ? 5 : 1;
    
    const result = await consumeCreditsServer(
      cost,
      tool as 'reportcard' | 'classcouncil' | 'quizmaster',
      'regeneration',
      classId,
      { type },
      true, // isRegeneration
      type  // regenerationType
    );

    return { 
      success: result.success, 
      isFree: result.wasFree || false, 
      cost: result.wasFree ? 0 : cost 
    };
  }, [consumeCreditsServer]);

  return {
    // Balance info (for UI display)
    totalBalance,
    freeRemaining,
    paidBalance,
    
    // Actions
    canGenerate, // UI hint only - real check is server-side
    consumeCredits, // Legacy wrapper
    consumeCreditsServer, // New server-validated method
    getFreeRegenerationsRemaining,
    consumeRegeneration,
    refreshCredits: refreshProfile,
    
    // Auth helper
    requireAuth: () => {
      if (!isAuthenticated) {
        openAuthModal();
        return false;
      }
      return true;
    },
  };
}

