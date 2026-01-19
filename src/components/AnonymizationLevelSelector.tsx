import { Shield, ShieldCheck, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnonymizationLevel } from '@/types/privacy';

interface Props {
  value: AnonymizationLevel;
  onChange: (level: AnonymizationLevel) => void;
}

export function AnonymizationLevelSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Niveau d'anonymisation
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm p-4">
              <div className="space-y-3">
                <p className="font-semibold">Protection des données élèves</p>
                <p className="text-sm text-muted-foreground">
                  Dans tous les cas, le nom de famille et la classe ne sont{' '}
                  <strong>jamais</strong> transmis à l'IA.
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette option contrôle uniquement le traitement du prénom dans l'appréciation finale.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as AnonymizationLevel)}>
        <div className="space-y-3">
          {/* Standard Option */}
          <label 
            htmlFor="level-standard"
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              value === 'standard' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <RadioGroupItem value="standard" id="level-standard" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Standard</span>
                <Badge variant="secondary" className="text-xs">Recommandé</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Le prénom est remplacé par <code className="bg-muted px-1 rounded">{'{prénom}'}</code> avant 
                l'envoi à l'IA, puis réinjecté automatiquement dans l'appréciation générée.
              </p>
            </div>
          </label>

          {/* Maximal Option */}
          <label 
            htmlFor="level-maximal"
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              value === 'maximal' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground/50'
            }`}
          >
            <RadioGroupItem value="maximal" id="level-maximal" className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">Maximal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Le prénom reste affiché comme <code className="bg-muted px-1 rounded">{'{prénom}'}</code> dans 
                l'appréciation. Vous devrez le remplacer manuellement avant utilisation.
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" />
        Dans les deux modes, le nom de famille et la classe ne sont jamais transmis à l'IA.
      </p>
    </div>
  );
}
