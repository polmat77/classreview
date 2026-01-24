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

// Tone configuration with gradients and icons
const toneConfig: Record<AppreciationTone, {
  icon: typeof AlertTriangle;
  label: string;
  shortLabel: string;
  gradient: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: 'Ferme mais juste',
    shortLabel: 'Ferme',
    gradient: 'bg-gradient-to-b from-red-400 to-red-600',
  },
  neutre: {
    icon: Minus,
    label: 'Neutre et factuel',
    shortLabel: 'Neutre',
    gradient: 'bg-gradient-to-b from-slate-400 to-slate-600',
  },
  bienveillant: {
    icon: Heart,
    label: 'Bienveillant',
    shortLabel: 'Bienv.',
    gradient: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
  },
  encourageant: {
    icon: ThumbsUp,
    label: 'Encourageant',
    shortLabel: 'Encour.',
    gradient: 'bg-gradient-to-b from-cyan-400 to-cyan-600',
  },
  constructif: {
    icon: TrendingUp,
    label: 'Constructif',
    shortLabel: 'Constr.',
    gradient: 'bg-gradient-to-b from-violet-400 to-violet-600',
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
        <div className="flex w-full max-w-[250px] rounded-md overflow-hidden border border-gray-200 shadow-sm">
          {toneOrder.map((tone, index) => {
            const config = toneConfig[tone];
            const Icon = config.icon;
            const isActive = value === tone;
            const isLast = index === toneOrder.length - 1;
            
            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex-1 py-1.5 px-2 flex items-center justify-center text-white transition-all duration-200 hover:brightness-110",
                      config.gradient,
                      !isLast && "border-r border-white/20",
                      isActive && "ring-2 ring-inset ring-white/50 brightness-110"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
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
      <div className="flex w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        {toneOrder.map((tone, index) => {
          const config = toneConfig[tone];
          const Icon = config.icon;
          const isActive = value === tone;
          const isLast = index === toneOrder.length - 1;
          
          return (
            <Tooltip key={tone}>
              <TooltipProvider delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(tone)}
                    className={cn(
                      "flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-white font-medium text-sm transition-all duration-200 hover:brightness-110",
                      config.gradient,
                      !isLast && "border-r border-white/20",
                      isActive && "ring-2 ring-inset ring-white/50 brightness-110"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.shortLabel}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {config.label}
                </TooltipContent>
              </TooltipProvider>
            </Tooltip>
          );
        })}
      </div>

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
