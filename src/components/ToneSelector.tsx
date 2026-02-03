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
    label: "Ferme",
    shortLabel: "Ferme",
    description: "Ton strict pour les élèves en difficulté",
    iconColor: "#ef4444", // Red
  },
  standard: {
    label: "Neutre",
    shortLabel: "Neutre",
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
        <div className="flex justify-between gap-1.5 w-full">
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
                      "flex-1 p-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center",
                      isActive 
                        ? "border-blue-400 bg-blue-50" 
                        : "border-slate-200 bg-white hover:border-blue-300"
                    )}
                  >
                    <Icon className="w-4 h-4" style={{ color: styles.iconColor }} />
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
    <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
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
              "flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2",
              isActive 
                ? "border-blue-400 bg-blue-50" 
                : "border-slate-200 bg-white hover:border-blue-300"
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: styles.iconColor }} />
            <span className="font-medium text-slate-700 whitespace-nowrap">
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
