import { Shield, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnonymizationLevel } from '@/types/privacy';

interface Props {
  value: AnonymizationLevel;
  onChange: (level: AnonymizationLevel) => void;
}

export function AnonymizationQuickSelector({ value, onChange }: Props) {
  const isMaximal = value === 'maximal';

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 h-8 text-xs px-2"
            >
              {isMaximal ? (
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="hidden sm:inline">
                {isMaximal ? 'Maximal' : 'Standard'}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Niveau d'anonymisation</p>
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={() => onChange('standard')}
          className="flex items-start gap-3 py-3 cursor-pointer"
        >
          <Shield className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Standard</p>
              {value === 'standard' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Prénom réinjecté automatiquement
            </p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onChange('maximal')}
          className="flex items-start gap-3 py-3 cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Maximal</p>
              {value === 'maximal' && <Check className="h-4 w-4 text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Remplacement manuel du prénom
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
