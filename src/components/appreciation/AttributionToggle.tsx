import { Lightbulb, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AttributionToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onApplySuggestions: () => void;
  isAnalyzing: boolean;
}

export const AttributionToggle = ({
  enabled,
  onToggle,
  onApplySuggestions,
  isAnalyzing,
}: AttributionToggleProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-3">
        <Checkbox
          id="enable-attributions"
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <Label htmlFor="enable-attributions" className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium">Activer les attributions</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            (Avertissements, Encouragements, Félicitations...)
          </span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" side="right">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Attributions du conseil de classe
              </h4>
              <p className="text-sm text-muted-foreground">
                Les attributions sont des mentions décernées par le conseil de classe pour valoriser ou alerter les élèves :
              </p>
              <div className="text-sm space-y-1.5">
                <p>⚠️ <strong>Avert. Travail</strong> : 3+ mentions négatives sur le travail</p>
                <p>⚠️ <strong>Avert. Conduite</strong> : comportement grave ou 2+ incidents modérés</p>
                <p>⚠️ <strong>Avert. Travail & Conduite</strong> : cumul des deux</p>
                <p>👍 <strong>Encouragements</strong> : 2+ mentions de progrès ou efforts</p>
                <p>⭐ <strong>Tableau d'honneur</strong> : bons résultats (14+) et bonne attitude</p>
                <p>🏆 <strong>Félicitations</strong> : mentions d'excellence</p>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                ClassCouncil AI suggère automatiquement une attribution basée sur l'analyse des appréciations des professeurs.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {enabled && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onApplySuggestions}
          disabled={isAnalyzing}
        >
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Appliquer suggestions</span>
        </Button>
      )}
    </div>
  );
};

export default AttributionToggle;
