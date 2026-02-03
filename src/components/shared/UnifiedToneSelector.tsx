import { cn } from "@/lib/utils";
import { AlertTriangle, Minus, Heart, Star, Wrench } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Unified tone type that works across both ClassCouncil and ReportCard
export type UnifiedTone = 'ferme' | 'neutre' | 'bienveillant' | 'encourageant' | 'constructif';

// Mapping from legacy ClassCouncil tones to unified tones
export const legacyToUnifiedToneMap: Record<string, UnifiedTone> = {
  'severe': 'ferme',
  'standard': 'neutre',
  'caring': 'bienveillant',
  'praising': 'encourageant',
};

// Mapping from unified to legacy for backwards compatibility
export const unifiedToLegacyMap: Record<UnifiedTone, string> = {
  'ferme': 'severe',
  'neutre': 'standard',
  'bienveillant': 'caring',
  'encourageant': 'praising',
  'constructif': 'constructif',
};

interface ToneConfig {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  shortLabel: string;
  description: string;
  iconColor: string;
}

const toneConfig: Record<UnifiedTone, ToneConfig> = {
  ferme: {
    icon: AlertTriangle,
    label: "Ferme",
    shortLabel: "Ferme",
    description: "Ton direct et strict pour souligner les difficultés",
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
    description: "Ton positif et chaleureux pour encourager",
    iconColor: "#10b981", // Emerald
  },
  encourageant: {
    icon: Star,
    label: "Encourageant",
    shortLabel: "Encour.",
    description: "Ton motivant pour mettre en avant les progrès",
    iconColor: "#f0a830", // Gold
  },
  constructif: {
    icon: Wrench,
    label: "Constructif",
    shortLabel: "Constr.",
    description: "Ton orienté solutions et pistes d'amélioration",
    iconColor: "#3b82f6", // Blue
  },
};

const toneOrder: UnifiedTone[] = ['ferme', 'neutre', 'bienveillant', 'encourageant', 'constructif'];

interface UnifiedToneSelectorProps {
  value: UnifiedTone | string;
  onChange: (value: UnifiedTone) => void;
  compact?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const UnifiedToneSelector = ({
  value,
  onChange,
  compact = false,
  showDescription = false,
  className = "",
}: UnifiedToneSelectorProps) => {
  // Normalize legacy values to unified
  const normalizedValue: UnifiedTone = (legacyToUnifiedToneMap[value as string] || value) as UnifiedTone;
  
  const getToneDescription = (tone: UnifiedTone) => {
    return toneConfig[tone]?.description || '';
  };

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className={cn("flex justify-between gap-1.5 w-full", className)}>
          {toneOrder.map((tone) => {
            const config = toneConfig[tone];
            const Icon = config.icon;
            const isActive = normalizedValue === tone;
            
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
                    <Icon className="w-4 h-4" style={{ color: config.iconColor }} />
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
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        {toneOrder.map((tone) => {
          const config = toneConfig[tone];
          const Icon = config.icon;
          const isActive = normalizedValue === tone;
          
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
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: config.iconColor }} />
              <span className="font-medium text-slate-700 whitespace-nowrap">
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
            {getToneDescription(normalizedValue)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UnifiedToneSelector;
