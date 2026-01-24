import { AlertTriangle, Minus, Heart, ThumbsUp, TrendingUp } from "lucide-react";
import { AppreciationTone, toneOptions } from "@/types/reportcard";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReportCardToneSelectorProps {
  value: AppreciationTone;
  onChange: (tone: AppreciationTone) => void;
  compact?: boolean;
  showDescription?: boolean;
}

// Unified tone configuration with solid colored backgrounds
const toneConfig: Record<AppreciationTone, {
  icon: typeof AlertTriangle;
  label: string;
  shortLabel: string;
  bg: string;
  ring: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: 'Ferme mais juste',
    shortLabel: 'Ferme',
    bg: 'bg-red-600',
    ring: 'ring-red-600',
  },
  neutre: {
    icon: Minus,
    label: 'Neutre et factuel',
    shortLabel: 'Neutre',
    bg: 'bg-slate-600',
    ring: 'ring-slate-600',
  },
  bienveillant: {
    icon: Heart,
    label: 'Bienveillant',
    shortLabel: 'Bienv.',
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-500',
  },
  encourageant: {
    icon: ThumbsUp,
    label: 'Encourageant',
    shortLabel: 'Encour.',
    bg: 'bg-cyan-500',
    ring: 'ring-cyan-500',
  },
  constructif: {
    icon: TrendingUp,
    label: 'Constructif',
    shortLabel: 'Constr.',
    bg: 'bg-violet-500',
    ring: 'ring-violet-500',
  },
};

const toneOrder: AppreciationTone[] = ['ferme', 'neutre', 'bienveillant', 'encourageant', 'constructif'];

const ReportCardToneSelector = ({ 
  value, 
  onChange, 
  compact = false,
  showDescription = false 
}: ReportCardToneSelectorProps) => {
  const getToneDescription = (tone: AppreciationTone) => {
    return toneOptions.find(t => t.value === tone)?.description || '';
  };

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1.5">
          {toneOrder.map((tone) => {
            const config = toneConfig[tone];
            const Icon = config.icon;
            const isActive = value === tone;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded-lg text-white font-medium text-xs transition-all duration-200 hover:opacity-90",
                      config.bg,
                      isActive && "ring-2 ring-offset-2 shadow-md scale-105",
                      isActive && config.ring
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {isActive && <span>{config.shortLabel}</span>}
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
    <div className="space-y-3">
      <TooltipProvider delayDuration={200}>
        <div className="flex flex-wrap items-center gap-2">
          {toneOrder.map((tone) => {
            const config = toneConfig[tone];
            const Icon = config.icon;
            const isActive = value === tone;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-sm md:text-base text-white transition-all duration-200 hover:opacity-90",
                      config.bg,
                      isActive && "ring-2 ring-offset-2 shadow-md scale-105",
                      isActive && config.ring
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{config.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {getToneDescription(tone)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {showDescription && (
        <div className="px-3 py-2 bg-muted/50 rounded-md min-h-[40px] flex items-center">
          <span className="text-sm text-muted-foreground">
            {getToneDescription(value)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReportCardToneSelector;
