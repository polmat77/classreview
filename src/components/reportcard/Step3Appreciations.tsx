import { useState } from "react";
import { Student, StudentObservations, GeneratedAppreciation, AppreciationSettings, AppreciationTone, toneOptions } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Copy, Check, Loader2, Download, Settings2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReportCardToneSelector from "./ReportCardToneSelector";

interface Step3AppreciationsProps {
  students: Student[];
  observations: StudentObservations;
  appreciations: GeneratedAppreciation[];
  appreciationSettings: AppreciationSettings;
  onAppreciationsChange: (appreciations: GeneratedAppreciation[]) => void;
  onAppreciationSettingsChange: (settings: AppreciationSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Appreciations = ({
  students,
  observations,
  appreciations,
  appreciationSettings,
  onAppreciationsChange,
  onAppreciationSettingsChange,
  onNext,
  onBack,
}: Step3AppreciationsProps) => {
  const { toast } = useToast();
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getStudentObservations = (studentId: number): string[] => {
    const obs: string[] = [];
    
    if (observations.behavior?.studentIds.includes(studentId)) {
      const individualNote = observations.behavior.individualNotes?.[studentId];
      if (individualNote) {
        obs.push(`Problèmes de comportement: ${individualNote}`);
      } else if (observations.behavior.description) {
        obs.push(`Problèmes de comportement: ${observations.behavior.description}`);
      } else {
        obs.push("Problèmes de comportement");
      }
    }
    
    if (observations.talkative?.studentIds.includes(studentId)) {
      obs.push("Élève bavard");
    }
    
    const specific = observations.specific.filter((o) => o.studentId === studentId);
    specific.forEach((o) => obs.push(o.observation));
    
    return obs;
  };

  const getStudentTone = (studentId: number): AppreciationTone => {
    return appreciationSettings.individualTones[studentId] || appreciationSettings.defaultTone;
  };

  const setStudentTone = (studentId: number, tone: AppreciationTone) => {
    onAppreciationSettingsChange({
      ...appreciationSettings,
      individualTones: {
        ...appreciationSettings.individualTones,
        [studentId]: tone,
      },
    });
  };

  const generateAppreciation = async (student: Student, tone: AppreciationTone): Promise<string> => {
    const studentObs = getStudentObservations(student.id);
    
    const studentData = {
      firstName: student.firstName,
      lastName: student.lastName,
      average: student.average,
      seriousness: student.seriousness,
      participation: student.participation,
      absences: student.absences,
      nonRendus: student.nonRendus,
      behaviorIssue: observations.behavior?.studentIds.includes(student.id) 
        ? observations.behavior.individualNotes?.[student.id] || observations.behavior.description || true 
        : null,
      isTalkative: observations.talkative?.studentIds.includes(student.id),
      specificObservations: observations.specific
        .filter(o => o.studentId === student.id)
        .map(o => o.observation),
    };

    try {
      const { data, error } = await supabase.functions.invoke("generate-reportcard-appreciation", {
        body: { 
          student: studentData,
          maxCharacters: appreciationSettings.maxCharacters,
          tone,
        },
      });

      if (error) throw error;
      return data.appreciation;
    } catch (error) {
      console.error("Error generating appreciation:", error);
      throw error;
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    setGenerationProgress(0);

    const newAppreciations: GeneratedAppreciation[] = [];
    const total = students.length;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const tone = getStudentTone(student.id);
      
      setGenerationProgress(((i + 1) / total) * 100);
      
      try {
        const text = await generateAppreciation(student, tone);
        newAppreciations.push({
          studentId: student.id,
          text,
          characterCount: text.length,
          isEditing: false,
          isGenerating: false,
          tone,
        });
      } catch (error) {
        newAppreciations.push({
          studentId: student.id,
          text: `Erreur lors de la génération pour ${student.firstName}. Cliquez sur "Régénérer".`,
          characterCount: 0,
          isEditing: false,
          isGenerating: false,
          tone,
        });
      }

      onAppreciationsChange([...newAppreciations]);
      
      if (i < students.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsGeneratingAll(false);
    toast({
      title: "Génération terminée",
      description: `${newAppreciations.length} appréciations générées`,
    });
  };

  const handleRegenerate = async (studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const tone = getStudentTone(studentId);

    const updated = appreciations.map((a) =>
      a.studentId === studentId ? { ...a, isGenerating: true } : a
    );
    onAppreciationsChange(updated);

    try {
      const text = await generateAppreciation(student, tone);
      const finalUpdated = appreciations.map((a) =>
        a.studentId === studentId
          ? { ...a, text, characterCount: text.length, isGenerating: false, tone }
          : a
      );
      onAppreciationsChange(finalUpdated);
      toast({ title: "Appréciation régénérée" });
    } catch (error) {
      const finalUpdated = appreciations.map((a) =>
        a.studentId === studentId ? { ...a, isGenerating: false } : a
      );
      onAppreciationsChange(finalUpdated);
      toast({
        title: "Erreur",
        description: "Impossible de régénérer l'appréciation",
        variant: "destructive",
      });
    }
  };

  const handleTextChange = (studentId: number, text: string) => {
    const updated = appreciations.map((a) =>
      a.studentId === studentId ? { ...a, text, characterCount: text.length } : a
    );
    onAppreciationsChange(updated);
  };

  const handleCopy = async (studentId: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(studentId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copié !" });
  };

  const handleExportAll = () => {
    const content = appreciations
      .map((a) => {
        const student = students.find((s) => s.id === a.studentId);
        return `${student?.lastName} ${student?.firstName}\n${a.text}\n`;
      })
      .join("\n---\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appreciations.txt";
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export réussi", description: "Fichier téléchargé" });
  };

  const getCharacterBadgeVariant = (count: number, max: number) => {
    if (count <= max && count >= max * 0.75) return "default";
    if (count > max) return "destructive";
    if (count < max * 0.5) return "secondary";
    return "outline";
  };

  const getCharacterBadgeColor = (count: number, max: number) => {
    if (count > max) return "text-destructive";
    if (count >= max * 0.9) return "text-warning";
    return "";
  };

  const getToneLabel = (tone: AppreciationTone) => {
    return toneOptions.find(t => t.value === tone)?.label || tone;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Appréciations individuelles
        </h1>
        <p className="text-muted-foreground">
          Générez, modifiez et copiez les appréciations pour chaque élève
        </p>
      </div>

      {/* Settings card */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Paramètres de génération</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Character limit */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="maxCharacters">Longueur maximale</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <p>Adaptez selon les paramètres de votre établissement (généralement entre 300 et 600 caractères pour PRONOTE)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="maxCharacters"
                  type="number"
                  min={200}
                  max={800}
                  value={appreciationSettings.maxCharacters}
                  onChange={(e) => onAppreciationSettingsChange({
                    ...appreciationSettings,
                    maxCharacters: Math.max(200, Math.min(800, parseInt(e.target.value) || 400)),
                  })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">caractères</span>
              </div>
            </div>

            {/* Default tone */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Ton par défaut</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px]">
                      <p>Le ton utilisé pour toutes les appréciations, sauf si un ton spécifique est défini pour un élève</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <ReportCardToneSelector
                value={appreciationSettings.defaultTone}
                onChange={(value) => onAppreciationSettingsChange({
                  ...appreciationSettings,
                  defaultTone: value,
                })}
                showDescription
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={handleGenerateAll}
              disabled={isGeneratingAll}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isGeneratingAll ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isGeneratingAll ? "Génération en cours..." : "Générer toutes les appréciations"}
            </Button>

            {appreciations.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExportAll}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter tout (.txt)
              </Button>
            )}

            <div className="flex-1 text-right text-sm text-muted-foreground">
              {appreciations.length} / {students.length} générées
            </div>
          </div>

          {isGeneratingAll && (
            <div className="mt-4 space-y-2">
              <Progress value={generationProgress} />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(generationProgress)}% • Ne fermez pas cette page
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appreciations list */}
      {appreciations.length > 0 && (
        <div className="space-y-4">
          {students.map((student) => {
            const appreciation = appreciations.find((a) => a.studentId === student.id);
            if (!appreciation) return null;

            const studentTone = getStudentTone(student.id);
            const isOverLimit = appreciation.characterCount > appreciationSettings.maxCharacters;

            return (
              <Card key={student.id} className={isOverLimit ? "border-destructive/50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{student.id}</Badge>
                      <div>
                        <CardTitle className="text-base">
                          {student.lastName} {student.firstName}
                        </CardTitle>
                        <CardDescription>
                          {student.average !== null
                            ? `Moyenne : ${student.average.toFixed(1)}`
                            : "Moyenne non renseignée"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tone selector per student - compact version */}
                      <ReportCardToneSelector
                        value={studentTone}
                        onChange={(value) => setStudentTone(student.id, value)}
                        compact
                      />

                      {/* Character count badge */}
                      <Badge 
                        variant={getCharacterBadgeVariant(appreciation.characterCount, appreciationSettings.maxCharacters)}
                        className={getCharacterBadgeColor(appreciation.characterCount, appreciationSettings.maxCharacters)}
                      >
                        {appreciation.characterCount}/{appreciationSettings.maxCharacters}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={appreciation.text}
                    onChange={(e) => handleTextChange(student.id, e.target.value)}
                    className="min-h-[100px] resize-none"
                    disabled={appreciation.isGenerating}
                  />
                  {isOverLimit && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      L'appréciation dépasse la limite de {appreciationSettings.maxCharacters} caractères
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(student.id)}
                      disabled={appreciation.isGenerating || isGeneratingAll}
                    >
                      {appreciation.isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Régénérer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(student.id, appreciation.text)}
                    >
                      {copiedId === student.id ? (
                        <Check className="w-4 h-4 mr-2 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {appreciations.length === 0 && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-16 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground mb-2">
              Prêt à générer les appréciations
            </p>
            <p className="text-muted-foreground mb-6">
              Cliquez sur le bouton ci-dessus pour générer automatiquement les appréciations de vos {students.length} élèves
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={appreciations.length === 0}>
          Passer au bilan de classe
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step3Appreciations;