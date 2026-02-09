import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type RedemptionStatus = 'SUCCESS' | 'INVALID' | 'EXPIRED' | 'EXHAUSTED' | 'ALREADY_USED' | 'AUTH_REQUIRED' | 'ERROR';

interface RedemptionResult {
  success: boolean;
  status: RedemptionStatus;
  message: string;
  creditsAwarded?: number;
  newBalance?: number;
}

interface LastRedemption {
  code: string;
  credits: number;
  timestamp: Date;
}

export function usePromoCode() {
  const { session, refreshProfile, openAuthModal, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRedemption, setLastRedemption] = useState<LastRedemption | null>(null);

  const redeemCode = useCallback(async (code: string): Promise<RedemptionResult> => {
    setError(null);
    
    // Check authentication
    if (!isAuthenticated || !session?.access_token) {
      openAuthModal();
      const result: RedemptionResult = {
        success: false,
        status: 'AUTH_REQUIRED',
        message: 'Veuillez vous connecter pour utiliser un code promo.',
      };
      setError(result.message);
      return result;
    }

    if (!code.trim()) {
      const result: RedemptionResult = {
        success: false,
        status: 'INVALID',
        message: 'Veuillez entrer un code promo.',
      };
      setError(result.message);
      return result;
    }

    setIsLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('redeem-promo-code', {
        body: { code: code.trim().toUpperCase() },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      const result = data as RedemptionResult;

      if (result.success) {
        setLastRedemption({
          code: code.trim().toUpperCase(),
          credits: result.creditsAwarded ?? 0,
          timestamp: new Date(),
        });
        
        // Refresh the profile to update credits display
        await refreshProfile();
      } else {
        setError(result.message);
      }

      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
      
      return {
        success: false,
        status: 'ERROR',
        message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [session, isAuthenticated, openAuthModal, refreshProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLastRedemption = useCallback(() => {
    setLastRedemption(null);
  }, []);

  return {
    redeemCode,
    isLoading,
    error,
    lastRedemption,
    clearError,
    clearLastRedemption,
  };
}
