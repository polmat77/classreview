import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Loader2, AlertTriangle, Scissors, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BulletinClasseData, BulletinEleveData, extractTextFromPDF, parseBulletinClasse } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import FileActionButtons from "@/components/FileActionButtons";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";
import ToneSelector from "@/components/ToneSelector";
import { AppreciationTone } from "@/types/appreciation";
import { analyzeTeacherAppreciations, identifyExceptionalSubjects } from "@/utils/appreciationThemeAnalyzer";

const CHAR_LIMIT_OPTIONS = [
  { value: 200, label: "200 caractères", description: "très court" },
  { value: 225, label: "225 caractères", description: "court" },
  { value: 255, label: "255 caractères", description: "standard PRONOTE" },
  { value: 300, label: "300 caractères", description: "détaillé" },
  { value: 350, label: "350 caractères", description: "très détaillé" },
  { value: 400, label: "400 caractères", description: "maximum" },
  { value: 500, label: "500 caractères", description: "très détaillé" },
];

const truncateIntelligently = (text: string, limit: number): string => {
  if (text.length <= limit) return text;

  const truncated = text.substring(0, limit);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastExclamation = truncated.lastIndexOf("!");
  const lastQuestion = truncated.lastIndexOf("?");

  const lastPunctuation = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastPunctuation > limit * 0.7) {
    return truncated.substring(0, lastPunctuation + 1);
  }

  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > limit * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
};

const getCharCountColor = (current: number, limit: number): string => {
  const percentage = (current / limit) * 100;
  if (percentage < 90) return "text-green-600";
  if (percentage <= 100) return "text-amber-600";
  return "text-destructive";
};

const getCharBadgeVariant = (current: number, limit: number): "default" | "secondary" | "destructive" => {
  const percentage = (current / limit) * 100;
  if (percentage < 90) return "default";
  if (percentage <= 100) return "secondary";
  return "destructive";
};

interface MatieresTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
    generalAppreciation?: string;
  };
  onDataLoaded?: (data: { bulletinClasse?: BulletinClasseData | null; generalAppreciation?: string | null }) => void;
}

