import { useState, ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { UpgradeModal } from './UpgradeModal';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { isAuthenticated, credits, openAuthModal } = useAuth();
  const { canGenerate, consumeCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const balanceAfter = credits - cost;
  const hasEnoughCredits = canGenerate(cost);

  const handleClick = async () => {
    // Step 1: Check authentication
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Step 2: Check credits
    if (!hasEnoughCredits) {
      setShowUpgradeModal(true);
      return;
    }

    // Step 3: Consume credits and execute
    setIsLoading(true);
    try {
      const success = await consumeCredits(cost, tool, action, classId, metadata);
      if (success) {
        await onGenerate();
      } else {
        setShowUpgradeModal(true);
      }
    } catch (error) {
      console.error('Error during generation:', error);
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
