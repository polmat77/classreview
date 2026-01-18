import { Attribution, attributionConfig } from "@/types/attribution";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  ThumbsUp, 
  Star, 
  Trophy,
  Lightbulb,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttributionSelectorProps {
  value: Attribution | null;
  suggestedValue?: Attribution | null;
  onChange: (value: Attribution | null) => void;
  compact?: boolean;
  className?: string;
}

const iconMap = {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ThumbsUp,
  Star,
  Trophy,
};

const attributionOrder: Attribution[] = [
  'congratulations',
  'honor',
  'encouragement',
  'warning_work',
  'warning_conduct',
  'warning_both',
];

const AttributionSelector = ({
  value,
  suggestedValue,
  onChange,
  compact = false,
  className,
}: AttributionSelectorProps) => {
  const isSuggested = value !== null && value === suggestedValue;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? null : v as Attribution)}
      >
        <SelectTrigger 
          className={cn(
            "min-w-[180px]",
            compact && "h-8 text-sm",
            value && attributionConfig[value]?.borderColor,
            value && "border-2"
          )}
        >
          <SelectValue placeholder="Aucune attribution">
            {value ? (
              <span className="flex items-center gap-2">
                {(() => {
                  const config = attributionConfig[value];
                  const Icon = iconMap[config.icon as keyof typeof iconMap];
                  return (
                    <>
                      <Icon 
                        className="h-4 w-4" 
                        style={{ color: config.color }} 
                      />
                      <span className={compact ? "text-xs" : "text-sm"}>
                        {config.shortLabel}
                      </span>
                    </>
                  );
                })()}
              </span>
            ) : (
              <span className="text-muted-foreground">Aucune</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="flex items-center gap-2">
              <X className="h-4 w-4 text-muted-foreground" />
              <span>Aucune attribution</span>
            </span>
          </SelectItem>
          
          {/* Separator */}
          <div className="my-1 border-t" />
          
          {/* Positive attributions */}
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Positives
          </div>
          {attributionOrder.filter(a => !attributionConfig[a].isNegative).map((attr) => {
            const config = attributionConfig[attr];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isThisSuggested = attr === suggestedValue;
            
            return (
              <SelectItem key={attr} value={attr}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                  <span>{config.shortLabel}</span>
                  {isThisSuggested && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-amber-500">
                      <Lightbulb className="h-3 w-3" />
                      Suggéré
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
          
          {/* Separator */}
          <div className="my-1 border-t" />
          
          {/* Negative attributions */}
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Avertissements
          </div>
          {attributionOrder.filter(a => attributionConfig[a].isNegative).map((attr) => {
            const config = attributionConfig[attr];
            const Icon = iconMap[config.icon as keyof typeof iconMap];
            const isThisSuggested = attr === suggestedValue;
            
            return (
              <SelectItem key={attr} value={attr}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                  <span>{config.shortLabel}</span>
                  {isThisSuggested && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-amber-500">
                      <Lightbulb className="h-3 w-3" />
                      Suggéré
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {isSuggested && (
        <span className="flex items-center gap-1 text-xs text-amber-500 whitespace-nowrap">
          <Lightbulb className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Suggéré</span>
        </span>
      )}
    </div>
  );
};

export default AttributionSelector;
