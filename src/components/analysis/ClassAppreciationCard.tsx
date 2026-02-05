import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy, Check, RefreshCw, Loader2, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClasseDataCSV, ClassMetadata } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";
import { deriveThemesFromStats, identifyExceptionalSubjects } from "@/utils/appreciationThemeAnalyzer";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClassAppreciationCardProps {
  classeData: ClasseDataCSV;
  metadata: ClassMetadata;
}

// Character limit options (200 to 400 by steps of 25)
const CHARACTER_LIMITS = [200, 225, 255, 280, 305, 330, 355, 380, 400];

// Local storage key for persisting preference
const STORAGE_KEY = "classcouncil-class-appreciation-char-limit";

/**
 * Truncate text intelligently, preserving sentence structure
 */
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const bestCut = Math.max(lastPeriod, lastExclamation);

  if (bestCut > maxLength * 0.85) {
    return text.substring(0, bestCut + 1).trim();
  }

  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.90) {
    return text.substring(0, lastSpace).trim() + '.';
  }

  return text.substring(0, maxLength - 3).trim() + '...';
}

const ClassAppreciationCard = ({ classeData, metadata }: ClassAppreciationCardProps) => {
  const { toast } = useToast();
  const [appreciation, setAppreciation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [characterLimit, setCharacterLimit] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 255;
  });

  // Persist character limit preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, characterLimit.toString());
  }, [characterLimit]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Derive themes from statistical data
      const themes = deriveThemesFromStats(classeData);
      const exceptionalSubjects = identifyExceptionalSubjects(classeData);
      
      const { data, error } = await supabase.functions.invoke('generate-class-appreciation', {
        body: {
          classData: {
            className: metadata.className,
            period: metadata.period,
            studentCount: metadata.studentCount,
          },
          themes,
          exceptionalSubjects,
          tone: 'standard',
          maxCharacters: characterLimit,
        },
      });
      
      if (error) {
        // Handle rate limiting
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          toast({
            title: "Limite atteinte",
            description: "Trop de requêtes. Veuillez patienter quelques instants.",
            variant: "destructive",
          });
          return;
        }
        // Handle credits exhausted
        if (error.message?.includes('402') || error.message?.includes('credit')) {
          toast({
            title: "Crédits épuisés",
            description: "Veuillez ajouter des crédits à votre espace.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }
      
      if (data?.appreciation) {
        setAppreciation(data.appreciation);
        setHasGenerated(true);
        toast({
          title: "✓ Appréciation générée",
          description: `${data.appreciation.length}/${characterLimit} caractères`,
        });
      }
    } catch (error) {
      console.error('Error generating appreciation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'appréciation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTruncate = () => {
    if (appreciation.length > characterLimit) {
      const truncated = truncateIntelligently(appreciation, characterLimit);
      setAppreciation(truncated);
      toast({
        title: "Texte raccourci",
        description: `${truncated.length}/${characterLimit} caractères`,
      });
    }
  };
  
  const handleCopy = async () => {
    if (!appreciation) return;
    
    try {
      await navigator.clipboard.writeText(appreciation);
      setCopied(true);
      toast({
        title: "Copié ✓",
        description: "L'appréciation a été copiée dans le presse-papiers",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  // Character count and status
  const charCount = appreciation.length;
  const charPercentage = Math.min((charCount / characterLimit) * 100, 100);
  const isOverLimit = charCount > characterLimit;
  const isNearLimit = charCount > characterLimit * 0.95 && !isOverLimit;
  const remainingChars = characterLimit - charCount;
  
  return (
    <Card className="mb-6 border-l-4 border-l-cyan-500 bg-white dark:bg-slate-800 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <MessageSquare className="w-5 h-5 text-cyan-600" />
              Appréciation de la classe
            </CardTitle>
            <CardDescription className="mt-1">
              Synthèse pour le bulletin du conseil de classe
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasGenerated ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Générez une appréciation basée sur l'analyse thématique des appréciations des professeurs
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent-hover"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Générer l'appréciation
            </Button>
          </div>
        ) : (
          <>
            {/* Appreciation text */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {appreciation}
              </p>
            </div>
            
            {/* Character counter */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  isOverLimit && "text-destructive",
                  isNearLimit && "text-orange-600 dark:text-orange-400",
                  !isOverLimit && !isNearLimit && "text-green-600 dark:text-green-400"
                )}>
                  {charCount}/{characterLimit} caractères
                </span>
                
                {isOverLimit ? (
                  <Badge variant="destructive" className="text-xs">
                    Dépassement de {charCount - characterLimit}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    ✓ Conforme
                  </Badge>
                )}
              </div>
              
              <span className="text-sm text-muted-foreground">
                {remainingChars > 0 ? `${remainingChars} restants` : ''}
              </span>
            </div>
            
            {/* Progress bar */}
            <Progress 
              value={charPercentage}
              className={cn(
                "h-2 mb-4",
                isOverLimit && "[&>div]:bg-destructive",
                isNearLimit && "[&>div]:bg-orange-500",
                !isOverLimit && !isNearLimit && "[&>div]:bg-green-500"
              )}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              {isOverLimit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTruncate}
                  className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Scissors className="w-4 h-4" />
                  Raccourcir
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopy}
                disabled={!appreciation}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copié ✓
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </Button>
              
              <Button 
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading}
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent-hover"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Régénérer
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassAppreciationCard;
