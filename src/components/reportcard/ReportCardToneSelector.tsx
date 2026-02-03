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

// Tone configuration with colored icons
const toneConfig: Record<AppreciationTone, {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  shortLabel: string;
  description: string;
  iconColor: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: "Ferme",
    shortLabel: "Ferme",
    description: "Ton strict pour les élèves en difficulté de comportement ou de travail",
    iconColor: "#ef4444", // Red
  },
  neutre: {
    icon: Minus,
    label: "Neutre",
    shortLabel: "Neutre",
    description: "Ton objectif et factuel, sans jugement particulier",
    iconColor: "#64748b", // Slate
  },
  bienveillant: {
    icon: Heart,
    label: "Bienveillant",
    shortLabel: "Bienv.",
    description: "Ton doux et encourageant, mettant en avant le positif",
    iconColor: "#10b981", // Emerald
  },
  encourageant: {
    icon: TrendingUp,
    label: "Encourageant",
    shortLabel: "Encour.",
    description: "Ton motivant pour les élèves en progression",
    iconColor: "#f0a830", // Gold
  },
  constructif: {
    icon: Wrench,
    label: "Constructif",
    shortLabel: "Constr.",
    description: "Ton équilibré, axé sur les axes d'amélioration",
    iconColor: "#3b82f6", // Blue
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
        <div className="flex justify-between gap-1.5 w-full">
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
                      "flex-1 p-1.5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                      isActive 
                        ? "border-secondary-vibrant bg-secondary-vibrant/10" 
                        : "border-slate-300 bg-white hover:border-secondary-vibrant/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: config.iconColor }} />
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
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
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
                "flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2",
                isActive 
                  ? "border-secondary-vibrant bg-secondary-vibrant/10" 
                  : "border-slate-300 bg-white hover:border-secondary-vibrant/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.iconColor }} />
              <span className={cn(
                "font-medium text-sm whitespace-nowrap",
                isActive ? "text-secondary-vibrant" : "text-slate-600"
              )}>
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.shortLabel}</span>
              </span>
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
