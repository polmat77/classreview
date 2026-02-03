import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClasseDataCSV, ClassMetadata } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";
import { deriveThemesFromStats, identifyExceptionalSubjects, AppreciationThemes } from "@/utils/appreciationThemeAnalyzer";
import ToneSelector from "@/components/ToneSelector";
import { AppreciationTone } from "@/types/appreciation";

interface ClassAppreciationCardProps {
  classeData: ClasseDataCSV;
  metadata: ClassMetadata;
}

const ClassAppreciationCard = ({ classeData, metadata }: ClassAppreciationCardProps) => {
  const { toast } = useToast();
  const [appreciation, setAppreciation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<AppreciationTone>('standard');
  const [hasGenerated, setHasGenerated] = useState(false);
  
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
          tone,
          maxWords: 200,
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
          description: "L'appréciation de classe a été générée avec succès.",
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
  
  // Count words
  const wordCount = appreciation.trim().split(/\s+/).filter(Boolean).length;
  
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
              Synthèse en 3 paragraphes basée sur l'analyse thématique (150-200 mots)
            </CardDescription>
          </div>
        </div>
        
        {/* Tone selector */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tonalité
          </label>
          <ToneSelector value={tone} onChange={setTone} />
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasGenerated ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Générez une appréciation structurée basée sur l'analyse de la classe
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
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {appreciation}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {wordCount} mots
              </span>
              
              <div className="flex gap-2">
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassAppreciationCard;
