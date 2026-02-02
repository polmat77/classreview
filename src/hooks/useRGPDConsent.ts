import { useState, useEffect, useCallback } from 'react';

export type AppName = 'classcouncil' | 'reportcard' | 'quizmaster';

interface RGPDConsentState {
  showModal: boolean;
  hasAccepted: boolean;
  acceptedDate: string | null;
}

export const useRGPDConsent = (appName: AppName) => {
  const [state, setState] = useState<RGPDConsentState>({
    showModal: false,
    hasAccepted: false,
    acceptedDate: null,
  });
  
  const storageKey = `${appName}_rgpd_accepted`;
  const dateKey = `${appName}_rgpd_accepted_date`;
  
  useEffect(() => {
    const hasAccepted = localStorage.getItem(storageKey);
    const acceptedDate = localStorage.getItem(dateKey);
    
    if (hasAccepted === 'true') {
      setState({
        showModal: false,
        hasAccepted: true,
        acceptedDate,
      });
    } else {
      // Delay for better UX (avoids flash on load)
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          showModal: true,
        }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [storageKey, dateKey]);
  
  const acceptConsent = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(dateKey, now);
    setState({
      showModal: false,
      hasAccepted: true,
      acceptedDate: now,
    });
  }, [storageKey, dateKey]);
  
  const revokeConsent = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(dateKey);
    setState({
      showModal: true,
      hasAccepted: false,
      acceptedDate: null,
    });
  }, [storageKey, dateKey]);
  
  const reopenModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showModal: true,
    }));
  }, []);
  
  return {
    showModal: state.showModal,
    hasAccepted: state.hasAccepted,
    acceptedDate: state.acceptedDate,
    acceptConsent,
    revokeConsent,
    reopenModal,
  };
};
