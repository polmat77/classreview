import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, AlertTriangle, Lock, Zap } from 'lucide-react';

interface CreditsBadgeProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function CreditsBadge({ className, variant = 'default' }: CreditsBadgeProps) {
  const { isAuthenticated, credits, freeCredits, paidCredits, openAuthModal } = useAuth();

  // If not authenticated, show "login to get free credits"
  if (!isAuthenticated) {
    return (
      <div className={cn(
        "flex flex-col gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20",
        "transition-all duration-200",
        className
      )}>
        <div className="flex items-center gap-2 text-secondary-foreground">
          <Zap className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium">5 élèves gratuits</span>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={openAuthModal}
          className="w-full text-xs border-secondary/30 text-secondary hover:bg-secondary/10"
        >
          Se connecter pour commencer
        </Button>
      </div>
    );
  }

  // Calculate progress (based on initial 5 free + any paid)
  const maxCredits = Math.max(5, credits);
  const progressValue = (credits / maxCredits) * 100;

  // Determine state
  const isExhausted = credits <= 0;
  const isLow = credits > 0 && credits <= 3;
  const isNormal = credits > 3;

  // Compact variant for sidebar collapsed mode
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-center p-2 rounded-lg",
        isExhausted && "bg-destructive/10 text-destructive",
        isLow && "bg-warning/10 text-warning",
        isNormal && "bg-secondary/10 text-secondary",
        className
      )}>
        <span className="text-sm font-bold">{credits}</span>
      </div>
    );
  }

  // Normal state (green/cyan)
  if (isNormal) {
    return (
      <div className={cn(
        "flex flex-col gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20",
        "transition-all duration-200",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <User className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium">{credits} élève{credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''}</span>
          </div>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2 bg-secondary/20 [&>div]:bg-secondary" 
        />
        {freeCredits > 0 && (
          <p className="text-xs text-muted-foreground">
            {freeCredits} gratuit{freeCredits > 1 ? 's' : ''} • {paidCredits} acheté{paidCredits > 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }

  // Low state (orange warning)
  if (isLow) {
    return (
      <div className={cn(
        "flex flex-col gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30",
        "transition-all duration-200",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{credits} élève{credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''}</span>
          </div>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2 bg-warning/20 [&>div]:bg-warning" 
        />
        <Button 
          size="sm" 
          variant="outline"
          className="w-full text-xs border-warning/30 text-warning hover:bg-warning/10"
          onClick={() => {/* TODO: Open upgrade modal */}}
        >
          Recharger
        </Button>
      </div>
    );
  }

  // Exhausted state (red/gray)
  return (
    <div className={cn(
      "flex flex-col gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20",
      "transition-all duration-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-destructive">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">0 élève restant</span>
        </div>
      </div>
      <Progress 
        value={0} 
        className="h-2 bg-destructive/20 [&>div]:bg-destructive" 
      />
      <Button 
        size="sm" 
        className="w-full text-xs bg-accent hover:bg-accent-hover text-accent-foreground"
        onClick={() => {/* TODO: Open upgrade modal */}}
      >
        Acheter un pack
      </Button>
    </div>
  );
}

export default CreditsBadge;
