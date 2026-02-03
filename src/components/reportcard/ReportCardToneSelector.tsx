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

// Subtle tone configuration with border-based design
const toneConfig: Record<AppreciationTone, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortLabel: string;
  description: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: "Ferme",
    shortLabel: "Ferme",
    description: "Ton strict pour les élèves en difficulté de comportement ou de travail",
  },
  neutre: {
    icon: Minus,
    label: "Neutre",
    shortLabel: "Neutre",
    description: "Ton objectif et factuel, sans jugement particulier",
  },
  bienveillant: {
    icon: Heart,
    label: "Bienveillant",
    shortLabel: "Bienv.",
    description: "Ton doux et encourageant, mettant en avant le positif",
  },
  encourageant: {
    icon: TrendingUp,
    label: "Encourageant",
    shortLabel: "Encour.",
    description: "Ton motivant pour les élèves en progression",
  },
  constructif: {
    icon: Wrench,
    label: "Constructif",
    shortLabel: "Constr.",
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
        <div className="flex flex-wrap gap-1.5">
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
      <div className="flex flex-wrap gap-2 md:gap-3">
        {toneOrder.map((tone) => {
          const config = toneConfig[tone];
          const Icon = config.icon;
          const isActive = value === tone;
          
          return (
            <button
              key={tone}
              type="button"
              onClick={() => onChange(tone)}
              className={cn(
                "px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2",
                isActive 
                  ? "border-secondary-vibrant bg-secondary-vibrant/10 text-secondary-vibrant" 
                  : "border-slate-300 bg-white text-slate-600 hover:border-secondary-vibrant/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm hidden sm:inline">{config.shortLabel}</span>
            </button>
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
