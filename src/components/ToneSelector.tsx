import { AlertTriangle, Minus, Heart, Trophy } from "lucide-react";
import { AppreciationTone, toneConfig } from "@/types/appreciation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (tone: AppreciationTone) => void;
  compact?: boolean;
}

const iconMap = {
  AlertTriangle,
  Minus,
  Heart,
  Trophy,
};

// Short labels for compact mode
const shortLabels: Record<AppreciationTone, string> = {
  severe: 'Sév.',
  standard: 'Std.',
  caring: 'Bien.',
  praising: 'Élog.',
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1">
          {tones.map((tone) => {
            const config = toneConfig[tone];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isActive = value === tone;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 text-xs font-medium",
                      isActive
                        ? `${config.bgColor} text-white shadow-sm`
                        : `bg-muted/50 hover:bg-muted ${config.color} opacity-60 hover:opacity-100`
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {isActive && <span>{shortLabels[tone]}</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {config.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tones.map((tone) => {
        const config = toneConfig[tone];
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = value === tone;
        
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm",
              isActive
                ? `${config.bgColor} text-white border-transparent shadow-md scale-105`
                : `bg-background ${config.borderColor} ${config.color} hover:bg-muted/50`
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToneSelector;
