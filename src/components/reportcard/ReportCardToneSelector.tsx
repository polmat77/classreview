import { cn } from "@/lib/utils";
import { AppreciationTone, toneOptions } from "@/types/reportcard";
import { AlertTriangle, Minus, Heart, TrendingUp, Wrench } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReportCardToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
  showDescription?: boolean;
}

// Unified tone configuration with design system colors
const toneConfig: Record<AppreciationTone, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortLabel: string;
  gradient: string;
  description: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: "Ferme",
    shortLabel: "Ferme",
    gradient: "bg-gradient-to-b from-red-500 to-red-600",
    description: "Ton strict pour les élèves en difficulté de comportement ou de travail",
  },
  neutre: {
    icon: Minus,
    label: "Neutre",
    shortLabel: "Neutre",
    gradient: "bg-gradient-to-b from-primary to-primary-dark",
    description: "Ton objectif et factuel, sans jugement particulier",
  },
  bienveillant: {
    icon: Heart,
    label: "Bienveillant",
    shortLabel: "Bienv.",
    gradient: "bg-gradient-to-b from-emerald-500 to-emerald-600",
    description: "Ton doux et encourageant, mettant en avant le positif",
  },
  encourageant: {
    icon: TrendingUp,
    label: "Encourageant",
    shortLabel: "Encour.",
    gradient: "bg-gradient-to-b from-secondary-vibrant to-cyan-600",
    description: "Ton motivant pour les élèves en progression",
  },
  constructif: {
    icon: Wrench,
    label: "Constructif",
    shortLabel: "Constr.",
    gradient: "bg-gradient-to-b from-accent to-accent-hover",
    description: "Ton équilibré, axé sur les axes d'amélioration",
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
    return toneConfig[tone]?.description || '';
  };

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex w-full max-w-[250px] rounded-lg overflow-hidden border border-border shadow-sm">
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
      <div className="flex w-full rounded-lg overflow-hidden border border-border shadow-sm">
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
