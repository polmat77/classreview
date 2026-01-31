import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps?: Step[];
  onStepClick?: (stepId: number) => void;
}

const defaultSteps: Step[] = [
  { id: 1, label: 'Résultats' },
  { id: 2, label: 'Classe' },
  { id: 3, label: 'Élèves' },
  { id: 4, label: 'Bilan' },
];

export function Stepper({ currentStep, steps = defaultSteps, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            type="button"
            onClick={() => onStepClick?.(step.id)}
            className={cn(
              "flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-80",
              !onStepClick && "cursor-default"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 shadow-sm",
                currentStep > step.id && "bg-amber-500 text-white",
                currentStep === step.id && "bg-amber-500 text-white shadow-md",
                currentStep < step.id && "bg-slate-200 text-slate-500",
                onStepClick && "group-hover:scale-105"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                currentStep >= step.id ? "text-slate-900" : "text-slate-400",
                onStepClick && currentStep >= step.id && "group-hover:text-amber-600"
              )}
            >
              {step.label}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-[60px] h-0.5 ml-4 rounded-full transition-all duration-300",
                currentStep > step.id 
                  ? "bg-amber-500" 
                  : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Stepper;
