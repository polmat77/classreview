import { useState } from "react";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BulletinClasseData, BulletinEleveData, extractTextFromPDF, parseBulletinClasse } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import ModifyFileButton from "@/components/ModifyFileButton";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";
import ToneSelector from "@/components/ToneSelector";
import { AppreciationTone } from "@/types/appreciation";

interface MatieresTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
  onDataLoaded?: (data: { bulletinClasse: BulletinClasseData }) => void;
}

const MatieresTab = ({ onNext, data, onDataLoaded }: MatieresTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinClasse, setLocalBulletinClasse] = useState<BulletinClasseData | null>(null);
  const [generalText, setGeneralText] = useState("");
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [classTone, setClassTone] = useState<AppreciationTone>('standard');

  const bulletinClasse = data?.bulletinClasse || localBulletinClasse;
  const classeCSV = data?.classeCSV;

  const handleBulletinClasseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const text = await extractTextFromPDF(file);
      const parsedData = parseBulletinClasse(text);
      if (parsedData) {
        setLocalBulletinClasse(parsedData);
        onDataLoaded?.({ bulletinClasse: parsedData });
        toast({
          title: "✓ Bulletin de classe chargé",
          description: `${parsedData.matieres.length} matières détectées`,
        });
      } else {
        throw new Error("Impossible de parser le bulletin de classe");
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

  const generateAppreciation = async (): Promise<string> => {
    const classData = classeCSV ? {
      className: "3ème",
      trimester: "1er trimestre",
      averageClass: classeCSV.statistiques.moyenneClasse,
      subjects: classeCSV.matieres.map(m => ({ name: m, average: 0 })),
    } : bulletinClasse ? {
      className: bulletinClasse.classe || "3ème",
      trimester: bulletinClasse.trimestre || "1er trimestre",
      averageClass: bulletinClasse.matieres.reduce((sum, m) => sum + m.moyenne, 0) / (bulletinClasse.matieres.length || 1),
      subjects: bulletinClasse.matieres.map(m => ({ name: m.nom, average: m.moyenne })),
    } : undefined;

    const { data: result, error } = await supabase.functions.invoke('generate-appreciation', {
      body: { type: 'general', tone: classTone, classData },
    });

    if (error) throw error;
    return result.appreciation;
  };

  const handleRegenerateGeneral = async () => {
    setIsLoadingGeneral(true);
    try {
      const appreciation = await generateAppreciation();
      setGeneralText(appreciation);
      toast({ title: "Appréciation générée", description: "L'appréciation générale a été générée avec succès." });
    } catch (error) {
      console.error('Error generating general appreciation:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
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
          { text: "Appréciation générale de classe (200-255 caractères)" },
          { text: "Synthèse de la dynamique du groupe et des axes de progression" },
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
      {/* Header with modify button */}
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
                : `${classeCSV?.matieres.length || 0} matières analysées`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PronoteHelpTooltip type="bulletin" />
          <ModifyFileButton
            accept=".pdf"
            isLoading={isProcessing}
            onUpload={handleBulletinClasseUpload}
          />
        </div>
      </div>

      {/* Tone Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tonalité de l'appréciation</CardTitle>
          <CardDescription>Choisissez le ton adapté à la dynamique de la classe</CardDescription>
        </CardHeader>
        <CardContent>
          <ToneSelector value={classTone} onChange={setClassTone} />
        </CardContent>
      </Card>

      {/* Class Appreciation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appréciation générale de la classe</CardTitle>
              <CardDescription>Synthèse du trimestre (200-255 caractères)</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleRegenerateGeneral}
              disabled={isLoadingGeneral}
            >
              {isLoadingGeneral ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Régénérer avec IA
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={generalText}
              onChange={(e) => setGeneralText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={255}
              placeholder="Cliquez sur 'Régénérer avec IA' pour générer l'appréciation..."
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {generalText.length}/255 caractères
              </span>
              <Badge variant={generalText.length > 240 ? "destructive" : generalText.length < 200 ? "secondary" : "default"}>
                {255 - generalText.length} restants
              </Badge>
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
                  <p className="text-sm text-muted-foreground">
                    {matiere.appreciation || "Pas d'appréciation disponible"}
                  </p>
                </div>
                <Badge variant={matiere.moyenne >= 14 ? "default" : matiere.moyenne >= 10 ? "secondary" : "destructive"}>
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
