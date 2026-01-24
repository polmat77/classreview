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

// Unified color palette with solid backgrounds
const toneColors: Record<AppreciationTone, {
  bg: string;
  ring: string;
}> = {
  severe: {
    bg: 'bg-red-600',
    ring: 'ring-red-600',
  },
  standard: {
    bg: 'bg-slate-600',
    ring: 'ring-slate-600',
  },
  caring: {
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-500',
  },
  praising: {
    bg: 'bg-amber-500',
    ring: 'ring-amber-500',
  },
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
        <div className="flex items-center gap-1.5">
          {tones.map((tone) => {
            const config = toneConfig[tone];
            const colors = toneColors[tone];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isActive = value === tone;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-lg text-white font-medium text-xs transition-all duration-200 hover:opacity-90",
                      colors.bg,
                      isActive && "ring-2 ring-offset-2 shadow-md scale-105",
                      isActive && colors.ring
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
        const colors = toneColors[tone];
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = value === tone;
        
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base text-white transition-all duration-200 hover:opacity-90",
              colors.bg,
              isActive && "ring-2 ring-offset-2 shadow-md scale-105",
              isActive && colors.ring
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
