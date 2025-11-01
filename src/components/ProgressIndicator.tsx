import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-smooth",
              index + 1 < currentStep && "bg-success text-success-foreground",
              index + 1 === currentStep && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
              index + 1 > currentStep && "bg-muted text-muted-foreground"
            )}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-8 transition-smooth",
                index + 1 < currentStep ? "bg-success" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-4 text-sm font-medium text-muted-foreground">
        Étape {currentStep}/{totalSteps}
      </span>
    </div>
  );
};

export default ProgressIndicator;
