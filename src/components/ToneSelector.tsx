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

// Unified tone styles with design system gradients
const toneStyles: Record<AppreciationTone, { gradient: string; label: string }> = {
  severe: {
    gradient: "bg-gradient-to-b from-red-500 to-red-600",
    label: "Sévère",
  },
  standard: {
    gradient: "bg-gradient-to-b from-primary to-primary-dark",
    label: "Standard",
  },
  caring: {
    gradient: "bg-gradient-to-b from-emerald-500 to-emerald-600",
    label: "Bienveillant",
  },
  praising: {
    gradient: "bg-gradient-to-b from-accent to-accent-hover",
    label: "Élogieux",
  },
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex w-full max-w-[200px] rounded-lg overflow-hidden border border-border shadow-sm">
          {tones.map((tone, index) => {
            const config = toneConfig[tone];
            const styles = toneStyles[tone];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isActive = value === tone;
            const isLast = index === tones.length - 1;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex-1 py-1.5 px-2 flex items-center justify-center text-white transition-all duration-200 hover:brightness-110",
                      styles.gradient,
                      !isLast && "border-r border-white/20",
                      isActive && "ring-2 ring-inset ring-white/50 brightness-110"
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
    <div className="flex w-full rounded-lg overflow-hidden border border-border shadow-sm">
      {tones.map((tone, index) => {
        const config = toneConfig[tone];
        const styles = toneStyles[tone];
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = value === tone;
        const isLast = index === tones.length - 1;
        
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              "flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-white font-medium text-sm transition-all duration-200 hover:brightness-110",
              styles.gradient,
              !isLast && "border-r border-white/20",
              isActive && "ring-2 ring-inset ring-white/50 brightness-110"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{styles.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ToneSelector;
