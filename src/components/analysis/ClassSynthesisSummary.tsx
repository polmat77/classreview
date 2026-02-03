import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassSynthesisSummaryProps {
  summary: string;
}

const ClassSynthesisSummary = ({ summary }: ClassSynthesisSummaryProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Copié ✓",
        description: "Le bilan a été copié dans le presse-papiers",
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
  
  if (!summary) return null;
  
  return (
    <Card className="mb-6 border-l-4 border-l-amber-500 bg-white dark:bg-slate-800 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <FileText className="w-5 h-5 text-amber-600" />
          Bilan synthétique de la classe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
          {summary}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copié ✓
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copier le bilan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClassSynthesisSummary;
