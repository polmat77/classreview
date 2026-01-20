import { cn } from "@/lib/utils";
import { Check, Upload, MessageSquare, FileText, BarChart3 } from "lucide-react";

interface ReportCardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  hasStudents: boolean;
  hasObservations: boolean;
  hasAppreciations: boolean;
}

const steps = [
  { id: 1, label: "Import des données", icon: Upload },
  { id: 2, label: "Observations", icon: MessageSquare },
  { id: 3, label: "Appréciations", icon: FileText },
  { id: 4, label: "Bilan de classe", icon: BarChart3 },
];

const ReportCardStepper = ({
  currentStep,
  onStepClick,
  hasStudents,
  hasObservations,
  hasAppreciations,
}: ReportCardStepperProps) => {
  const isStepAccessible = (stepId: number) => {
    switch (stepId) {
      case 1:
        return true;
      case 2:
        return hasStudents;
      case 3:
        return hasStudents && hasObservations;
      case 4:
        return hasStudents && hasObservations && hasAppreciations;
      default:
        return false;
    }
  };

  const isStepCompleted = (stepId: number) => {
    switch (stepId) {
      case 1:
        return hasStudents;
      case 2:
        return hasObservations;
      case 3:
        return hasAppreciations;
      case 4:
        return false; // Final step never shows as completed
      default:
        return false;
    }
  };

  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = isStepCompleted(step.id);
          const isAccessible = isStepAccessible(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "flex items-center gap-3 group transition-all",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-lg",
                    isCompleted && !isActive && "bg-success text-success-foreground",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground",
                    isAccessible && !isActive && "group-hover:bg-primary/10"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Étape {step.id}</p>
                  <p
                    className={cn(
                      "font-medium text-sm",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    isStepCompleted(step.id) ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-lg",
                  isCompleted && !isActive && "bg-success text-success-foreground",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground",
                  !isAccessible && "opacity-50 cursor-not-allowed"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Étape {currentStep} sur 4
          </p>
          <p className="font-semibold text-foreground">
            {steps.find((s) => s.id === currentStep)?.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardStepper;
