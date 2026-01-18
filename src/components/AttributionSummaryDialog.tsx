import { Attribution, attributionConfig } from "@/types/attribution";
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  ThumbsUp, 
  Star, 
  Trophy,
  HelpCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AttributionSummary {
  congratulations: number;
  honor: number;
  encouragement: number;
  warning_work: number;
  warning_conduct: number;
  warning_both: number;
  none: number;
}

interface AttributionSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: AttributionSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

const iconMap = {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ThumbsUp,
  Star,
  Trophy,
};

const AttributionSummaryDialog = ({
  open,
  onOpenChange,
  summary,
  onConfirm,
  onCancel,
}: AttributionSummaryDialogProps) => {
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  
  const items: { key: Attribution | 'none'; label: string; icon: React.ElementType; color: string }[] = [
    { 
      key: 'congratulations', 
      label: 'Félicitations', 
      icon: Trophy, 
      color: 'text-violet-500' 
    },
    { 
      key: 'honor', 
      label: 'Tableau d\'honneur', 
      icon: Star, 
      color: 'text-emerald-500' 
    },
    { 
      key: 'encouragement', 
      label: 'Encouragements', 
      icon: ThumbsUp, 
      color: 'text-blue-500' 
    },
    { 
      key: 'warning_work', 
      label: 'Avert. Travail', 
      icon: AlertTriangle, 
      color: 'text-orange-500' 
    },
    { 
      key: 'warning_conduct', 
      label: 'Avert. Conduite', 
      icon: AlertCircle, 
      color: 'text-red-500' 
    },
    { 
      key: 'warning_both', 
      label: 'Avert. Travail & Conduite', 
      icon: XCircle, 
      color: 'text-red-600' 
    },
    { 
      key: 'none', 
      label: 'Aucune suggestion', 
      icon: HelpCircle, 
      color: 'text-muted-foreground' 
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 Résumé des suggestions d'attributions
          </DialogTitle>
          <DialogDescription>
            Voici les attributions suggérées pour les {total} élèves analysés.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          {items.map(({ key, label, icon: Icon, color }) => {
            const count = summary[key];
            if (count === 0) return null;
            
            return (
              <div 
                key={key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="font-medium">{label}</span>
                </div>
                <span className="text-lg font-bold">
                  {count} élève{count > 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>
            ✓ Appliquer ces suggestions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttributionSummaryDialog;
