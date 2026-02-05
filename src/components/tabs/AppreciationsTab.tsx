import { useState, useEffect, useMemo } from "react";
import { PenLine, Sparkles, Loader2, Lightbulb, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulletinClasseData, BulletinEleveData, parseBulletinsElevesFromPDF } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import FileActionButtons from "@/components/FileActionButtons";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";
import { AppreciationTone, AppreciationJustification } from "@/types/appreciation";
import { Attribution, ConductAnalysis, StudentAttribution } from "@/types/attribution";
import { StudentBulletinAnalysis } from "@/types/bulletinAnalysis";
import { 
  suggestAttribution, 
  analyzeConductFromComments, 
  suggestToneFromAttribution,
  generateAttributionSummary,
  truncateIntelligently
} from "@/utils/attributionAnalysis";
import { 
  analyzeStudentBulletin, 
  buildAnalysisContext,
  Justification 
} from "@/utils/studentBulletinAnalyzer";
import { generateBulletinAnalysis } from "@/utils/bulletinAnalysisGenerator";
import AttributionSummaryDialog from "@/components/AttributionSummaryDialog";
import { AnonymizationQuickSelector } from "@/components/AnonymizationQuickSelector";
import { ManualFirstNameReplacer } from "@/components/ManualFirstNameReplacer";
import { useAnonymizationLevel } from "@/hooks/useAnonymizationLevel";
import { useStudentTones } from "@/hooks/useStudentTones";
import { AnonymizationLevel, FIRST_NAME_PLACEHOLDER } from "@/types/privacy";
import { AIGenerationWarning } from "@/components/AIGenerationWarning";
import StudentAppreciationCard from "@/components/analysis/StudentAppreciationCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StudentData {
  name: string;
  firstName: string;
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
    studentAppreciations?: string[];
  };
  onDataLoaded?: (data: { bulletinsEleves?: BulletinEleveData[] | null; studentAppreciations?: string[] | null }) => void;
}

