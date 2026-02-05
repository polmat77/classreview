import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  limit: number;
  warningThreshold?: number;
  className?: string;
}

export const CharacterCounter = ({ 
  current, 
  limit, 
  warningThreshold = 0.8,
  className = ""
}: CharacterCounterProps) => {
  const percentage = current / limit;
  const isWarning = percentage >= warningThreshold && percentage <= 1;
  const isOver = current > limit;

  return (
    <span 
      className={cn(
        "text-sm",
        isOver 
          ? "text-destructive font-semibold" 
          : isWarning 
            ? "text-orange-600 dark:text-orange-400" 
            : "text-muted-foreground",
        className
      )}
    >
      {current}/{limit} caractères
      {isOver && " ⚠️ Dépassement"}
    </span>
  );
};

export default CharacterCounter;
