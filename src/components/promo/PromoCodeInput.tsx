import { useState } from 'react';
import { Gift, Loader2, Check, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePromoCode } from '@/hooks/usePromoCode';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  variant?: 'default' | 'compact' | 'card';
  onSuccess?: (credits: number) => void;
  className?: string;
}

export function PromoCodeInput({ variant = 'default', onSuccess, className }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { redeemCode, isLoading, error, lastRedemption, clearError } = usePromoCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() || isLoading) return;

    const result = await redeemCode(code);
    
    if (result.success) {
      setShowSuccess(true);
      setCode('');
      onSuccess?.(result.creditsAwarded ?? 0);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
    if (error) clearError();
    if (showSuccess) setShowSuccess(false);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={code}
            onChange={handleInputChange}
            placeholder="CODE PROMO"
            className="h-9 text-sm uppercase font-mono"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!code.trim() || isLoading}
            className="bg-accent hover:bg-accent-hover text-accent-foreground"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'OK'}
          </Button>
        </form>
        
        {showSuccess && lastRedemption && (
          <p className="text-sm text-success flex items-center gap-1">
            <Check className="h-4 w-4" />
            +{lastRedemption.credits} élèves !
          </p>
        )}
        
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Vous avez un code promo ?</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={code}
            onChange={handleInputChange}
            placeholder="Entrez votre code"
            className="text-center uppercase font-mono text-lg tracking-wider"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Vérification...
              </>
            ) : (
              'Appliquer le code'
            )}
          </Button>
        </form>
        
        {showSuccess && lastRedemption && (
          <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20 text-center">
            <div className="flex items-center justify-center gap-2 text-success font-medium">
              <Sparkles className="h-5 w-5" />
              <span>+{lastRedemption.credits} élèves ajoutés !</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Gift className="h-5 w-5 text-accent" />
        <span className="text-sm">Vous avez un code promo ?</span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={code}
          onChange={handleInputChange}
          placeholder="CODE PROMO"
          className="flex-1 uppercase font-mono tracking-wider"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={!code.trim() || isLoading}
          className="bg-accent hover:bg-accent-hover text-accent-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Appliquer'
          )}
        </Button>
      </form>
      
      {showSuccess && lastRedemption && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 text-success font-medium">
            <Sparkles className="h-5 w-5" />
            <span>🎉 +{lastRedemption.credits} élèves ajoutés à votre compte !</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;