const AppreciationsTab = ({ onNext, data, onDataLoaded }: AppreciationsTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinsEleves, setLocalBulletinsEleves] = useState<BulletinEleveData[]>([]);
  
  // Use the extracted hook for tone management
  const { tones: studentTones, setTone: setStudentTone, getTone, resetTones, setMultipleTones } = useStudentTones('standard');
  
  const [studentTexts, setStudentTexts] = useState<string[]>(data?.studentAppreciations || []);
  const [studentJustifications, setStudentJustifications] = useState<Record<number, Justification[]>>({});
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  // Note: copiedIndex state removed - each StudentAppreciationCard now manages its own copy state
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  
  // Anonymization level
  const [anonymizationLevel, setAnonymizationLevel] = useAnonymizationLevel();
  
  // Character limit for individual appreciations
  const [individualCharLimit, setIndividualCharLimit] = useState<number>(() => {
    const saved = localStorage.getItem('classcouncil_individual_char_limit');
    return saved ? parseInt(saved, 10) : 400;
  });
  
  // Attribution state
  const [attributionsEnabled, setAttributionsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('attributionsEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [studentAttributions, setStudentAttributions] = useState<Record<number, StudentAttribution>>({});
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  
  // Manual attribution removal tracking
  const [manuallyRemovedAttributions, setManuallyRemovedAttributions] = useState<Set<number>>(new Set());
  
  // Loading state for individual students
  const [loadingStudentIndex, setLoadingStudentIndex] = useState<number | null>(null);

  // Save character limit preference to localStorage
  useEffect(() => {
    localStorage.setItem('classcouncil_individual_char_limit', individualCharLimit.toString());
  }, [individualCharLimit]);

  // Save attribution preference to localStorage
  useEffect(() => {
    localStorage.setItem('attributionsEnabled', JSON.stringify(attributionsEnabled));
  }, [attributionsEnabled]);

  // Note: handleCopyToClipboard function removed - each StudentAppreciationCard now handles its own copy

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
        resetTones();
        setStudentTexts([]);
        setStudentJustifications({});
        setStudentAttributions({});
        setManuallyRemovedAttributions(new Set());
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
    resetTones();
    setStudentTexts([]);
    setStudentJustifications({});
    setStudentAttributions({});
    setManuallyRemovedAttributions(new Set());
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
          firstName: eleve.prenom,
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

        // Extract first name from full name (assume format "LASTNAME FirstName" or "FirstName LASTNAME")
        const nameParts = eleve.nom.split(' ');
        const firstName = nameParts.length > 1 
          ? nameParts.find(p => p[0] === p[0].toUpperCase() && p.slice(1) === p.slice(1).toLowerCase()) || nameParts[0]
          : nameParts[0];

        return {
          name: eleve.nom,
          firstName,
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

  // Compute student analyses for enriched appreciation generation
  const studentAnalyses = useMemo(() => {
    if (bulletinsEleves.length === 0) return {};
    
    const analyses: Record<number, ReturnType<typeof analyzeStudentBulletin>> = {};
    bulletinsEleves.forEach((bulletin, index) => {
      const totalMoyenne = bulletin.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
      const moyenneGenerale = bulletin.matieres.length > 0 ? totalMoyenne / bulletin.matieres.length : 0;
      analyses[index] = analyzeStudentBulletin(bulletin, moyenneGenerale);
    });
    return analyses;
  }, [bulletinsEleves]);

  // Compute bulletin analyses for oral presentation
  const bulletinAnalyses = useMemo(() => {
    if (bulletinsEleves.length === 0) return {};
    
    const analyses: Record<number, StudentBulletinAnalysis> = {};
    bulletinsEleves.forEach((bulletin, index) => {
      const totalMoyenne = bulletin.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
      const moyenneGenerale = bulletin.matieres.length > 0 ? totalMoyenne / bulletin.matieres.length : 0;
      // Note: moyennePrecedente and trimestre could be parsed from bulletin if available
      analyses[index] = generateBulletinAnalysis(bulletin, moyenneGenerale);
    });
    return analyses;
  }, [bulletinsEleves]);

  // Analyze and suggest attributions when students change (only if enabled)
  useEffect(() => {
    if (attributionsEnabled && students.length > 0 && Object.keys(studentAttributions).length === 0) {
      // Auto-analyze on first load
      const newAttributions: Record<number, StudentAttribution> = {};
      
      students.forEach((student, index) => {
        // Skip if manually removed
        if (manuallyRemovedAttributions.has(index)) {
          newAttributions[index] = {
            attribution: null,
            suggestedAttribution: null,
            isManuallySet: true,
            conductAnalysis: { hasConductIssues: false, detectedKeywords: [], relevantExcerpts: [] },
          };
          return;
        }
        
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
          setStudentTone(index, suggestedTone);
        }
      });
      
      setStudentAttributions(newAttributions);
    }
  }, [students.length, attributionsEnabled]);

  // Trigger analysis when attributions are enabled
  useEffect(() => {
    if (attributionsEnabled && students.length > 0 && Object.keys(studentAttributions).length === 0) {
      handleAnalyzeAllAttributions();
    }
  }, [attributionsEnabled]);

  const handleToneChange = (index: number, tone: AppreciationTone) => {
    setStudentTone(index, tone);
  };

  const handleAttributionChange = (index: number, attribution: Attribution | null) => {
    // Track if user explicitly removes attribution
    if (attribution === null) {
      setManuallyRemovedAttributions(prev => new Set(prev).add(index));
    } else {
      setManuallyRemovedAttributions(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
    
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
    setStudentTone(index, suggestedTone);
  };

  const handleAnalyzeAllAttributions = () => {
    setIsAnalyzingAll(true);
    
    const newAttributions: Record<number, StudentAttribution> = {};
    
    students.forEach((student, index) => {
      // Respect manually removed attributions
      if (manuallyRemovedAttributions.has(index)) {
        newAttributions[index] = {
          attribution: null,
          suggestedAttribution: null,
          isManuallySet: true,
          conductAnalysis: { hasConductIssues: false, detectedKeywords: [], relevantExcerpts: [] },
        };
        return;
      }
      
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
    
    setMultipleTones(newTones);
    setShowSummaryDialog(false);
    
    toast({
      title: "Suggestions appliquées",
      description: "Les attributions et les tons ont été mis à jour pour tous les élèves.",
    });
  };

  // Helper function to reinject first name
  const reinjectFirstName = (appreciation: string, firstName: string): string => {
    return appreciation
      .replace(/\{prénom\}/gi, firstName)
      .replace(/\{prenom\}/gi, firstName)
      .replace(/\[prénom\]/gi, firstName)
      .replace(/\[prenom\]/gi, firstName);
  };

  const generateAppreciation = async (
    student: StudentData, 
    tone: AppreciationTone,
    studentIndex: number
  ): Promise<{ appreciation: string; justifications: Justification[] }> => {
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

    // Get enriched analysis if available
    const analysis = studentAnalyses[studentIndex];
    const bulletin = bulletinsEleves[studentIndex];
    
    let enrichedStudent: any = { ...student };
    let localJustifications: Justification[] = [];
    
    if (analysis && bulletin) {
      const { analysisContext, localJustifications: justifs } = buildAnalysisContext(
        bulletin,
        analysis,
        student.average
      );
      
      localJustifications = justifs;
      
      // Add enriched data to the student object
      enrichedStudent = {
        ...student,
        analysisContext,
        absences: bulletin.absences,
        retards: bulletin.retards,
        recurringIssues: analysis.recurringIssues.map(i => ({
          type: i.type,
          count: i.count
        }))
      };
    }

    const { data: result, error } = await supabase.functions.invoke('generate-appreciation', {
      body: { type: 'individual', tone, classData, student: enrichedStudent, charLimit: individualCharLimit },
    });

    if (error) throw error;
    
    let appreciation = result.appreciation;
    
    // If standard mode, automatically reinject the first name
    if (anonymizationLevel === 'standard') {
      appreciation = reinjectFirstName(appreciation, student.firstName);
    }
    
    // Truncate if still over limit
    if (appreciation.length > individualCharLimit) {
      appreciation = truncateIntelligently(appreciation, individualCharLimit);
    }
    
    return { appreciation, justifications: localJustifications };
  };

  const handleRegenerateStudent = async (index: number) => {
    setLoadingStudentIndex(index);
    try {
      const student = students[index];
      const tone = studentTones[index] || 'standard';
      const { appreciation, justifications } = await generateAppreciation(student, tone, index);
      
      const newTexts = [...studentTexts];
      newTexts[index] = appreciation;
      setStudentTexts(newTexts);
      
      // Store justifications
      setStudentJustifications(prev => ({
        ...prev,
        [index]: justifications
      }));
      
      onDataLoaded?.({ studentAppreciations: newTexts });
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
      const newJustifications: Record<number, Justification[]> = {};
      
      for (let i = 0; i < students.length; i++) {
        const tone = studentTones[i] || 'standard';
        const { appreciation, justifications } = await generateAppreciation(students[i], tone, i);
        newTexts[i] = appreciation;
        newJustifications[i] = justifications;
        setStudentTexts([...newTexts]);
        setStudentJustifications({ ...studentJustifications, ...newJustifications });
        onDataLoaded?.({ studentAppreciations: [...newTexts] });
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

  // Character count color helper
  const getCharCountColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage < 80) return 'text-green-600';
    if (percentage <= 100) return 'text-amber-600';
    return 'text-red-600';
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

      {/* Attribution toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="enable-attributions"
            checked={attributionsEnabled}
            onCheckedChange={(checked) => setAttributionsEnabled(checked === true)}
          />
          <Label htmlFor="enable-attributions" className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium">Activer les attributions</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              (Avertissements, Encouragements, Félicitations...)
            </span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" side="right">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Attributions du conseil de classe
                </h4>
                <p className="text-sm text-muted-foreground">
                  Les attributions sont des mentions décernées par le conseil de classe pour valoriser ou alerter les élèves :
                </p>
                <div className="text-sm space-y-1.5">
                  <p>⚠️ <strong>Avert. Travail</strong> : 3+ mentions négatives sur le travail</p>
                  <p>⚠️ <strong>Avert. Conduite</strong> : comportement grave ou 2+ incidents modérés</p>
                  <p>⚠️ <strong>Avert. Travail & Conduite</strong> : cumul des deux</p>
                  <p>👍 <strong>Encouragements</strong> : 2+ mentions de progrès ou efforts</p>
                  <p>⭐ <strong>Tableau d'honneur</strong> : bons résultats (14+) et bonne attitude</p>
                  <p>🏆 <strong>Félicitations</strong> : mentions d'excellence</p>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  ClassCouncil AI suggère automatiquement une attribution basée sur l'analyse des appréciations des professeurs.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {attributionsEnabled && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleAnalyzeAllAttributions}
            disabled={isAnalyzingAll}
          >
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Appliquer suggestions</span>
          </Button>
        )}
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Character limit selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Limite :</span>
            <Select
              value={individualCharLimit.toString()}
              onValueChange={(v) => setIndividualCharLimit(parseInt(v, 10))}
            >
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">300 car.</SelectItem>
                <SelectItem value="350">350 car.</SelectItem>
                <SelectItem value="400">400 car.</SelectItem>
                <SelectItem value="450">450 car.</SelectItem>
                <SelectItem value="500">500 car.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TooltipProvider delayDuration={200}>
            <AnonymizationQuickSelector
              value={anonymizationLevel}
              onChange={setAnonymizationLevel}
            />
          </TooltipProvider>
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
        
        {/* AI Warning */}
        <AIGenerationWarning />
      </div>

      {/* Student Cards */}
      <div className="grid gap-4">
        {students.map((student, index) => {
          const attribution = studentAttributions[index];
          const conductAnalysis: ConductAnalysis = attribution?.conductAnalysis || {
            hasConductIssues: false,
            detectedKeywords: [],
            relevantExcerpts: [],
          };
          const justifications = studentJustifications[index] || [];
          const bulletinAnalysis = bulletinAnalyses[index];
          
          // Handle maximal anonymization mode with ManualFirstNameReplacer
          if (anonymizationLevel === 'maximal' && studentTexts[index]?.includes(FIRST_NAME_PLACEHOLDER)) {
            return (
              <Card key={index} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{student.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ManualFirstNameReplacer
                    appreciation={studentTexts[index]}
                    firstName={student.firstName}
                    onUpdate={(updatedText) => {
                      const newTexts = [...studentTexts];
                      newTexts[index] = updatedText;
                      setStudentTexts(newTexts);
                    }}
                  />
                </CardContent>
              </Card>
            );
          }
          
          return (
            <StudentAppreciationCard
              key={index}
              index={index}
              name={student.name}
              firstName={student.firstName}
              average={student.average}
              status={student.status}
              appreciation={studentTexts[index] || ""}
              justifications={justifications}
              bulletinAnalysis={bulletinAnalysis}
              tone={studentTones[index] || 'standard'}
              attribution={attribution?.attribution || null}
              suggestedAttribution={attribution?.suggestedAttribution || null}
              conductAnalysis={conductAnalysis}
              charLimit={individualCharLimit}
              attributionsEnabled={attributionsEnabled}
              isLoading={loadingStudentIndex === index}
              isEditing={editingStudent === index}
              onToneChange={(tone) => handleToneChange(index, tone)}
              onAttributionChange={(attr) => handleAttributionChange(index, attr)}
              onAppreciationChange={(text) => {
                const newTexts = [...studentTexts];
                newTexts[index] = text;
                setStudentTexts(newTexts);
                onDataLoaded?.({ studentAppreciations: newTexts });
              }}
              onRegenerate={() => handleRegenerateStudent(index)}
              onEditToggle={() => setEditingStudent(editingStudent === index ? null : index)}
              onTruncate={() => {
                const truncated = truncateIntelligently(studentTexts[index] || "", individualCharLimit);
                const newTexts = [...studentTexts];
                newTexts[index] = truncated;
                setStudentTexts(newTexts);
                onDataLoaded?.({ studentAppreciations: newTexts });
              }}
            />
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
