import { AlertTriangle, Minus, Heart, Trophy } from "lucide-react";
import { AppreciationTone, toneConfig } from "@/types/appreciation";
import { cn } from "@/lib/utils";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (tone: AppreciationTone) => void;
  compact?: boolean;
}

const iconMap = {
  AlertTriangle,
  Minus,
  Heart,
  Trophy,
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  const tones: AppreciationTone[] = ['severe', 'standard', 'caring', 'praising'];

  if (compact) {
    const activeConfig = toneConfig[value];
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {tones.map((tone) => {
            const config = toneConfig[tone];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isActive = value === tone;
            
            return (
              <button
                key={tone}
                type="button"
                onClick={() => onChange(tone)}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  isActive
                    ? `${config.bgColor} text-white shadow-sm`
                    : `bg-muted/50 hover:bg-muted ${config.color}`
                )}
                title={config.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
        <span className={cn("text-xs font-medium", activeConfig.color)}>
          {activeConfig.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tones.map((tone) => {
        const config = toneConfig[tone];
        const Icon = iconMap[config.icon as keyof typeof iconMap];
        const isActive = value === tone;
        
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm",
              isActive
                ? `${config.bgColor} text-white border-transparent shadow-md scale-105`
                : `bg-background ${config.borderColor} ${config.color} hover:bg-muted/50`
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
