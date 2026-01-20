import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { id: 1, label: 'Résultats' },
  { id: 2, label: 'Classe' },
  { id: 3, label: 'Élèves' },
  { id: 4, label: 'Bilan' },
];

export function Stepper({ currentStep, steps = defaultSteps }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-4 px-6 bg-card rounded-xl shadow-sm border">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                currentStep > step.id && "bg-gold text-navy",
                currentStep === step.id && "bg-card text-gold border-[3px] border-gold shadow-[0_0_0_4px_hsl(var(--gold)/0.2)]",
                currentStep < step.id && "bg-muted text-muted-foreground"
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
                "text-sm font-medium mr-4 transition-colors",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mr-4 rounded-full transition-all duration-300",
                currentStep > step.id 
                  ? "bg-gradient-to-r from-gold to-gold-light" 
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Stepper;
