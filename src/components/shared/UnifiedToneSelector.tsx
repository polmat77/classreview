import { cn } from "@/lib/utils";
import { AlertTriangle, BarChart3, ThumbsUp, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// New unified tone type with 4 tones
export type UnifiedTone = 'severe' | 'standard' | 'encourageant' | 'elogieux';

// Mapping from legacy tones to new unified tones
export const legacyToUnifiedToneMap: Record<string, UnifiedTone> = {
  // Old 5-tone system
  'ferme': 'severe',
  'neutre': 'standard',
  'bienveillant': 'encourageant',
  'encourageant': 'encourageant',
  'constructif': 'standard',
  // ClassCouncil legacy
  'severe': 'severe',
  'standard': 'standard',
  'caring': 'encourageant',
  'praising': 'elogieux',
};

// Mapping from unified to legacy for backwards compatibility
export const unifiedToLegacyMap: Record<UnifiedTone, string> = {
  'severe': 'severe',
  'standard': 'standard',
  'encourageant': 'encourageant',
  'elogieux': 'elogieux',
};

interface ToneConfig {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  shortLabel: string;
  description: string;
  iconColor: string;
}

const toneConfig: Record<UnifiedTone, ToneConfig> = {
  severe: {
    icon: AlertTriangle,
    label: "Sévère",
    shortLabel: "Sévère",
    description: "Ton direct et strict pour les situations problématiques",
    iconColor: "#ef4444", // Red
  },
  standard: {
    icon: BarChart3,
    label: "Standard",
    shortLabel: "Standard",
    description: "Ton factuel et objectif, basé sur l'analyse des données",
    iconColor: "#3b82f6", // Blue
  },
  encourageant: {
    icon: ThumbsUp,
    label: "Encourageant",
    shortLabel: "Encour.",
    description: "Valorise les efforts et motive l'élève à progresser",
    iconColor: "#10b981", // Green
  },
  elogieux: {
    icon: Star,
    label: "Élogieux",
    shortLabel: "Élogieux",
    description: "Félicitations chaleureuses pour les excellents résultats",
    iconColor: "#f0a830", // Gold
  },
};

const toneOrder: UnifiedTone[] = ['severe', 'standard', 'encourageant', 'elogieux'];

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
        <div className={cn("flex items-center justify-between gap-1 w-full flex-wrap sm:flex-nowrap", className)}>
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
                      "flex-1 px-2 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-center gap-1.5",
                      isActive 
                        ? "border-blue-400 bg-blue-50" 
                        : "border-slate-200 bg-white hover:border-blue-300"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.iconColor }} />
                    <span className="font-medium text-slate-700 text-xs whitespace-nowrap">
                      {config.shortLabel}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {config.description}
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
