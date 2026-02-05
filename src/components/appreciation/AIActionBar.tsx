import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnonymizationQuickSelector } from "@/components/AnonymizationQuickSelector";
import { AIGenerationWarning } from "@/components/AIGenerationWarning";
import CharacterLimitSelector from "./CharacterLimitSelector";
import { AnonymizationLevel } from "@/types/privacy";

interface AIActionBarProps {
  charLimit: number;
  onCharLimitChange: (value: number) => void;
  anonymizationLevel: AnonymizationLevel;
  onAnonymizationChange: (value: AnonymizationLevel) => void;
  onGenerateAll: () => void;
  isLoading: boolean;
}

export const AIActionBar = ({
  charLimit,
  onCharLimitChange,
  anonymizationLevel,
  onAnonymizationChange,
  onGenerateAll,
  isLoading,
}: AIActionBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">IA disponible</p>
          <p className="text-xs text-muted-foreground">
            Régénérez automatiquement les appréciations avec des suggestions personnalisées
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CharacterLimitSelector
          value={charLimit}
          onChange={onCharLimitChange}
        />
        
        <TooltipProvider delayDuration={200}>
          <AnonymizationQuickSelector
            value={anonymizationLevel}
            onChange={onAnonymizationChange}
          />
        </TooltipProvider>
        
        <Button
          variant="outline"
          className="gap-2"
          onClick={onGenerateAll}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Tout générer
        </Button>
      </div>
      
      <AIGenerationWarning />
    </div>
  );
};

export default AIActionBar;
