import { useState, ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { UpgradeModal } from './UpgradeModal';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface GenerateButtonProps extends Omit<ButtonProps, 'onClick'> {
  cost: number;
  tool: 'reportcard' | 'classcouncil' | 'quizmaster';
  action: 'appreciation' | 'bilan' | 'batch' | 'quiz' | 'regeneration';
  classId?: string;
  onGenerate: () => Promise<void>;
  showCostInfo?: boolean;
  children: ReactNode;
  metadata?: Record<string, unknown>;
}

export function GenerateButton({
  cost,
  tool,
  action,
  classId,
  onGenerate,
  showCostInfo = true,
  children,
  metadata,
  disabled,
  className,
  ...buttonProps
}: GenerateButtonProps) {
  const { toast } = useToast();
  const { isAuthenticated, credits, openAuthModal } = useAuth();
  const { canGenerate, consumeCreditsServer } = useCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const balanceAfter = credits - cost;
  const hasEnoughCredits = canGenerate(cost);

  const handleClick = async () => {
    // Step 1: Check authentication (UI-level)
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Step 2: UI hint - check credits (real validation is server-side)
    if (!hasEnoughCredits) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    try {
      // Step 3: Server-side credit consumption (CRITICAL - this is the real check)
      const result = await consumeCreditsServer(cost, tool, action, classId, metadata);
      
      if (!result.success) {
        // Handle different error types
        if (result.error === 'NO_CREDITS') {
          setShowUpgradeModal(true);
        } else if (result.error === 'AUTH_REQUIRED') {
          openAuthModal();
        } else if (result.error === 'RACE_CONDITION') {
          toast({
            title: "Veuillez réessayer",
            description: "Un conflit de mise à jour s'est produit.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de la vérification des crédits.",
            variant: "destructive",
          });
        }
        return;
      }

      // Step 4: Credits consumed successfully - execute the generation
      await onGenerate();
    } catch (error) {
      console.error('Error during generation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className}
        {...buttonProps}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {children}
      </Button>

      {showCostInfo && isAuthenticated && (
        <p className={cn(
          "text-xs text-center",
          hasEnoughCredits ? "text-muted-foreground" : "text-destructive"
        )}>
          Coût : {cost} élève{cost > 1 ? 's' : ''} • 
          Solde après : {balanceAfter >= 0 ? balanceAfter : balanceAfter} élève{Math.abs(balanceAfter) > 1 ? 's' : ''}
        </p>
      )}

      <UpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}

export default GenerateButton;