const MatieresTab = ({ onNext, data, onDataLoaded }: MatieresTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinClasse, setLocalBulletinClasse] = useState<BulletinClasseData | null>(null);
  const [generalText, setGeneralText] = useState(data?.generalAppreciation || "");
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [classTone, setClassTone] = useState<AppreciationTone>("standard");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [charLimit, setCharLimit] = useState<number>(() => {
    const saved = localStorage.getItem("classcouncil_char_limit");
    return saved ? parseInt(saved, 10) : 255;
  });
  const [wasTruncated, setWasTruncated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAppreciation = async () => {
    if (!generalText.trim()) return;

    try {
      await navigator.clipboard.writeText(generalText);
      setIsCopied(true);
      toast({
        title: "✓ Appréciation copiée",
        description: "L'appréciation a été copiée dans le presse-papiers",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  // Persist char limit preference
  useEffect(() => {
    localStorage.setItem("classcouncil_char_limit", charLimit.toString());
  }, [charLimit]);

  const bulletinClasse = data?.bulletinClasse || localBulletinClasse;
  const classeCSV = data?.classeCSV;

  const handleBulletinClasseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers PDF sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const text = await extractTextFromPDF(file);
      const parsedData = parseBulletinClasse(text);
      if (parsedData) {
        setLocalBulletinClasse(parsedData);
        setCurrentFileName(file.name);
        onDataLoaded?.({ bulletinClasse: parsedData });
        toast({
          title: "✓ Bulletin de classe chargé",
          description: `${parsedData.matieres.length} matières détectées. Génération de l'appréciation en cours...`,
        });

        // Auto-generate appreciation with standard tone
        setTimeout(async () => {
          setIsLoadingGeneral(true);
          try {
            console.log("🚀 Auto-génération de l'appréciation au chargement...");

            // Analyser les thèmes depuis les appréciations des profs
            const themes = analyzeTeacherAppreciations(parsedData);
            const exceptionalSubjects = identifyExceptionalSubjects(parsedData);

            // Extract teacher names from matieres for the scrubbing filter
            const teacherNames = parsedData.matieres
              .map(m => m.appreciation || '')
              .join(' ')
              .match(/\b(?:M\.|Mme|Mlle)\s+([A-ZÀ-Ü][-A-ZÀ-Ü\s]+)/g)
              ?.map(name => name.replace(/^(M\.|Mme|Mlle)\s*/, '').trim())
              .filter(name => name.length > 1) || [];

            const { data: result, error } = await supabase.functions.invoke("generate-class-appreciation", {
              body: {
                classData: parsedData,
                themes: themes,
                exceptionalSubjects: exceptionalSubjects,
                tone: "standard",
                maxCharacters: charLimit,
                teacherNames: teacherNames,
              },
            });

            if (!error && result?.appreciation) {
              setGeneralText(result.appreciation);
              onDataLoaded?.({ generalAppreciation: result.appreciation });
              toast({
                title: "✓ Appréciation générée",
                description: "L'appréciation générale a été générée automatiquement.",
              });
            } else {
              console.error("Erreur lors de la génération:", error);
              toast({
                title: "Erreur",
                description: "Impossible de générer l'appréciation automatiquement",
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error("Auto-generate error:", err);
            toast({
              title: "Erreur",
              description: "Impossible de générer l'appréciation automatiquement",
              variant: "destructive",
            });
          } finally {
            setIsLoadingGeneral(false);
          }
        }, 100);
      } else {
        throw new Error("Impossible de parser le bulletin de classe");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du PDF:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de lire le fichier PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    setLocalBulletinClasse(null);
    setCurrentFileName("");
    setGeneralText("");
    setClassTone("standard");
    onDataLoaded?.({ bulletinClasse: null });
  };

  const generateAppreciation = async (): Promise<string> => {
    if (!bulletinClasse) {
      throw new Error("Bulletin de classe non chargé");
    }

    console.log("🚀 Génération de l'appréciation de classe...");
    console.log("   Tonalité:", classTone);
    console.log("   Longueur max:", charLimit);

    // Étape 1 : Analyser les thèmes depuis les appréciations des profs
    console.log("📊 Analyse des thèmes...");
    const themes = analyzeTeacherAppreciations(bulletinClasse);

    // Étape 2 : Identifier les matières exceptionnelles
    const exceptionalSubjects = identifyExceptionalSubjects(bulletinClasse);

    // Étape 3 : Extraire les noms de professeurs depuis les appréciations
    const teacherNames = bulletinClasse.matieres
      .map(m => m.appreciation || '')
      .join(' ')
      .match(/\b(?:M\.|Mme|Mlle)\s+([A-ZÀ-Ü][-A-ZÀ-Ü\s]+)/g)
      ?.map(name => name.replace(/^(M\.|Mme|Mlle)\s*/, '').trim())
      .filter(name => name.length > 1) || [];
    
    console.log("👤 Noms de professeurs extraits:", teacherNames);

    // Étape 4 : Appeler l'Edge Function avec les thèmes
    console.log("📡 Appel à l'Edge Function generate-class-appreciation...");
    const { data: result, error } = await supabase.functions.invoke("generate-class-appreciation", {
      body: {
        classData: bulletinClasse,
        themes: themes,
        exceptionalSubjects: exceptionalSubjects,
        tone: classTone,
        maxCharacters: charLimit,
        teacherNames: teacherNames,
      },
    });

    if (error) {
      console.error("❌ Erreur Edge Function:", error);
      throw error;
    }

    if (!result || !result.appreciation) {
      console.error("❌ Réponse invalide:", result);
      throw new Error("Réponse invalide du serveur");
    }

    console.log("✅ Appréciation générée:", result.characterCount, "/", charLimit, "caractères");

    // Apply truncation as safety net if AI exceeded limit
    let appreciation = result.appreciation;
    if (appreciation.length > charLimit) {
      console.warn("⚠️ Appréciation trop longue, troncature appliquée");
      appreciation = truncateIntelligently(appreciation, charLimit);
      setWasTruncated(true);
    } else {
      setWasTruncated(false);
    }

    return appreciation;
  };

  const handleRegenerateGeneral = async () => {
    if (!bulletinClasse) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord charger un bulletin de classe",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingGeneral(true);
    try {
      const appreciation = await generateAppreciation();
      setGeneralText(appreciation);
      onDataLoaded?.({ generalAppreciation: appreciation });
      toast({
        title: "✓ Appréciation générée",
        description: "L'appréciation générale a été générée avec succès.",
      });
    } catch (error) {
      console.error("Error generating general appreciation:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer l'appréciation.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  // STATE A: No bulletin de classe loaded - Show upload placeholder
  // Note: We specifically need the bulletin PDF for class appreciation, not just CSV data
  if (!bulletinClasse) {
    return (
      <TabUploadPlaceholder
        title="Appréciation de la classe"
        icon={<BookOpen className="h-6 w-6" />}
        description="Générez automatiquement l'appréciation générale du conseil de classe grâce à l'intelligence artificielle : une synthèse de la dynamique du groupe et des axes de progression."
        accept=".pdf"
        features={[
          { text: "Appréciation générale de classe (200-500 caractères)" },
          { text: "Analyse automatique des observations des enseignants" },
          { text: "Détection des thèmes récurrents (bavardages, travail, participation)" },
          { text: "Identification des matières fortes et faibles" },
          { text: "Vous pourrez relire, modifier et valider l'appréciation avant export" },
        ]}
        isLoading={isProcessing}
        onUpload={handleBulletinClasseUpload}
        helpTooltip={<PronoteHelpTooltip type="bulletin" />}
      />
    );
  }

  // STATE B: Data loaded - Show class appreciation generation
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with file action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Appréciation de la classe</h2>
            <p className="text-muted-foreground">
              {bulletinClasse
                ? `${bulletinClasse.classe} • ${bulletinClasse.matieres.length} matières`
                : `${classeCSV?.matieres.length || 0} matières analysées`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PronoteHelpTooltip type="bulletin" />
          <FileActionButtons
            accept=".pdf"
            isLoading={isProcessing}
            currentFileName={currentFileName || "Bulletin de classe"}
            loadedInfo={`${bulletinClasse.matieres.length} matières détectées`}
            onReplace={handleBulletinClasseUpload}
            onRemove={handleRemoveFile}
          />
        </div>
      </div>

      {/* Settings Card: Tone & Character Limit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Paramètres de génération</CardTitle>
          <CardDescription>Choisissez le ton et la longueur de l'appréciation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tonalité</label>
            <ToneSelector value={classTone} onChange={setClassTone} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Limite de caractères</label>
            <Select value={charLimit.toString()} onValueChange={(value) => setCharLimit(parseInt(value, 10))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAR_LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label} ({option.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Truncation Warning */}
      {wasTruncated && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Le texte a été tronqué intelligemment pour respecter la limite de {charLimit} caractères.</span>
        </div>
      )}

      {/* Class Appreciation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appréciation générale de la classe</CardTitle>
              <CardDescription>Synthèse du trimestre (max. {charLimit} caractères)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {generalText.length > charLimit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                  onClick={() => {
                    const truncated = truncateIntelligently(generalText, charLimit);
                    setGeneralText(truncated);
                    onDataLoaded?.({ generalAppreciation: truncated });
                    toast({ title: "Texte tronqué", description: "L'appréciation a été raccourcie intelligemment." });
                  }}
                >
                  <Scissors className="h-4 w-4" />
                  Tronquer
                </Button>
              )}
              <Button
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-sm"
                onClick={handleCopyAppreciation}
                disabled={!generalText.trim()}
                title="Copier l'appréciation"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié ✓
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent-hover transition-colors shadow-sm"
                onClick={handleRegenerateGeneral}
                disabled={isLoadingGeneral || !bulletinClasse}
              >
                {isLoadingGeneral ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Régénérer avec IA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={generalText}
              onChange={(e) => {
                setGeneralText(e.target.value);
                setWasTruncated(false);
                onDataLoaded?.({ generalAppreciation: e.target.value });
              }}
              className="min-h-[120px] resize-none"
              placeholder="Cliquez sur 'Régénérer avec IA' pour générer l'appréciation..."
            />
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getCharCountColor(generalText.length, charLimit)}`}>
                {generalText.length}/{charLimit} caractères
                {generalText.length > charLimit && (
                  <span className="ml-2 bg-destructive text-white px-2 py-0.5 rounded text-xs">
                    {generalText.length - charLimit} en trop
                  </span>
                )}
              </span>
              <span
                className={`bg-muted text-foreground px-2 py-1 rounded text-sm font-medium border ${
                  generalText.length > charLimit ? "border-destructive bg-destructive/10" : "border-border"
                }`}
              >
                {charLimit - generalText.length} restants
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Summary Card */}
      {bulletinClasse && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Résumé par matière</CardTitle>
            <CardDescription>Appréciations des professeurs extraites du bulletin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {bulletinClasse.matieres.slice(0, 5).map((matiere, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{matiere.nom}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {matiere.appreciation || "Pas d'appréciation disponible"}
                  </p>
                </div>
                <Badge
                  variant={matiere.moyenne >= 14 ? "default" : matiere.moyenne >= 10 ? "secondary" : "destructive"}
                >
                  {matiere.moyenne.toFixed(1)}
                </Badge>
              </div>
            ))}
            {bulletinClasse.matieres.length > 5 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                + {bulletinClasse.matieres.length - 5} autres matières
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Passer aux appréciations individuelles
        </Button>
      </div>
    </div>
  );
};

export default MatieresTab;
