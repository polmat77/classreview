import { useState, useEffect } from "react";
import { PenLine, Sparkles, User, Edit2, Loader2, Copy, Check, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulletinClasseData, BulletinEleveData, parseBulletinsElevesFromPDF } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import FileActionButtons from "@/components/FileActionButtons";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";
import ToneSelector from "@/components/ToneSelector";
import { AppreciationTone } from "@/types/appreciation";
import { Attribution, ConductAnalysis, StudentAttribution } from "@/types/attribution";
import { 
  suggestAttribution, 
  analyzeConductFromComments, 
  suggestToneFromAttribution,
  generateAttributionSummary 
} from "@/utils/attributionAnalysis";
import AttributionSelector from "@/components/AttributionSelector";
import ConductIssuesIndicator from "@/components/ConductIssuesIndicator";
import AttributionSummaryDialog from "@/components/AttributionSummaryDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudentData {
  name: string;
  average: number;
  subjects?: { name: string; grade: number; classAverage?: number; appreciation?: string }[];
  status: "excellent" | "good" | "needs-improvement";
  tone: AppreciationTone;
}

interface AppreciationsTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
  onDataLoaded?: (data: { bulletinsEleves?: BulletinEleveData[] | null }) => void;
}

const AppreciationsTab = ({ onNext, data, onDataLoaded }: AppreciationsTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinsEleves, setLocalBulletinsEleves] = useState<BulletinEleveData[]>([]);
  const [studentTones, setStudentTones] = useState<Record<number, AppreciationTone>>({});
  const [studentTexts, setStudentTexts] = useState<string[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  
  // Attribution state
  const [studentAttributions, setStudentAttributions] = useState<Record<number, StudentAttribution>>({});
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  const handleCopyToClipboard = async (text: string, index: number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({ title: "Copié !", description: "L'appréciation a été copiée dans le presse-papiers." });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de copier le texte.", variant: "destructive" });
    }
  };

  const bulletinsEleves = data?.bulletinsEleves?.length ? data.bulletinsEleves : localBulletinsEleves;
  const classeCSV = data?.classeCSV;

  const handleBulletinsElevesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers PDF sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const bulletins = await parseBulletinsElevesFromPDF(file);
      if (bulletins.length > 0) {
        // Replace existing bulletins with new ones
        setLocalBulletinsEleves(bulletins);
        setCurrentFileName(file.name);
        onDataLoaded?.({ bulletinsEleves: bulletins });
        toast({
          title: "✓ Bulletins élèves chargés",
          description: `${bulletins.length} élève${bulletins.length > 1 ? 's' : ''} extrait${bulletins.length > 1 ? 's' : ''}. Génération des appréciations en cours...`,
        });
        // Reset related state for new file
        setStudentTones({});
        setStudentTexts([]);
        setStudentAttributions({});
      } else {
        throw new Error("Aucun bulletin élève trouvé dans le PDF");
      }
    } catch (error) {
      console.error('Erreur lors du traitement du PDF:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de lire le fichier PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setLocalBulletinsEleves([]);
    setCurrentFileName("");
    setStudentTones({});
    setStudentTexts([]);
    setStudentAttributions({});
    onDataLoaded?.({ bulletinsEleves: null });
  };

  // Build students list from data
  const buildStudentsList = (): StudentData[] => {
    if (bulletinsEleves.length > 0) {
      return bulletinsEleves.map((eleve, index) => {
        const totalMoyenne = eleve.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
        const average = eleve.matieres.length > 0 ? totalMoyenne / eleve.matieres.length : 0;
        let status: "excellent" | "good" | "needs-improvement" = "good";
        if (average >= 16) status = "excellent";
        else if (average < 12) status = "needs-improvement";

        return {
          name: `${eleve.prenom} ${eleve.nom}`,
          average,
          subjects: eleve.matieres.map(m => ({
            name: m.nom,
            grade: m.moyenneEleve,
            classAverage: m.moyenneClasse,
            appreciation: m.appreciation,
          })),
          status,
          tone: studentTones[index] || 'standard',
        };
      });
    }

    if (classeCSV?.eleves) {
      return classeCSV.eleves.map((eleve, index) => {
        const average = eleve.moyenneGenerale;
        let status: "excellent" | "good" | "needs-improvement" = "good";
        if (average >= 16) status = "excellent";
        else if (average < 12) status = "needs-improvement";

        const subjects = Object.entries(eleve.moyennesParMatiere).map(([matiere, note]) => ({
          name: matiere,
          grade: note,
          classAverage: undefined,
        }));

        return {
          name: eleve.nom,
          average,
          subjects,
          status,
          tone: studentTones[index] || 'standard',
        };
      });
    }

    return [];
  };

  const students = buildStudentsList();
  const hasBulletinsEleves = bulletinsEleves.length > 0;
  const hasStudents = students.length > 0;

  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [loadingStudentIndex, setLoadingStudentIndex] = useState<number | null>(null);

  // Analyze and suggest attributions when students change
  useEffect(() => {
    if (students.length > 0 && Object.keys(studentAttributions).length === 0) {
      // Auto-analyze on first load
      const newAttributions: Record<number, StudentAttribution> = {};
      
      students.forEach((student, index) => {
        const subjects = student.subjects || [];
        const conductAnalysis = analyzeConductFromComments(subjects);
        const suggested = suggestAttribution(student.average, subjects);
        
        newAttributions[index] = {
          attribution: suggested,
          suggestedAttribution: suggested,
          isManuallySet: false,
          conductAnalysis,
        };
        
        // Auto-set tone based on attribution if not manually set
        if (!studentTones[index]) {
          const suggestedTone = suggestToneFromAttribution(suggested);
          setStudentTones(prev => ({ ...prev, [index]: suggestedTone }));
        }
      });
      
      setStudentAttributions(newAttributions);
    }
  }, [students.length]);

  const handleToneChange = (index: number, tone: AppreciationTone) => {
    setStudentTones(prev => ({ ...prev, [index]: tone }));
  };

  const handleAttributionChange = (index: number, attribution: Attribution | null) => {
    setStudentAttributions(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        attribution,
        isManuallySet: true,
      }
    }));
    
    // Auto-update tone based on new attribution
    const suggestedTone = suggestToneFromAttribution(attribution);
    setStudentTones(prev => ({ ...prev, [index]: suggestedTone }));
  };

  const handleAnalyzeAllAttributions = () => {
    setIsAnalyzingAll(true);
    
    const newAttributions: Record<number, StudentAttribution> = {};
    
    students.forEach((student, index) => {
      const subjects = student.subjects || [];
      const conductAnalysis = analyzeConductFromComments(subjects);
      const suggested = suggestAttribution(student.average, subjects);
      
      newAttributions[index] = {
        attribution: suggested,
        suggestedAttribution: suggested,
        isManuallySet: false,
        conductAnalysis,
      };
    });
    
    setStudentAttributions(newAttributions);
    setIsAnalyzingAll(false);
    setShowSummaryDialog(true);
  };

  const handleApplySuggestions = () => {
    // Update tones based on attributions
    const newTones: Record<number, AppreciationTone> = {};
    
    Object.entries(studentAttributions).forEach(([indexStr, attr]) => {
      const index = parseInt(indexStr);
      newTones[index] = suggestToneFromAttribution(attr.attribution);
    });
    
    setStudentTones(prev => ({ ...prev, ...newTones }));
    setShowSummaryDialog(false);
    
    toast({
      title: "Suggestions appliquées",
      description: "Les attributions et les tons ont été mis à jour pour tous les élèves.",
    });
  };

  const generateAppreciation = async (student: StudentData, tone: AppreciationTone): Promise<string> => {
    const classData = classeCSV ? {
      className: "3ème",
      trimester: "1er trimestre",
      averageClass: classeCSV.statistiques.moyenneClasse,
      subjects: classeCSV.matieres.map(m => ({ name: m, average: 0 })),
    } : data?.bulletinClasse ? {
      className: data.bulletinClasse.classe || "3ème",
      trimester: data.bulletinClasse.trimestre || "1er trimestre",
      averageClass: data.bulletinClasse.matieres.reduce((sum, m) => sum + m.moyenne, 0) / (data.bulletinClasse.matieres.length || 1),
      subjects: data.bulletinClasse.matieres.map(m => ({ name: m.nom, average: m.moyenne })),
    } : undefined;

    const { data: result, error } = await supabase.functions.invoke('generate-appreciation', {
      body: { type: 'individual', tone, classData, student },
    });

    if (error) throw error;
    return result.appreciation;
  };

  const handleRegenerateStudent = async (index: number) => {
    setLoadingStudentIndex(index);
    try {
      const student = students[index];
      const tone = studentTones[index] || 'standard';
      const appreciation = await generateAppreciation(student, tone);
      const newTexts = [...studentTexts];
      newTexts[index] = appreciation;
      setStudentTexts(newTexts);
      toast({ title: "Appréciation générée", description: `L'appréciation de ${student.name} a été générée.` });
    } catch (error) {
      console.error('Error generating student appreciation:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
    } finally {
      setLoadingStudentIndex(null);
    }
  };

  const handleRegenerateAll = async () => {
    setIsLoadingAll(true);
    try {
      const newTexts = [...studentTexts];
      for (let i = 0; i < students.length; i++) {
        const tone = studentTones[i] || 'standard';
        const appreciation = await generateAppreciation(students[i], tone);
        newTexts[i] = appreciation;
        setStudentTexts([...newTexts]);
      }

      toast({ title: "Toutes les appréciations générées", description: "Les appréciations ont été générées avec succès." });
    } catch (error) {
      console.error('Error generating all appreciations:', error);
      toast({ title: "Erreur", description: "Impossible de générer toutes les appréciations.", variant: "destructive" });
    } finally {
      setIsLoadingAll(false);
    }
  };

  // Get summary for dialog
  const getSummary = () => {
    const attrs = Object.values(studentAttributions).map(a => a.attribution);
    return generateAttributionSummary(attrs);
  };

  // STATE A: No individual bulletins loaded - Show upload placeholder
  if (!hasBulletinsEleves) {
    return (
      <TabUploadPlaceholder
        title="Appréciations individuelles"
        icon={<PenLine className="h-6 w-6" />}
        description="Générez automatiquement une appréciation personnalisée pour chaque élève grâce à l'intelligence artificielle, basée sur les appréciations des professeurs."
        accept=".pdf"
        featuresTitle="Fonctionnalités disponibles :"
        features={[
          { text: "Appréciations individuelles (250-450 caractères par élève)" },
          { text: "Rédigées à la 3ᵉ personne, commençant par le prénom" },
          { text: "Basées sur la synthèse des appréciations des professeurs" },
          { text: "Vous pourrez relire, modifier et valider chaque appréciation avant export" },
        ]}
        isLoading={isProcessing}
        onUpload={handleBulletinsElevesUpload}
        helpTooltip={<PronoteHelpTooltip type="individuels" />}
      />
    );
  }

  // STATE B: Data loaded - Show individual appreciation generation
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with modify button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PenLine className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Appréciations individuelles</h2>
            <p className="text-muted-foreground">
              {students.length} élève{students.length > 1 ? 's' : ''} chargé{students.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PronoteHelpTooltip type="individuels" />
          <FileActionButtons
            accept=".pdf"
            isLoading={isProcessing}
            currentFileName={currentFileName || "Bulletins élèves"}
            loadedInfo={`${students.length} élève${students.length > 1 ? 's' : ''} chargé${students.length > 1 ? 's' : ''}`}
            onReplace={handleBulletinsElevesUpload}
            onRemove={handleRemoveFile}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">IA disponible</p>
            <p className="text-xs text-muted-foreground">
              Régénérez automatiquement les appréciations avec des suggestions personnalisées
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleAnalyzeAllAttributions}
            disabled={isAnalyzingAll}
          >
            <Lightbulb className="h-4 w-4" />
            Analyser attributions
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRegenerateAll}
            disabled={isLoadingAll}
          >
            {isLoadingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Tout générer
          </Button>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid gap-4">
        {students.map((student, index) => {
          const attribution = studentAttributions[index];
          const conductAnalysis = attribution?.conductAnalysis || {
            hasConductIssues: false,
            detectedKeywords: [],
            relevantExcerpts: [],
          };
          
          return (
            <Card key={index} className="hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  {/* Row 1: Name, average, and actions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{student.name}</CardTitle>
                        <CardDescription>Moyenne: {student.average.toFixed(2)}/20</CardDescription>
                      </div>
                    </div>
                    <TooltipProvider delayDuration={200}>
                      <div className="flex items-center gap-1">
                        {student.status === "excellent" && (
                          <Badge className="bg-success text-success-foreground">Excellent</Badge>
                        )}
                        {student.status === "good" && (
                          <Badge className="bg-accent text-accent-foreground">Satisfaisant</Badge>
                        )}
                        {student.status === "needs-improvement" && (
                          <Badge className="bg-warning text-warning-foreground">Fragile</Badge>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyToClipboard(studentTexts[index] || "", index)}
                              disabled={!studentTexts[index]}
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Copier l'appréciation</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRegenerateStudent(index)}
                              disabled={loadingStudentIndex === index || isLoadingAll}
                            >
                              {loadingStudentIndex === index ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Générer l'appréciation</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingStudent(editingStudent === index ? null : index)
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Modifier l'appréciation</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                  
                  {/* Row 2: Attribution and Tone selectors */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Attribution :</span>
                      <AttributionSelector
                        value={attribution?.attribution || null}
                        suggestedValue={attribution?.suggestedAttribution || null}
                        onChange={(attr) => handleAttributionChange(index, attr)}
                        compact
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Ton :</span>
                      <ToneSelector 
                        value={studentTones[index] || 'standard'} 
                        onChange={(tone) => handleToneChange(index, tone)}
                        compact
                      />
                    </div>
                  </div>
                  
                  {/* Row 3: Conduct analysis */}
                  <div className="pt-2">
                    <ConductIssuesIndicator 
                      analysis={conductAnalysis}
                      compact
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingStudent === index ? (
                  <div className="space-y-3">
                    <Textarea
                      value={studentTexts[index] || ""}
                      onChange={(e) => {
                        const newTexts = [...studentTexts];
                        newTexts[index] = e.target.value;
                        setStudentTexts(newTexts);
                      }}
                      className="min-h-[120px] resize-none"
                      maxLength={450}
                      placeholder="Cliquez sur l'icône ✨ pour générer l'appréciation..."
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {(studentTexts[index] || "").length}/450 caractères
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStudent(null)}
                        >
                          Fermer
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground min-h-[40px]">
                    {studentTexts[index] || (
                      <span className="text-muted-foreground italic">
                        Aucune appréciation générée. Cliquez sur ✨ pour générer.
                      </span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Voir le bilan
        </Button>
      </div>
      
      {/* Summary Dialog */}
      <AttributionSummaryDialog
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summary={getSummary()}
        onConfirm={handleApplySuggestions}
        onCancel={() => setShowSummaryDialog(false)}
      />
    </div>
  );
};

export default AppreciationsTab;
