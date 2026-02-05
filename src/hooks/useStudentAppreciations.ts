import { useState, useCallback } from 'react';
import { Justification } from '@/utils/studentBulletinAnalyzer';

interface UseStudentAppreciationsReturn {
  texts: string[];
  justifications: Record<number, Justification[]>;
  loadingIndex: number | null;
  isLoadingAll: boolean;
  
  // Setters
  setTexts: React.Dispatch<React.SetStateAction<string[]>>;
  setJustifications: React.Dispatch<React.SetStateAction<Record<number, Justification[]>>>;
  setLoadingIndex: (index: number | null) => void;
  setIsLoadingAll: (loading: boolean) => void;
  
  // Actions
  updateText: (index: number, text: string) => void;
  updateJustifications: (index: number, justifs: Justification[]) => void;
  resetAll: () => void;
}

/**
 * Hook to manage student appreciation texts and their loading states.
 * Provides centralized state management for appreciation generation workflow.
 */
export const useStudentAppreciations = (
  initialTexts: string[] = []
): UseStudentAppreciationsReturn => {
  const [texts, setTexts] = useState<string[]>(initialTexts);
  const [justifications, setJustifications] = useState<Record<number, Justification[]>>({});
  const [loadingIndex, setLoadingIndexState] = useState<number | null>(null);
  const [isLoadingAll, setIsLoadingAllState] = useState(false);

  const setLoadingIndex = useCallback((index: number | null) => {
    setLoadingIndexState(index);
  }, []);

  const setIsLoadingAll = useCallback((loading: boolean) => {
    setIsLoadingAllState(loading);
  }, []);

  const updateText = useCallback((index: number, text: string) => {
    setTexts(prev => {
      const newTexts = [...prev];
      newTexts[index] = text;
      return newTexts;
    });
  }, []);

  const updateJustifications = useCallback((index: number, justifs: Justification[]) => {
    setJustifications(prev => ({
      ...prev,
      [index]: justifs
    }));
  }, []);

  const resetAll = useCallback(() => {
    setTexts([]);
    setJustifications({});
    setLoadingIndexState(null);
    setIsLoadingAllState(false);
  }, []);

  return {
    texts,
    justifications,
    loadingIndex,
    isLoadingAll,
    setTexts,
    setJustifications,
    setLoadingIndex,
    setIsLoadingAll,
    updateText,
    updateJustifications,
    resetAll,
  };
};
