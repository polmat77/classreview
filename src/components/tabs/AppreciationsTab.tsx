import { useState, useEffect, useMemo } from "react";
import { PenLine, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulletinClasseData, BulletinEleveData, parseBulletinsElevesFromPDF } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";
import { AppreciationTone } from "@/types/appreciation";
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
import { ManualFirstNameReplacer } from "@/components/ManualFirstNameReplacer";
import StepInfoBanner from "@/components/StepInfoBanner";
import { useAnonymizationLevel } from "@/hooks/useAnonymizationLevel";
import { useStudentTones } from "@/hooks/useStudentTones";
import { useStudentAppreciations } from "@/hooks/useStudentAppreciations";
import { FIRST_NAME_PLACEHOLDER } from "@/types/privacy";
import StudentAppreciationCard from "@/components/analysis/StudentAppreciationCard";
import {
  AppreciationPageHeader,
  AIActionBar,
  AttributionToggle,
} from "@/components/appreciation";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { UpgradeModal } from "@/components/credits";

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
  const { isAuthenticated, openAuthModal } = useAuth();
  const { canGenerate, consumeCredits } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinsEleves, setLocalBulletinsEleves] = useState<BulletinEleveData[]>([]);
  
  // Extracted hooks
  const { tones: studentTones, setTone: setStudentTone, getTone, resetTones, setMultipleTones } = useStudentTones('standard');
  const {
    texts: studentTexts,
    justifications: studentJustifications,
    loadingIndex: loadingStudentIndex,
    isLoadingAll,
    setTexts: setStudentTexts,
    setJustifications: setStudentJustifications,
    setLoadingIndex: setLoadingStudentIndex,
    setIsLoadingAll,
    resetAll: resetAppreciations,
  } = useStudentAppreciations(data?.studentAppreciations || []);
  
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [anonymizationLevel, setAnonymizationLevel] = useAnonymizationLevel();
  
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
  const [manuallyRemovedAttributions, setManuallyRemovedAttributions] = useState<Set<number>>(new Set());


  // Persist settings
  useEffect(() => {
    localStorage.setItem('classcouncil_individual_char_limit', individualCharLimit.toString());
  }, [individualCharLimit]);

  useEffect(() => {
    localStorage.setItem('attributionsEnabled', JSON.stringify(attributionsEnabled));
  }, [attributionsEnabled]);

  const bulletinsEleves = data?.bulletinsEleves?.length ? data.bulletinsEleves : localBulletinsEleves;
  const classeCSV = data?.classeCSV;

  // Build students list from data
  const students = useMemo((): StudentData[] => {
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
  }, [bulletinsEleves, classeCSV, studentTones]);

  const hasBulletinsEleves = bulletinsEleves.length > 0;

  // Compute analyses
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

  const bulletinAnalyses = useMemo(() => {
    if (bulletinsEleves.length === 0) return {};
    const analyses: Record<number, StudentBulletinAnalysis> = {};
    bulletinsEleves.forEach((bulletin, index) => {
      const totalMoyenne = bulletin.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
      const moyenneGenerale = bulletin.matieres.length > 0 ? totalMoyenne / bulletin.matieres.length : 0;
      analyses[index] = generateBulletinAnalysis(bulletin, moyenneGenerale);
    });
    return analyses;
  }, [bulletinsEleves]);

  // Auto-analyze attributions
  useEffect(() => {
    if (attributionsEnabled && students.length > 0 && Object.keys(studentAttributions).length === 0) {
      handleAnalyzeAllAttributions();
    }
  }, [students.length, attributionsEnabled]);

  // File handlers
  const handleBulletinsElevesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast({ title: "Format invalide", description: "Seuls les fichiers PDF sont acceptés", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const bulletins = await parseBulletinsElevesFromPDF(file);
      if (bulletins.length > 0) {
        setLocalBulletinsEleves(bulletins);
        setCurrentFileName(file.name);
        onDataLoaded?.({ bulletinsEleves: bulletins });
        toast({
          title: "✓ Bulletins élèves chargés",
          description: `${bulletins.length} élève${bulletins.length > 1 ? 's' : ''} extrait${bulletins.length > 1 ? 's' : ''}`,
        });
        resetTones();
        resetAppreciations();
        setStudentAttributions({});
        setManuallyRemovedAttributions(new Set());
      } else {
        throw new Error("Aucun bulletin élève trouvé dans le PDF");
      }
    } catch (error) {
      console.error('Erreur lors du traitement du PDF:', error);
      toast({ title: "Erreur", description: error instanceof Error ? error.message : "Impossible de lire le fichier PDF", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setLocalBulletinsEleves([]);
    setCurrentFileName("");
    resetTones();
    resetAppreciations();
    setStudentAttributions({});
    setManuallyRemovedAttributions(new Set());
    onDataLoaded?.({ bulletinsEleves: null });
  };

  // Attribution handlers
  const handleAnalyzeAllAttributions = () => {
    setIsAnalyzingAll(true);
    const newAttributions: Record<number, StudentAttribution> = {};
    
    students.forEach((student, index) => {
      if (manuallyRemovedAttributions.has(index)) {
        newAttributions[index] = {
          attribution: null, suggestedAttribution: null, isManuallySet: true,
          conductAnalysis: { hasConductIssues: false, detectedKeywords: [], relevantExcerpts: [] },
        };
        return;
      }
      const subjects = student.subjects || [];
      const conductAnalysis = analyzeConductFromComments(subjects);
      const suggested = suggestAttribution(student.average, subjects);
      newAttributions[index] = { attribution: suggested, suggestedAttribution: suggested, isManuallySet: false, conductAnalysis };
    });
    
    setStudentAttributions(newAttributions);
    setIsAnalyzingAll(false);
    setShowSummaryDialog(true);
  };

  const handleApplySuggestions = () => {
    const newTones: Record<number, AppreciationTone> = {};
    Object.entries(studentAttributions).forEach(([indexStr, attr]) => {
      newTones[parseInt(indexStr)] = suggestToneFromAttribution(attr.attribution);
    });
    setMultipleTones(newTones);
    setShowSummaryDialog(false);
    toast({ title: "Suggestions appliquées", description: "Les attributions et les tons ont été mis à jour pour tous les élèves." });
  };

  const handleToneChange = (index: number, tone: AppreciationTone) => setStudentTone(index, tone);

  const handleAttributionChange = (index: number, attribution: Attribution | null) => {
    if (attribution === null) {
      setManuallyRemovedAttributions(prev => new Set(prev).add(index));
    } else {
      setManuallyRemovedAttributions(prev => { const newSet = new Set(prev); newSet.delete(index); return newSet; });
    }
    setStudentAttributions(prev => ({ ...prev, [index]: { ...prev[index], attribution, isManuallySet: true } }));
    setStudentTone(index, suggestToneFromAttribution(attribution));
  };

  // Appreciation generation
  const reinjectFirstName = (appreciation: string, firstName: string): string => {
    return appreciation.replace(/\{prénom\}/gi, firstName).replace(/\{prenom\}/gi, firstName)
      .replace(/\[prénom\]/gi, firstName).replace(/\[prenom\]/gi, firstName);
  };

  const generateAppreciation = async (student: StudentData, tone: AppreciationTone, studentIndex: number): Promise<{ appreciation: string; justifications: Justification[] }> => {
    const classData = classeCSV ? {
      className: "3ème", trimester: "1er trimestre",
      averageClass: classeCSV.statistiques.moyenneClasse,
      subjects: classeCSV.matieres.map(m => ({ name: m, average: 0 })),
    } : data?.bulletinClasse ? {
      className: data.bulletinClasse.classe || "3ème", trimester: data.bulletinClasse.trimestre || "1er trimestre",
      averageClass: data.bulletinClasse.matieres.reduce((sum, m) => sum + m.moyenne, 0) / (data.bulletinClasse.matieres.length || 1),
      subjects: data.bulletinClasse.matieres.map(m => ({ name: m.nom, average: m.moyenne })),
    } : undefined;

    const analysis = studentAnalyses[studentIndex];
    const bulletin = bulletinsEleves[studentIndex];
    let enrichedStudent: any = { ...student };
    let localJustifications: Justification[] = [];
    
    if (analysis && bulletin) {
      const { analysisContext, localJustifications: justifs } = buildAnalysisContext(bulletin, analysis, student.average);
      localJustifications = justifs;
      enrichedStudent = { ...student, analysisContext, absences: bulletin.absences, retards: bulletin.retards,
        recurringIssues: analysis.recurringIssues.map(i => ({ type: i.type, count: i.count })) };
    }

    const { data: result, error } = await supabase.functions.invoke('generate-appreciation', {
      body: { type: 'individual', tone, classData, student: enrichedStudent, charLimit: individualCharLimit },
    });
    if (error) throw error;
    
    let appreciation = result.appreciation;
    if (anonymizationLevel === 'standard') appreciation = reinjectFirstName(appreciation, student.firstName);
    if (appreciation.length > individualCharLimit) appreciation = truncateIntelligently(appreciation, individualCharLimit);
    
    return { appreciation, justifications: localJustifications };
  };

  const handleRegenerateStudent = async (index: number) => {
    // Check auth first
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // Check credits (1 student = 1 credit)
    if (!canGenerate(1)) {
      setShowUpgradeModal(true);
      return;
    }

    setLoadingStudentIndex(index);
    try {
      // Consume credit before generation
      const success = await consumeCredits(1, 'classcouncil', 'appreciation', undefined, { studentIndex: index });
      if (!success) {
        setShowUpgradeModal(true);
        return;
      }

      const { appreciation, justifications } = await generateAppreciation(students[index], studentTones[index] || 'standard', index);
      const newTexts = [...studentTexts]; newTexts[index] = appreciation;
      setStudentTexts(newTexts);
      setStudentJustifications(prev => ({ ...prev, [index]: justifications }));
      onDataLoaded?.({ studentAppreciations: newTexts });
      toast({ title: "Appréciation générée", description: `L'appréciation de ${students[index].name} a été générée.` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
    } finally {
      setLoadingStudentIndex(null);
    }
  };

  const handleRegenerateAll = async () => {
    // Check auth first
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const cost = students.length;
    
    // Check credits (1 per student)
    if (!canGenerate(cost)) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoadingAll(true);
    try {
      // Consume all credits before generation
      const success = await consumeCredits(cost, 'classcouncil', 'batch', undefined, { studentsCount: students.length });
      if (!success) {
        setShowUpgradeModal(true);
        return;
      }

      const newTexts = [...studentTexts];
      const newJustifications: Record<number, Justification[]> = {};
      for (let i = 0; i < students.length; i++) {
        const { appreciation, justifications } = await generateAppreciation(students[i], studentTones[i] || 'standard', i);
        newTexts[i] = appreciation;
        newJustifications[i] = justifications;
        setStudentTexts([...newTexts]);
        setStudentJustifications({ ...studentJustifications, ...newJustifications });
        onDataLoaded?.({ studentAppreciations: [...newTexts] });
      }
      toast({ title: "Toutes les appréciations générées", description: "Les appréciations ont été générées avec succès." });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de générer toutes les appréciations.", variant: "destructive" });
    } finally {
      setIsLoadingAll(false);
    }
  };

  // STATE A: No bulletins loaded
  if (!hasBulletinsEleves) {
    return (
      <div>
        <StepInfoBanner step={3} />
        <TabUploadPlaceholder
        title="Appréciations individuelles"
        icon={<PenLine className="h-6 w-6" />}
        description="Générez automatiquement une appréciation personnalisée pour chaque élève grâce à l'intelligence artificielle."
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
      </div>
    );
  }

  // STATE B: Data loaded
  return (
    <div className="space-y-6 animate-fade-in">
      <StepInfoBanner step={3} />
      <AppreciationPageHeader
        studentsCount={students.length}
        currentFileName={currentFileName}
        isProcessing={isProcessing}
        onReplace={handleBulletinsElevesUpload}
        onRemove={handleRemoveFile}
      />

      <AttributionToggle
        enabled={attributionsEnabled}
        onToggle={setAttributionsEnabled}
        onApplySuggestions={handleAnalyzeAllAttributions}
        isAnalyzing={isAnalyzingAll}
      />

      <AIActionBar
        charLimit={individualCharLimit}
        onCharLimitChange={setIndividualCharLimit}
        anonymizationLevel={anonymizationLevel}
        onAnonymizationChange={setAnonymizationLevel}
        onGenerateAll={handleRegenerateAll}
        isLoading={isLoadingAll}
        studentsCount={students.length}
      />

      {/* Student Cards */}
      <div className="grid gap-4">
        {students.map((student, index) => {
          const attribution = studentAttributions[index];
          const conductAnalysis: ConductAnalysis = attribution?.conductAnalysis || { hasConductIssues: false, detectedKeywords: [], relevantExcerpts: [] };
          const justifications = studentJustifications[index] || [];
          const bulletinAnalysis = bulletinAnalyses[index];
          
          if (anonymizationLevel === 'maximal' && studentTexts[index]?.includes(FIRST_NAME_PLACEHOLDER)) {
            return (
              <Card key={index} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{student.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ManualFirstNameReplacer
                    appreciation={studentTexts[index]}
                    firstName={student.firstName}
                    onUpdate={(updatedText) => {
                      const newTexts = [...studentTexts]; newTexts[index] = updatedText;
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
                const newTexts = [...studentTexts]; newTexts[index] = text;
                setStudentTexts(newTexts);
                onDataLoaded?.({ studentAppreciations: newTexts });
              }}
              onRegenerate={() => handleRegenerateStudent(index)}
              onEditToggle={() => setEditingStudent(editingStudent === index ? null : index)}
              onTruncate={() => {
                const truncated = truncateIntelligently(studentTexts[index] || "", individualCharLimit);
                const newTexts = [...studentTexts]; newTexts[index] = truncated;
                setStudentTexts(newTexts);
                onDataLoaded?.({ studentAppreciations: newTexts });
              }}
            />
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">Voir le bilan</Button>
      </div>
      
      <AttributionSummaryDialog
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        summary={generateAttributionSummary(Object.values(studentAttributions).map(a => a.attribution))}
        onConfirm={handleApplySuggestions}
        onCancel={() => setShowSummaryDialog(false)}
      />
      
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default AppreciationsTab;
