import { useState, useCallback } from 'react';
import { AppreciationTone } from '@/types/appreciation';

interface UseStudentTonesReturn {
  tones: Record<number, AppreciationTone>;
  setTone: (index: number, tone: AppreciationTone) => void;
  getTone: (index: number) => AppreciationTone;
  resetTones: () => void;
  setMultipleTones: (tonesMap: Record<number, AppreciationTone>) => void;
}

/**
 * Hook to manage student tones with isolated state per student index.
 * Provides a default tone of 'standard' when no specific tone is set.
 */
export const useStudentTones = (defaultTone: AppreciationTone = 'standard'): UseStudentTonesReturn => {
  const [tones, setTones] = useState<Record<number, AppreciationTone>>({});

  const setTone = useCallback((index: number, tone: AppreciationTone) => {
    setTones(prev => ({ ...prev, [index]: tone }));
  }, []);

  const getTone = useCallback((index: number): AppreciationTone => {
    return tones[index] || defaultTone;
  }, [tones, defaultTone]);

  const resetTones = useCallback(() => {
    setTones({});
  }, []);

  const setMultipleTones = useCallback((tonesMap: Record<number, AppreciationTone>) => {
    setTones(prev => ({ ...prev, ...tonesMap }));
  }, []);

  return {
    tones,
    setTone,
    getTone,
    resetTones,
    setMultipleTones,
  };
};
