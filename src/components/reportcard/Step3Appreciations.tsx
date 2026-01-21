import { useState } from "react";
import { Student, StudentObservations, GeneratedAppreciation } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Copy, Check, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Step3AppreciationsProps {
  students: Student[];
  observations: StudentObservations;
  appreciations: GeneratedAppreciation[];
  onAppreciationsChange: (appreciations: GeneratedAppreciation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Appreciations = ({
  students,
  observations,
  appreciations,
  onAppreciationsChange,
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
      // Check for individual note first
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

  const generateAppreciation = async (student: Student): Promise<string> => {
    const studentObs = getStudentObservations(student.id);
    
    const studentData = {
      firstName: student.firstName,
      average: student.average,
      observations: studentObs,
      absences: student.absences,
    };

    try {
      const { data, error } = await supabase.functions.invoke("generate-reportcard-appreciation", {
        body: { student: studentData },
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
      
      // Update progress
      setGenerationProgress(((i + 1) / total) * 100);
      
      try {
        const text = await generateAppreciation(student);
        newAppreciations.push({
          studentId: student.id,
          text,
          characterCount: text.length,
          isEditing: false,
          isGenerating: false,
        });
      } catch (error) {
        // Add error placeholder
        newAppreciations.push({
          studentId: student.id,
          text: `Erreur lors de la génération pour ${student.firstName}. Cliquez sur "Régénérer".`,
          characterCount: 0,
          isEditing: false,
          isGenerating: false,
        });
      }

      // Update state progressively
      onAppreciationsChange([...newAppreciations]);
      
      // Small delay between requests
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

    // Mark as generating
    const updated = appreciations.map((a) =>
      a.studentId === studentId ? { ...a, isGenerating: true } : a
    );
    onAppreciationsChange(updated);

    try {
      const text = await generateAppreciation(student);
      const finalUpdated = appreciations.map((a) =>
        a.studentId === studentId
          ? { ...a, text, characterCount: text.length, isGenerating: false }
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

  const getCharacterBadgeVariant = (count: number) => {
    if (count >= 300 && count <= 400) return "default";
    if (count > 400) return "destructive";
    return "secondary";
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

            return (
              <Card key={student.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getCharacterBadgeVariant(appreciation.characterCount)}>
                        {appreciation.characterCount} car.
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
