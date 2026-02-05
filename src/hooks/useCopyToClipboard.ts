import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
  reset: () => void;
}

export const useCopyToClipboard = (resetDelay: number = 2000): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), resetDelay);
    } catch (error) {
      console.error('Erreur lors de la copie :', error);
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return { isCopied, copyToClipboard, reset };
};
