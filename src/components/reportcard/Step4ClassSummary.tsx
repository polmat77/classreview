import { useState, useMemo } from "react";
import {
  Student,
  ClassSummary,
  GeneratedAppreciation,
  AppreciationTone,
  workLevelLabels,
  behaviorLabels,
  participationLabels,
  progressionLabels,
} from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Loader2,
  Download,
  Briefcase,
  Users,
  Hand,
  TrendingUp,
  Settings2,
  Info,
  Scissors,
  AlertTriangle,
} from "lucide-react";
import ReportCardToneSelector from "./ReportCardToneSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface Step4ClassSummaryProps {
  students: Student[];
  classSummary: ClassSummary;
  onClassSummaryChange: (classSummary: ClassSummary) => void;
  appreciations: GeneratedAppreciation[];
  onBack: () => void;
}

const Step4ClassSummary = ({
  students,
  classSummary,
  onClassSummaryChange,
  appreciations,
  onBack,
}: Step4ClassSummaryProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Default values
  const maxCharacters = classSummary.maxCharacters || 350;
  const tone = classSummary.tone || 'neutre';
  
  // Truncate function
  const truncateIntelligently = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const bestCut = Math.max(lastPeriod, lastExclamation);
    
    if (bestCut > maxLength * 0.7) {
      return truncated.substring(0, bestCut + 1);
    }
    
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '.';
    }
    
    return truncated.substring(0, maxLength - 3) + '...';
  };

  const handleTruncate = () => {
    const truncated = truncateIntelligently(classSummary.generatedText, maxCharacters);
    onClassSummaryChange({ ...classSummary, generatedText: truncated });
    toast({ title: "Bilan tronqué", description: `${truncated.length}/${maxCharacters} caractères` });
  };

  const isOverLimit = classSummary.generatedText.length > maxCharacters;

  // Calculate grade distribution
  const gradeDistribution = useMemo(() => {
    const ranges = [
      { label: "0-5", min: 0, max: 5, color: "hsl(var(--destructive))" },
      { label: "5-8", min: 5, max: 8, color: "hsl(var(--destructive))" },
      { label: "8-10", min: 8, max: 10, color: "hsl(var(--warning))" },
      { label: "10-12", min: 10, max: 12, color: "hsl(var(--warning))" },
      { label: "12-14", min: 12, max: 14, color: "hsl(var(--primary))" },
      { label: "14-16", min: 14, max: 16, color: "hsl(var(--success))" },
      { label: "16-18", min: 16, max: 18, color: "hsl(var(--success))" },
      { label: "18-20", min: 18, max: 20, color: "hsl(var(--success))" },
    ];

    return ranges.map(range => ({
      ...range,
      count: students.filter(s => 
        s.average !== null && s.average >= range.min && s.average < (range.max === 20 ? 21 : range.max)
      ).length,
    }));
  }, [students]);

  // Calculate class stats
  const classStats = useMemo(() => {
    const studentsWithGrades = students.filter(s => s.average !== null);
    const averageGrade = studentsWithGrades.length > 0
      ? studentsWithGrades.reduce((sum, s) => sum + (s.average || 0), 0) / studentsWithGrades.length
      : 0;
    
    const aboveAverage = studentsWithGrades.filter(s => (s.average || 0) >= 10).length;
    const belowAverage = studentsWithGrades.filter(s => (s.average || 0) < 10).length;
    
    return {
      totalStudents: students.length,
      averageGrade,
      aboveAverage,
      belowAverage,
    };
  }, [students]);

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
      const { data, error } = await supabase.functions.invoke("generate-reportcard-summary", {
        body: {
          options: classSummary.options,
          classStats: {
            totalStudents: classStats.totalStudents,
            averageGrade: classStats.averageGrade,
          },
          labels: {
            workLevel: workLevelLabels[classSummary.options.workLevel!],
            behavior: behaviorLabels[classSummary.options.behavior!],
            participation: participationLabels[classSummary.options.participation!],
            progression: progressionLabels[classSummary.options.progression!],
          },
          maxCharacters,
          tone,
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

  const getCharacterBadgeColor = (count: number, max: number) => {
    if (count > max) return "text-destructive";
    if (count >= max * 0.9) return "text-warning";
    return "";
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

      {/* Class stats and distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Statistiques de la classe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {classStats.totalStudents} élèves
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30">
              Moyenne : {classStats.averageGrade.toFixed(2)}/20
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-success/10 text-success border-success/30">
              ≥ 10 : {classStats.aboveAverage} élèves
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-destructive/10 text-destructive border-destructive/30">
              &lt; 10 : {classStats.belowAverage} élèves
            </Badge>
          </div>

          {/* Grade distribution chart */}
          <div className="h-[150px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} élève${value > 1 ? "s" : ""}`, "Nombre"]}
                  labelFormatter={(label) => `Moyenne ${label}`}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Settings card */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Paramètres du bilan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Character limit with presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxCharactersSummary">Longueur maximale</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px]">
                    <p>Adaptez selon les paramètres de votre établissement (généralement entre 200 et 400 caractères)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="maxCharactersSummary"
                type="number"
                min={100}
                max={600}
                step={50}
                value={maxCharacters}
                onChange={(e) => onClassSummaryChange({
                  ...classSummary,
                  maxCharacters: Math.max(100, Math.min(600, parseInt(e.target.value) || 350)),
                })}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">caractères</span>
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 200, label: "Court (200)" },
                { value: 350, label: "Moyen (350)" },
                { value: 500, label: "Long (500)" },
              ].map((preset) => (
                <Button
                  key={preset.value}
                  variant={maxCharacters === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onClassSummaryChange({
                    ...classSummary,
                    maxCharacters: preset.value,
                  })}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tone selector with icons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Ton du bilan</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px]">
                    <p>Le ton général à utiliser pour rédiger le bilan de la classe</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ReportCardToneSelector
              value={tone}
              onChange={(value) => onClassSummaryChange({
                ...classSummary,
                tone: value,
              })}
            />
          </div>
        </CardContent>
      </Card>

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
        <Card className={isOverLimit ? "border-destructive" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle>Bilan de la classe</CardTitle>
                <CardDescription className={getCharacterBadgeColor(classSummary.generatedText.length, maxCharacters)}>
                  {classSummary.generatedText.length}/{maxCharacters} caractères
                  {isOverLimit && " (dépassement)"}
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
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-destructive'
                    : classSummary.generatedText.length > maxCharacters * 0.9
                      ? 'bg-warning'
                      : 'bg-success'
                }`}
                style={{ width: `${Math.min((classSummary.generatedText.length / maxCharacters) * 100, 100)}%` }}
              />
            </div>

            <Textarea
              value={classSummary.generatedText}
              onChange={(e) =>
                onClassSummaryChange({ ...classSummary, generatedText: e.target.value })
              }
              className={`min-h-[150px] resize-none ${isOverLimit ? "border-destructive bg-destructive/5" : ""}`}
            />

            {/* Truncation warning and button */}
            {isOverLimit && (
              <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Dépasse de {classSummary.generatedText.length - maxCharacters} caractères
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleTruncate}
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Tronquer
                </Button>
              </div>
            )}
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
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    </div>
  );
};

export default Step4ClassSummary;