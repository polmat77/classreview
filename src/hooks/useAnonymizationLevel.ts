import { useState, useEffect } from 'react';
import { AnonymizationLevel } from '@/types/privacy';

export function useAnonymizationLevel() {
  const [level, setLevel] = useState<AnonymizationLevel>('standard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('anonymizationLevel');
    if (saved === 'standard' || saved === 'maximal') {
      setLevel(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('anonymizationLevel', level);
    }
  }, [level, isLoaded]);

  return [level, setLevel, isLoaded] as const;
}
