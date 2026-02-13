import { useState, useEffect, useCallback } from "react";
import { ReportCardState, Student, StudentObservations, GeneratedAppreciation, ClassSummary, ClassMetadata, AppreciationSettings, AppreciationTone } from "@/types/reportcard";
import ReportCardLayout from "@/components/reportcard/ReportCardLayout";
import Step1DataImport from "@/components/reportcard/Step1DataImport";
import Step2Observations from "@/components/reportcard/Step2Observations";

import Step3Appreciations from "@/components/reportcard/Step3Appreciations";
import Step4ClassSummary from "@/components/reportcard/Step4ClassSummary";
import { useToast } from "@/hooks/use-toast";
import { useRGPDConsent } from "@/hooks/useRGPDConsent";
import { RGPDConsentModal } from "@/components/RGPDConsentModal";

const STORAGE_KEY = "reportcard-ai-session";
const PREFERENCES_KEY = "reportCardAI_preferences";

interface SavedPreferences {
  maxCharacters: number;
  defaultTone: AppreciationTone;
}

const getDefaultPreferences = (): SavedPreferences => {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return { maxCharacters: 400, defaultTone: 'standard' };
};

const initialObservations: StudentObservations = {
  behavior: null,
  talkative: null,
  specific: [],
};

const initialClassSummary: ClassSummary = {
  options: {
    workLevel: null,
    behavior: null,
    participation: null,
    progression: null,
  },
  generatedText: "",
  isEditing: false,
  tone: 'standard',
  maxCharacters: 350,
};

const getInitialState = (): ReportCardState => {
  const prefs = getDefaultPreferences();
  return {
    students: [],
    classMetadata: null,
    observations: { ...initialObservations },
    appreciations: [],
    classSummary: { ...initialClassSummary, tone: prefs.defaultTone, maxCharacters: prefs.maxCharacters },
    appreciationSettings: {
      maxCharacters: prefs.maxCharacters,
      defaultTone: prefs.defaultTone,
      individualTones: {},
    },
    currentStep: 1,
  };
};

