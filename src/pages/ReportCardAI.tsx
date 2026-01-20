import { useState, useEffect } from "react";
import { ReportCardState, Student, StudentObservations, GeneratedAppreciation, ClassSummary } from "@/types/reportcard";
import ReportCardLayout from "@/components/reportcard/ReportCardLayout";
import ReportCardStepper from "@/components/reportcard/ReportCardStepper";
import Step1DataImport from "@/components/reportcard/Step1DataImport";
import Step2Observations from "@/components/reportcard/Step2Observations";
import Step3Appreciations from "@/components/reportcard/Step3Appreciations";
import Step4ClassSummary from "@/components/reportcard/Step4ClassSummary";

const STORAGE_KEY = "reportcard-ai-session";

const initialState: ReportCardState = {
  students: [],
  observations: {
    behavior: null,
    talkative: null,
    specific: [],
  },
  appreciations: [],
  classSummary: {
    options: {
      workLevel: null,
      behavior: null,
      participation: null,
      progression: null,
    },
    generatedText: "",
    isEditing: false,
  },
  currentStep: 1,
};

const ReportCardAI = () => {
  const [state, setState] = useState<ReportCardState>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialState;
      }
    }
    return initialState;
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

  const setObservations = (observations: StudentObservations) => {
    setState((prev) => ({ ...prev, observations }));
  };

  const setAppreciations = (appreciations: GeneratedAppreciation[]) => {
    setState((prev) => ({ ...prev, appreciations }));
  };

  const setClassSummary = (classSummary: ClassSummary) => {
    setState((prev) => ({ ...prev, classSummary }));
  };

  const resetSession = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1DataImport
            students={state.students}
            onStudentsChange={setStudents}
            onNext={() => setCurrentStep(2)}
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
          />
        );
      case 3:
        return (
          <Step3Appreciations
            students={state.students}
            observations={state.observations}
            appreciations={state.appreciations}
            onAppreciationsChange={setAppreciations}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
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
            onReset={resetSession}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ReportCardLayout onReset={resetSession}>
      <div className="mb-8">
        <ReportCardStepper
          currentStep={state.currentStep}
          onStepClick={setCurrentStep}
          hasStudents={state.students.length > 0}
          hasObservations={state.observations.behavior !== null || state.observations.talkative !== null || state.observations.specific.length > 0}
          hasAppreciations={state.appreciations.length > 0}
        />
      </div>
      {renderStep()}
    </ReportCardLayout>
  );
};

export default ReportCardAI;
