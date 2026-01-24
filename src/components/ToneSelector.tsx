import { AlertTriangle, Minus, Heart, Award } from "lucide-react";
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
  Award,
};

// Tone configuration with gradients
const toneStyles: Record<AppreciationTone, {
  gradient: string;
  label: string;
}> = {
  severe: {
    gradient: 'bg-gradient-to-b from-red-400 to-red-600',
    label: 'Sévère',
  },
  standard: {
    gradient: 'bg-gradient-to-b from-slate-400 to-slate-600',
    label: 'Standard',
  },
  caring: {
    gradient: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
    label: 'Bienveillant',
  },
  praising: {
    gradient: 'bg-gradient-to-b from-amber-400 to-amber-600',
    label: 'Élogieux',
  },
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex w-full max-w-[200px] rounded-md overflow-hidden border border-gray-200 shadow-sm">
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
    <div className="flex w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