const ReportCardAI = () => {
  const { toast } = useToast();
  const { showModal, acceptConsent } = useRGPDConsent('reportcard');

  // Teacher subject: auto-detected from PDF or manually entered
  const [teacherSubject, setTeacherSubjectState] = useState<string>(() => {
    return localStorage.getItem('reportcard_teacher_subject') || '';
  });

  const setTeacherSubject = useCallback((subject: string) => {
    setTeacherSubjectState(subject);
    localStorage.setItem('reportcard_teacher_subject', subject);
  }, []);
  
  const [state, setState] = useState<ReportCardState>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const prefs = getDefaultPreferences();
        const initial = getInitialState();
        // Ensure appreciationSettings exists (for sessions saved before this feature)
        return {
          ...initial,
          ...parsed,
          appreciationSettings: parsed.appreciationSettings || {
            maxCharacters: prefs.maxCharacters,
            defaultTone: prefs.defaultTone,
            individualTones: {},
          },
          classSummary: {
            ...initial.classSummary,
            ...parsed.classSummary,
            tone: parsed.classSummary?.tone || prefs.defaultTone,
            maxCharacters: parsed.classSummary?.maxCharacters || prefs.maxCharacters,
          },
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const setStudents = (students: Student[]) => {
    setState((prev) => ({ ...prev, students }));
  };

  const setClassMetadata = (classMetadata: ClassMetadata | null) => {
    setState((prev) => ({ ...prev, classMetadata }));
    // Auto-fill subject from PDF metadata if not already set
    if (classMetadata?.subject && !teacherSubject) {
      setTeacherSubject(classMetadata.subject);
    }
  };

  const setObservations = (observations: StudentObservations) => {
    setState((prev) => ({ ...prev, observations }));
  };

  const setAppreciations = (appreciations: GeneratedAppreciation[]) => {
    setState((prev) => ({ ...prev, appreciations }));
  };

  const setClassSummary = (classSummary: ClassSummary) => {
    setState((prev) => ({ ...prev, classSummary }));
  };

  const setAppreciationSettings = (appreciationSettings: AppreciationSettings) => {
    setState((prev) => ({ ...prev, appreciationSettings }));
    // Save preferences to localStorage
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
      maxCharacters: appreciationSettings.maxCharacters,
      defaultTone: appreciationSettings.defaultTone,
    }));
  };

  // Reset full session
  const resetSession = useCallback(() => {
    const prefs = getDefaultPreferences();
    const initial = getInitialState();
    setState({
      ...initial,
      appreciationSettings: {
        maxCharacters: prefs.maxCharacters,
        defaultTone: prefs.defaultTone,
        individualTones: {},
      },
      classSummary: {
        ...initial.classSummary,
        tone: prefs.defaultTone,
        maxCharacters: prefs.maxCharacters,
      },
    });
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Session réinitialisée", description: "Toutes les données ont été effacées" });
  }, [toast]);

  // Reset Step 1: Data Import
  const resetStep1 = useCallback(() => {
    setState((prev) => ({
      ...prev,
      students: [],
      classMetadata: null,
    }));
    toast({ title: "Étape 1 réinitialisée", description: "Données des élèves effacées" });
  }, [toast]);

  // Reset Step 2: Observations
  const resetStep2 = useCallback(() => {
    setState((prev) => ({
      ...prev,
      observations: { ...initialObservations },
    }));
    toast({ title: "Étape 2 réinitialisée", description: "Observations effacées" });
  }, [toast]);

  // Reset Step 3: Appreciations
  const resetStep3 = useCallback(() => {
    const prefs = getDefaultPreferences();
    setState((prev) => ({
      ...prev,
      appreciations: [],
      appreciationSettings: {
        maxCharacters: prefs.maxCharacters,
        defaultTone: prefs.defaultTone,
        individualTones: {},
      },
    }));
    toast({ title: "Étape 3 réinitialisée", description: "Appréciations effacées" });
  }, [toast]);

  // Reset Step 4: Class Summary
  const resetStep4 = useCallback(() => {
    const prefs = getDefaultPreferences();
    setState((prev) => ({
      ...prev,
      classSummary: {
        ...initialClassSummary,
        tone: prefs.defaultTone,
        maxCharacters: prefs.maxCharacters,
      },
    }));
    toast({ title: "Étape 4 réinitialisée", description: "Bilan de classe effacé" });
  }, [toast]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1DataImport
            students={state.students}
            classMetadata={state.classMetadata}
            onStudentsChange={setStudents}
            onClassMetadataChange={setClassMetadata}
            teacherSubject={teacherSubject}
            onTeacherSubjectChange={setTeacherSubject}
            onNext={() => setCurrentStep(2)}
            onReset={resetStep1}
          />
        );
      case 2:
        return (
          <Step2Observations
            students={state.students}
            observations={state.observations}
            onObservationsChange={setObservations}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            onReset={resetStep2}
          />
        );
      case 3:
        return (
          <Step3Appreciations
            students={state.students}
            observations={state.observations}
            appreciations={state.appreciations}
            appreciationSettings={state.appreciationSettings}
            classMetadata={state.classMetadata}
            teacherSubject={teacherSubject}
            onAppreciationsChange={setAppreciations}
            onAppreciationSettingsChange={setAppreciationSettings}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            onReset={resetStep3}
          />
        );
      case 4:
        return (
          <Step4ClassSummary
            students={state.students}
            classSummary={state.classSummary}
            onClassSummaryChange={setClassSummary}
            appreciations={state.appreciations}
            onBack={() => setCurrentStep(3)}
            onReset={resetStep4}
          />
        );
      default:
        return null;
    }
  };

  const hasObservations = state.observations.behavior !== null || state.observations.talkative !== null || state.observations.specific.length > 0;

  return (
    <>
      <RGPDConsentModal 
        isOpen={showModal} 
        onAccept={acceptConsent} 
        appName="reportcard" 
      />
      <ReportCardLayout 
        currentStep={state.currentStep}
        onStepClick={setCurrentStep}
        hasStudents={state.students.length > 0}
        hasObservations={hasObservations}
        hasAppreciations={state.appreciations.length > 0}
        onReset={resetSession}
      >
        {renderStep()}
      </ReportCardLayout>
    </>
  );
};

export default ReportCardAI;
