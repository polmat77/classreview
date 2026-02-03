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

// Tone styles with colored icons
const toneStyles: Record<AppreciationTone, { label: string; shortLabel: string; description: string; iconColor: string }> = {
  severe: {
    label: "Sévère",
    shortLabel: "Sévère",
    description: "Ton strict pour les élèves en difficulté",
    iconColor: "#ef4444", // Red
  },
  standard: {
    label: "Standard",
    shortLabel: "Standard",
    description: "Ton objectif et factuel",
    iconColor: "#64748b", // Slate
  },
  caring: {
    label: "Bienveillant",
    shortLabel: "Bienv.",
    description: "Ton doux et encourageant",
    iconColor: "#10b981", // Emerald
  },
  praising: {
    label: "Élogieux",
    shortLabel: "Élogieux",
    description: "Ton très positif et valorisant",
    iconColor: "#f0a830", // Gold
  },
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-1.5 flex-wrap md:flex-nowrap">
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
                        ? "border-secondary-vibrant bg-secondary-vibrant/10" 
                        : "border-slate-300 bg-white hover:border-secondary-vibrant/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: styles.iconColor }} />
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
    <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
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
              "flex-1 min-w-[100px] px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2",
              isActive 
                ? "border-secondary-vibrant bg-secondary-vibrant/10" 
                : "border-slate-300 bg-white hover:border-secondary-vibrant/50"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: styles.iconColor }} />
            <span className={cn(
              "font-medium text-sm",
              isActive ? "text-secondary-vibrant" : "text-slate-600"
            )}>
              <span className="hidden sm:inline">{styles.label}</span>
              <span className="sm:hidden">{styles.shortLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ToneSelector;
