import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  StudentBulletinAnalysis,
  BulletinJustification,
  ANALYSIS_CATEGORIES
} from '@/types/bulletinAnalysis';
import { groupJustificationsByCategory } from '@/utils/bulletinAnalysisGenerator';
import { cn } from '@/lib/utils';

interface BulletinAnalysisSectionProps {
  analysis: StudentBulletinAnalysis;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

const BulletinAnalysisSection = ({
  analysis,
  onRegenerate,
  isLoading = false
}: BulletinAnalysisSectionProps) => {
  const [justificationsOpen, setJustificationsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const groupedJustifications = groupJustificationsByCategory(analysis.justifications);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.analyseTexte);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Get keyword color class - using semantic-ish classes for keyword highlighting
  const getKeywordClass = (type: 'positif' | 'negatif' | 'alerte'): string => {
    switch (type) {
      case 'positif':
        return 'bg-success/20 text-success';
      case 'negatif':
        return 'bg-warning/20 text-warning';
      case 'alerte':
        return 'bg-destructive/20 text-destructive';
      default:
        return '';
    }
  };
  
  // Escape regex special characters to prevent ReDoS attacks
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Highlight keywords in text using React elements (safe from XSS)
  const highlightText = (text: string, keywords: BulletinJustification['motsCles']): React.ReactNode => {
    if (keywords.length === 0) return <span>{text}</span>;
    
    // Build a regex that matches all keywords (escaped for safety)
    const pattern = keywords.map(k => `(${escapeRegex(k.word)})`).join('|');
    if (!pattern) return <span>{text}</span>;
    
    const regex = new RegExp(pattern, 'gi');
    
    // Split text by keywords and build React elements
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before match (React automatically escapes)
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Find which keyword matched
      const matchedText = match[0];
      const keyword = keywords.find(k => 
        k.word.toLowerCase() === matchedText.toLowerCase()
      );
      
      // Add highlighted keyword (React escapes the content - safe from XSS)
      if (keyword) {
        parts.push(
          <mark 
            key={`${match.index}-${keyIndex++}`}
            className={`${getKeywordClass(keyword.type)} px-0.5 rounded`}
          >
            {matchedText}
          </mark>
        );
      } else {
        parts.push(matchedText);
      }
      
      lastIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return <span>{parts}</span>;
  };
  
  const categoryOrder: (keyof typeof ANALYSIS_CATEGORIES)[] = [
    'resultats', 'travail', 'comportement', 'assiduite', 'positif', 'negatif'
  ];
  
  return (
    <div className="space-y-3 border-t pt-4 mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Analyse du bulletin
          </h4>
        </div>
        
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  disabled={!analysis.analyseTexte}
                  className="h-7 w-7 p-0"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Copier l'analyse</p>
              </TooltipContent>
            </Tooltip>
            
            {onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    disabled={isLoading}
                    className="h-7 w-7 p-0"
                  >
                    <RefreshCw className={cn(
                      "h-3.5 w-3.5",
                      isLoading && "animate-spin"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Régénérer l'analyse</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
      
      {/* Analysis Text */}
      <p className="text-sm leading-relaxed text-foreground bg-muted/30 p-3 rounded-lg">
        {analysis.analyseTexte || (
          <span className="text-muted-foreground italic">
            Aucune analyse disponible.
          </span>
        )}
      </p>
      
      {/* Justifications Collapsible */}
      {analysis.justifications.length > 0 && (
        <Collapsible open={justificationsOpen} onOpenChange={setJustificationsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8"
            >
              <span className="flex items-center gap-2 text-xs">
                {justificationsOpen ? 'Masquer' : 'Voir'} les justifications ({analysis.justifications.length})
              </span>
              {justificationsOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-2 space-y-3 bg-muted/20 p-3 rounded-lg border border-border/50">
              {categoryOrder.map(categoryId => {
                const justifs = groupedJustifications[categoryId];
                if (!justifs || justifs.length === 0) return null;
                
                const category = ANALYSIS_CATEGORIES[categoryId];
                
                return (
                  <div key={categoryId} className="space-y-2">
                    <div className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      category.color
                    )}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                    
                    <div className="space-y-1.5 pl-6">
                      {justifs.map((j, idx) => (
                        <div 
                          key={idx}
                          className="text-sm border-l-2 border-border pl-3 py-1"
                        >
                          <span className="font-medium text-foreground">
                            {j.matiere} :
                          </span>{' '}
                          <span className="text-muted-foreground italic">
                            "{highlightText(j.extrait, j.motsCles)}"
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {categoryId !== categoryOrder[categoryOrder.length - 1] && 
                     groupedJustifications[categoryOrder[categoryOrder.indexOf(categoryId) + 1]] && (
                      <Separator className="my-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default BulletinAnalysisSection;
