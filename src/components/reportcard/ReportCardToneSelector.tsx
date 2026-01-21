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

// Tone configuration with colors and icons
const toneConfig: Record<AppreciationTone, {
  icon: typeof AlertTriangle;
  label: string;
  shortLabel: string;
  bgColor: string;
  bgColorSelected: string;
  borderColor: string;
  iconColor: string;
  hoverBg: string;
}> = {
  ferme: {
    icon: AlertTriangle,
    label: 'Ferme mais juste',
    shortLabel: 'Ferme',
    bgColor: 'bg-red-100',
    bgColorSelected: 'bg-red-500',
    borderColor: 'border-red-500',
    iconColor: 'text-red-600',
    hoverBg: 'hover:bg-red-50',
  },
  neutre: {
    icon: Minus,
    label: 'Neutre et factuel',
    shortLabel: 'Neutre',
    bgColor: 'bg-gray-100',
    bgColorSelected: 'bg-gray-500',
    borderColor: 'border-gray-500',
    iconColor: 'text-gray-600',
    hoverBg: 'hover:bg-gray-50',
  },
  bienveillant: {
    icon: Heart,
    label: 'Bienveillant',
    shortLabel: 'Bienv.',
    bgColor: 'bg-pink-100',
    bgColorSelected: 'bg-pink-500',
    borderColor: 'border-pink-500',
    iconColor: 'text-pink-600',
    hoverBg: 'hover:bg-pink-50',
  },
  encourageant: {
    icon: ThumbsUp,
    label: 'Encourageant',
    shortLabel: 'Encour.',
    bgColor: 'bg-green-100',
    bgColorSelected: 'bg-green-500',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
  },
  constructif: {
    icon: TrendingUp,
    label: 'Constructif',
    shortLabel: 'Constr.',
    bgColor: 'bg-blue-100',
    bgColorSelected: 'bg-blue-500',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
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
        <div className="flex items-center gap-1">
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
                      "flex items-center gap-1 px-2 py-1.5 rounded-md transition-all duration-200",
                      isActive
                        ? `${config.bgColorSelected} text-white shadow-sm`
                        : `${config.bgColor} ${config.hoverBg} ${config.iconColor} opacity-70 hover:opacity-100`
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {isActive && <span className="text-xs font-medium">{config.shortLabel}</span>}
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
        <div className="flex items-center gap-3">
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
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200",
                      config.bgColor,
                      config.hoverBg,
                      isActive 
                        ? `${config.borderColor} border-2 scale-110 shadow-md` 
                        : "border border-transparent hover:-translate-y-0.5"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", config.iconColor)} />
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
