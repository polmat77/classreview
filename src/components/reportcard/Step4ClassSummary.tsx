import { useState } from "react";
import {
  Student,
  ClassSummary,
  GeneratedAppreciation,
  workLevelLabels,
  behaviorLabels,
  participationLabels,
  progressionLabels,
} from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Download,
  RotateCcw,
  Briefcase,
  Users,
  Hand,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Step4ClassSummaryProps {
  students: Student[];
  classSummary: ClassSummary;
  onClassSummaryChange: (classSummary: ClassSummary) => void;
  appreciations: GeneratedAppreciation[];
  onBack: () => void;
  onReset: () => void;
}

const Step4ClassSummary = ({
  students,
  classSummary,
  onClassSummaryChange,
  appreciations,
  onBack,
  onReset,
}: Step4ClassSummaryProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptionChange = (
    category: "workLevel" | "behavior" | "participation" | "progression",
    value: string
  ) => {
    onClassSummaryChange({
      ...classSummary,
      options: {
        ...classSummary.options,
        [category]: value,
      },
    });
  };

  const canGenerate =
    classSummary.options.workLevel &&
    classSummary.options.behavior &&
    classSummary.options.participation &&
    classSummary.options.progression;

  const generateSummary = async () => {
    if (!canGenerate) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une option dans chaque catégorie",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const classStats = {
        totalStudents: students.length,
        averageGrade:
          students.filter((s) => s.average !== null).reduce((sum, s) => sum + (s.average || 0), 0) /
            students.filter((s) => s.average !== null).length || 0,
      };

      const { data, error } = await supabase.functions.invoke("generate-reportcard-summary", {
        body: {
          options: classSummary.options,
          classStats,
          labels: {
            workLevel: workLevelLabels[classSummary.options.workLevel!],
            behavior: behaviorLabels[classSummary.options.behavior!],
            participation: participationLabels[classSummary.options.participation!],
            progression: progressionLabels[classSummary.options.progression!],
          },
        },
      });

      if (error) throw error;

      onClassSummaryChange({
        ...classSummary,
        generatedText: data.summary,
      });

      toast({ title: "Bilan généré !" });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le bilan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(classSummary.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié !" });
  };

  const handleExportAll = () => {
    let content = "=== BILAN DE LA CLASSE ===\n\n";
    content += classSummary.generatedText + "\n\n";
    content += "=== APPRECIATIONS INDIVIDUELLES ===\n\n";

    appreciations.forEach((a) => {
      const student = students.find((s) => s.id === a.studentId);
      if (student) {
        content += `${student.lastName} ${student.firstName}\n`;
        content += `${a.text}\n\n---\n\n`;
      }
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulletin-complet.txt";
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Export réussi", description: "Fichier complet téléchargé" });
  };

  const categories = [
    {
      key: "workLevel" as const,
      title: "Niveau global de travail",
      icon: Briefcase,
      options: workLevelLabels,
    },
    {
      key: "behavior" as const,
      title: "Comportement et ambiance",
      icon: Users,
      options: behaviorLabels,
    },
    {
      key: "participation" as const,
      title: "Participation",
      icon: Hand,
      options: participationLabels,
    },
    {
      key: "progression" as const,
      title: "Progression",
      icon: TrendingUp,
      options: progressionLabels,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bilan général de la classe</h1>
        <p className="text-muted-foreground">
          Sélectionnez les caractéristiques de la classe pour générer le bilan
        </p>
      </div>

      {/* Category selectors */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={classSummary.options[category.key] || ""}
                  onValueChange={(value) => handleOptionChange(category.key, value)}
                  className="space-y-2"
                >
                  {Object.entries(category.options).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`${category.key}-${value}`} />
                      <Label
                        htmlFor={`${category.key}-${value}`}
                        className="text-sm cursor-pointer"
                      >
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={generateSummary}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          Générer le bilan
        </Button>
      </div>

      {/* Generated summary */}
      {classSummary.generatedText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bilan de la classe</CardTitle>
                <CardDescription>
                  {classSummary.generatedText.length} caractères
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateSummary} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copier
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={classSummary.generatedText}
              onChange={(e) =>
                onClassSummaryChange({ ...classSummary, generatedText: e.target.value })
              }
              className="min-h-[150px] resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Export all */}
      {classSummary.generatedText && appreciations.length > 0 && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Export complet</h3>
                <p className="text-sm text-muted-foreground">
                  Téléchargez le bilan et toutes les appréciations
                </p>
              </div>
              <Button onClick={handleExportAll} className="bg-success hover:bg-success/90">
                <Download className="w-4 h-4 mr-2" />
                Exporter tout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Nouvelle session
        </Button>
      </div>
    </div>
  );
};

export default Step4ClassSummary;
