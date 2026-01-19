import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check, AlertTriangle, Copy, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FIRST_NAME_PLACEHOLDER } from '@/types/privacy';

interface Props {
  appreciation: string;
  firstName: string;
  onUpdate: (updatedAppreciation: string) => void;
  onCopy?: () => void;
}

export function ManualFirstNameReplacer({ appreciation, firstName, onUpdate, onCopy }: Props) {
  const [editedText, setEditedText] = useState(appreciation);
  const [isReplaced, setIsReplaced] = useState(false);

  useEffect(() => {
    setEditedText(appreciation);
    setIsReplaced(!appreciation.includes(FIRST_NAME_PLACEHOLDER));
  }, [appreciation]);

  // Count occurrences of {prénom}
  const placeholderCount = (editedText.match(/\{prénom\}/gi) || []).length;
  const hasPlaceholders = placeholderCount > 0;

  const handleAutoReplace = () => {
    const replaced = editedText
      .replace(/\{prénom\}/gi, firstName)
      .replace(/\{prenom\}/gi, firstName);
    setEditedText(replaced);
    setIsReplaced(true);
    onUpdate(replaced);
    toast.success(`Prénom "${firstName}" inséré avec succès`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    toast.success('Appréciation copiée dans le presse-papiers');
    onCopy?.();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditedText(newText);
    const stillHasPlaceholders = /\{prénom\}/gi.test(newText);
    setIsReplaced(!stillHasPlaceholders);
    onUpdate(newText);
  };

  return (
    <div className="space-y-3">
      {/* Alert for maximal mode */}
      {hasPlaceholders && (
        <Alert variant="default" className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Mode anonymisation maximale</span> — L'appréciation contient{' '}
            {placeholderCount > 1 
              ? `${placeholderCount} occurrences de {'{prénom}'}` 
              : `{'{prénom}'}`
            } à remplacer.
          </AlertDescription>
        </Alert>
      )}

      {/* Editable text area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Appréciation :</span>
          {isReplaced && (
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              <Check className="h-3 w-3 mr-1" />
              Prénom inséré
            </Badge>
          )}
        </div>
        
        <Textarea
          value={editedText}
          onChange={handleTextChange}
          className="min-h-[100px] resize-none"
          maxLength={450}
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{editedText.length}/450 caractères</span>
          {hasPlaceholders && (
            <span className="flex items-center gap-1">
              💡 Les <code className="bg-muted px-1 rounded">{'{prénom}'}</code> peuvent être remplacés automatiquement
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {hasPlaceholders && (
          <Button onClick={handleAutoReplace} variant="default" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Remplacer par "{firstName}"
          </Button>
        )}
        
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
          <Copy className="h-4 w-4" />
          Copier
        </Button>
      </div>

      {/* Privacy info */}
      <div className="text-xs text-muted-foreground border-t pt-3 mt-2 space-y-1">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span><strong>Mode maximal actif</strong> — Aucune donnée nominative envoyée à l'IA</span>
        </p>
        <p className="pl-5">
          ✓ Le nom de famille n'a jamais été transmis
        </p>
      </div>
    </div>
  );
}
