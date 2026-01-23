import { useState, useEffect } from 'react';

export type AppName = 'classcouncil' | 'reportcard' | 'quizmaster';

export const useRGPDModal = (appName: AppName) => {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const storageKey = `${appName}_rgpd_accepted`;
    const hasAccepted = localStorage.getItem(storageKey);
    
    if (!hasAccepted) {
      // Délai de 500ms pour meilleure UX (évite flash au chargement)
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [appName]);
  
  const acceptRGPD = () => {
    const storageKey = `${appName}_rgpd_accepted`;
    localStorage.setItem(storageKey, 'true');
    localStorage.setItem(`${storageKey}_date`, new Date().toISOString());
    setShowModal(false);
  };
  
  const resetRGPD = () => {
    const storageKey = `${appName}_rgpd_accepted`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_date`);
    setShowModal(true);
  };
  
  return { showModal, acceptRGPD, resetRGPD };
};
