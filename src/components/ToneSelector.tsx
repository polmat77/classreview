import { cn } from "@/lib/utils";
import { AppreciationTone, toneConfig } from "@/types/appreciation";
import { AlertTriangle, Minus, Heart, Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
}

const iconMap = {
  AlertTriangle,
  Minus,
  Heart,
  Award,
};

// Subtle tone styles with border-based design
const toneStyles: Record<AppreciationTone, { label: string; description: string }> = {
  severe: {
    label: "Sévère",
    description: "Ton strict pour les élèves en difficulté",
  },
  standard: {
    label: "Standard",
    description: "Ton objectif et factuel",
  },
  caring: {
    label: "Bienveillant",
    description: "Ton doux et encourageant",
  },
  praising: {
    label: "Élogieux",
    description: "Ton très positif et valorisant",
  },
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap gap-1.5">
          {tones.map((tone) => {
            const config = toneConfig[tone];
            const styles = toneStyles[tone];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isActive = value === tone;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "p-1.5 rounded-md border-2 transition-all duration-200",
                      isActive 
                        ? "border-secondary-vibrant bg-secondary-vibrant/10 text-secondary-vibrant" 
                        : "border-slate-300 bg-white text-slate-600 hover:border-secondary-vibrant/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {styles.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tones.map((tone) => {
        const config = toneConfig[tone];
        const styles = toneStyles[tone];
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = value === tone;
        
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              "px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2",
              isActive 
                ? "border-secondary-vibrant bg-secondary-vibrant/10 text-secondary-vibrant" 
                : "border-slate-300 bg-white text-slate-600 hover:border-secondary-vibrant/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{styles.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToneSelector;
