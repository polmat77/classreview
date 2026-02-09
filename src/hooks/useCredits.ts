import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCost {
  tool: 'reportcard' | 'classcouncil' | 'quizmaster';
  action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration';
  students: number;
  classId?: string;
}

// Limits for free regenerations
const FREE_REGEN_LIMITS = {
  appreciation: 3, // per class
  bilan: 1,        // per class
};

// Minimum balance before blocking (allow negative balance)
const MIN_BALANCE = -10;

export function useCredits() {
  const { profile, isAuthenticated, refreshProfile, openAuthModal } = useAuth();

  // Balance calculations
  const freeRemaining = profile?.free_students_remaining ?? 0;
  const paidBalance = profile?.students_balance ?? 0;
  const totalBalance = freeRemaining + paidBalance;

  // Check if user can perform an action
  const canGenerate = useCallback((cost: number): boolean => {
    if (!isAuthenticated) return false;
    
    // Allow if user has at least 1 student remaining OR
    // if going negative wouldn't go below MIN_BALANCE
    if (totalBalance >= 1) return true;
    if (totalBalance + Math.abs(cost) >= Math.abs(MIN_BALANCE)) return true;
    
    return false;
  }, [isAuthenticated, totalBalance]);

  // Get remaining free regenerations for a class
  const getFreeRegenerationsRemaining = useCallback((classId: string, type: 'appreciation' | 'bilan'): number => {
    if (!profile) return 0;
    
    const freeRegens = profile.free_regenerations_used as Record<string, number> || {};
    const key = `${classId}_${type}`;
    const used = freeRegens[key] || 0;
    const limit = FREE_REGEN_LIMITS[type];
    
    return Math.max(0, limit - used);
  }, [profile]);

  // Consume credits for an action
  const consumeCredits = useCallback(async (
    cost: number,
    tool: string,
    action: string,
    classId?: string,
    metadata?: Record<string, unknown>,
    isFree?: boolean,
    isFreeRegeneration?: boolean
  ): Promise<boolean> => {
    if (!isAuthenticated || !profile) {
      openAuthModal();
      return false;
    }

    if (!canGenerate(cost)) {
      return false;
    }

    try {
      // Calculate how much to deduct from each pool
      let freeDeduction = 0;
      let paidDeduction = 0;

      if (!isFree && !isFreeRegeneration) {
        // Deduct from free first, then paid
        freeDeduction = Math.min(freeRemaining, cost);
        paidDeduction = cost - freeDeduction;
      }

      // Update profile balances
      const newFreeRemaining = freeRemaining - freeDeduction;
      const newPaidBalance = paidBalance - paidDeduction;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          free_students_remaining: newFreeRemaining,
          students_balance: newPaidBalance,
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return false;
      }

      // Log the generation
      const { error: logError } = await supabase
        .from('generations')
        .insert([{
          user_id: profile.id,
          tool,
          action,
          students_used: cost,
          is_free: isFree || freeDeduction > 0,
          is_free_regeneration: isFreeRegeneration,
          class_id: classId,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        }]);

      if (logError) {
        console.error('Error logging generation:', logError);
        // Don't fail the operation just because logging failed
      }

      // Refresh profile to get updated balances
      await refreshProfile();

      return true;
    } catch (err) {
      console.error('Error consuming credits:', err);
      return false;
    }
  }, [isAuthenticated, profile, canGenerate, freeRemaining, paidBalance, openAuthModal, refreshProfile]);

  // Consume a regeneration (may be free or paid)
  const consumeRegeneration = useCallback(async (
    classId: string,
    type: 'appreciation' | 'bilan',
    tool: string
  ): Promise<{ success: boolean; isFree: boolean; cost: number }> => {
    if (!isAuthenticated || !profile) {
      openAuthModal();
      return { success: false, isFree: false, cost: 0 };
    }

    const cost = type === 'bilan' ? 5 : 1;
    const freeRegens = (profile.free_regenerations_used as Record<string, number>) || {};
    const key = `${classId}_${type}`;
    const used = freeRegens[key] || 0;
    const limit = FREE_REGEN_LIMITS[type];

    // Check if free regeneration is available
    if (used < limit) {
      // Use free regeneration
      const newFreeRegens = { ...freeRegens, [key]: used + 1 };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          free_regenerations_used: newFreeRegens,
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Error updating free regenerations:', updateError);
        return { success: false, isFree: false, cost: 0 };
      }

      // Log free regeneration
      await supabase
        .from('generations')
        .insert([{
          user_id: profile.id,
          tool,
          action: 'regeneration',
          students_used: 0,
          is_free: false,
          is_free_regeneration: true,
          class_id: classId,
          metadata: { type, freeRegenNumber: used + 1 },
        }]);

      await refreshProfile();
      return { success: true, isFree: true, cost: 0 };
    }

    // No free regeneration available, consume credits
    if (!canGenerate(cost)) {
      return { success: false, isFree: false, cost };
    }

    const success = await consumeCredits(cost, tool, 'regeneration', classId, { type });
    return { success, isFree: false, cost };
  }, [isAuthenticated, profile, canGenerate, consumeCredits, openAuthModal, refreshProfile]);

  return {
    // Balance info
    totalBalance,
    freeRemaining,
    paidBalance,
    
    // Actions
    canGenerate,
    consumeCredits,
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
