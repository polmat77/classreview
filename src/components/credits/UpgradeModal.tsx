import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const pricingPlans = [
  {
    id: 'one_class',
    name: '1 Classe',
    students: 35,
    price: 4.99,
    pricePerStudent: (4.99 / 35).toFixed(3),
    recommended: false,
  },
  {
    id: 'four_classes',
    name: '4 Classes',
    students: 140,
    price: 14.99,
    pricePerStudent: (14.99 / 140).toFixed(3),
    recommended: true,
  },
  {
    id: 'year',
    name: 'Année complète',
    students: 500,
    price: 29.99,
    pricePerStudent: (29.99 / 500).toFixed(3),
    recommended: false,
  },
  {
    id: 'all_classes',
    name: 'Toutes les classes',
    students: 2000,
    price: 39.99,
    pricePerStudent: (39.99 / 2000).toFixed(3),
    recommended: false,
  },
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            Vous avez aimé ? Continuez à gagner du temps !
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Vos 5 élèves gratuits sont utilisés
          </DialogDescription>
        </DialogHeader>

        {/* Reassurance */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="h-4 w-4" />
            <span>Vos données restent accessibles</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="h-4 w-4" />
            <span>Les appréciations déjà générées sont copiables</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative p-4 transition-all duration-200 hover:shadow-md",
                plan.recommended && "border-2 border-accent shadow-lg"
              )}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  RECOMMANDÉ
                </Badge>
              )}
              
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <div className="text-3xl font-bold text-foreground">
                  {plan.price}€
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.students} élèves
                </p>
                <p className="text-xs text-muted-foreground">
                  soit {plan.pricePerStudent}€/élève
                </p>
                <Button
                  className={cn(
                    "w-full mt-4",
                    plan.recommended 
                      ? "bg-accent hover:bg-accent-hover text-accent-foreground" 
                      : "bg-primary hover:bg-primary-hover"
                  )}
                  disabled
                >
                  Choisir
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment notice */}
        <div className="mt-6 p-4 bg-muted/50 rounded-xl text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Le paiement sera bientôt disponible.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Mail className="h-4 w-4" />
            <a href="mailto:contact@aiproject4you.com" className="hover:underline">
              Contactez-nous à contact@aiproject4you.com
            </a>
          </div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
