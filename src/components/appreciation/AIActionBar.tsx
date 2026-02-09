import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AnonymizationQuickSelector } from "@/components/AnonymizationQuickSelector";
import { AIGenerationWarning } from "@/components/AIGenerationWarning";
import CharacterLimitSelector from "./CharacterLimitSelector";
import { AnonymizationLevel } from "@/types/privacy";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface AIActionBarProps {
  charLimit: number;
  onCharLimitChange: (value: number) => void;
  anonymizationLevel: AnonymizationLevel;
  onAnonymizationChange: (value: AnonymizationLevel) => void;
  onGenerateAll: () => void;
  isLoading: boolean;
  studentsCount?: number;
}

export const AIActionBar = ({
  charLimit,
  onCharLimitChange,
  anonymizationLevel,
  onAnonymizationChange,
  onGenerateAll,
  isLoading,
  studentsCount = 0,
}: AIActionBarProps) => {
  const { isAuthenticated, credits } = useAuth();
  
  const cost = studentsCount;
  const hasEnoughCredits = credits >= 1 || !isAuthenticated;
  const balanceAfter = credits - cost;

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
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-end gap-1">
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
                {isAuthenticated && studentsCount > 0 && (
                  <span className={`text-[10px] ${hasEnoughCredits ? 'text-muted-foreground' : 'text-destructive'}`}>
                    Coût : {cost} élève{cost > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            {isAuthenticated && studentsCount > 0 && (
              <TooltipContent>
                <p>Solde actuel : {credits} élève{credits > 1 ? 's' : ''}</p>
                <p>Après génération : {balanceAfter} élève{Math.abs(balanceAfter) > 1 ? 's' : ''}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <AIGenerationWarning />
    </div>
  );
};

export default AIActionBar;
