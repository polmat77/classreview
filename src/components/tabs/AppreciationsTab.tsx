import { useState } from "react";
import { PenLine, Sparkles, User, Edit2, Loader2, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulletinClasseData, BulletinEleveData, parseBulletinsElevesFromPDF } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import ModifyFileButton from "@/components/ModifyFileButton";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";

interface StudentData {
  name: string;
  average: number;
  subjects?: { name: string; grade: number; classAverage?: number; appreciation?: string }[];
  status: "excellent" | "good" | "needs-improvement";
}

interface AppreciationsTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
  onDataLoaded?: (data: { bulletinsEleves: BulletinEleveData[] }) => void;
}

const AppreciationsTab = ({ onNext, data, onDataLoaded }: AppreciationsTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localBulletinsEleves, setLocalBulletinsEleves] = useState<BulletinEleveData[]>([]);

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
        const newBulletins = [...localBulletinsEleves, ...bulletins];
        setLocalBulletinsEleves(newBulletins);
        onDataLoaded?.({ bulletinsEleves: newBulletins });
        toast({
          title: "✓ Bulletins élèves chargés",
          description: `${bulletins.length} élève${bulletins.length > 1 ? 's' : ''} extrait${bulletins.length > 1 ? 's' : ''} du PDF`,
        });
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

  // Build students list from data
  const buildStudentsList = (): StudentData[] => {
    if (bulletinsEleves.length > 0) {
      return bulletinsEleves.map(eleve => {
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
        };
      });
    }

    if (classeCSV?.eleves) {
      return classeCSV.eleves.map(eleve => {
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
        };
      });
    }

    return [];
  };

  const students = buildStudentsList();
  const hasBulletinsEleves = bulletinsEleves.length > 0;
  const hasStudents = students.length > 0;

  const [generalText, setGeneralText] = useState("");
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [studentTexts, setStudentTexts] = useState<string[]>([]);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [loadingStudentIndex, setLoadingStudentIndex] = useState<number | null>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  if (studentTexts.length !== students.length && students.length > 0) {
    setStudentTexts(students.map(() => ""));
  }

  const generateAppreciation = async (type: 'general' | 'individual', student?: StudentData): Promise<string> => {
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
      body: { type, classData, student },
    });

    if (error) throw error;
    return result.appreciation;
  };

  const handleRegenerateGeneral = async () => {
    setIsLoadingGeneral(true);
    try {
      const appreciation = await generateAppreciation('general');
      setGeneralText(appreciation);
      toast({ title: "Appréciation générée", description: "L'appréciation générale a été générée avec succès." });
    } catch (error) {
      console.error('Error generating general appreciation:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  const handleRegenerateStudent = async (index: number) => {
    setLoadingStudentIndex(index);
    try {
      const student = students[index];
      const appreciation = await generateAppreciation('individual', student);
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
      const generalAppreciation = await generateAppreciation('general');
      setGeneralText(generalAppreciation);

      const newTexts = [...studentTexts];
      for (let i = 0; i < students.length; i++) {
        const appreciation = await generateAppreciation('individual', students[i]);
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

  // STATE A: No data loaded - Show upload placeholder
  if (!hasBulletinsEleves && !hasStudents) {
    return (
      <TabUploadPlaceholder
        title="Génération des appréciations"
        icon={<PenLine className="h-6 w-6" />}
        description="Générez automatiquement les appréciations du conseil de classe grâce à l'intelligence artificielle : une appréciation générale pour la classe et une appréciation personnalisée pour chaque élève."
        fileLabel="📁 Fichier requis : Bulletins individuels des élèves (PDF)"
        fileHelper="Exportez depuis PRONOTE → Bulletins → Exporter (PDF par élève)"
        accept=".pdf"
        featuresTitle="Fonctionnalités disponibles :"
        features={[
          { text: "Appréciation générale de classe (200-255 caractères) → Synthèse de la dynamique du groupe" },
          { text: "Appréciations individuelles (250-450 caractères par élève) → Rédigées à la 3ᵉ personne, commençant par le prénom" },
          { text: "Vous pourrez relire, modifier et valider chaque appréciation avant export" },
        ]}
        isLoading={isProcessing}
        onUpload={handleBulletinsElevesUpload}
        helpTooltip={<PronoteHelpTooltip type="individuels" />}
      />
    );
  }

  // STATE B: Data loaded - Show appreciation generation
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with modify button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PenLine className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Génération des appréciations</h2>
            <p className="text-muted-foreground">
              {students.length} élève{students.length > 1 ? 's' : ''} chargé{students.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PronoteHelpTooltip type="individuels" />
          <ModifyFileButton
            accept=".pdf"
            isLoading={isProcessing}
            onUpload={handleBulletinsElevesUpload}
          />
        </div>
      </div>

      {/* Appreciation tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Appréciation générale</TabsTrigger>
          <TabsTrigger value="students">Appréciations individuelles ({students.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
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
                  disabled={isLoadingGeneral || isLoadingAll}
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
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4">
            {students.map((student, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{student.name}</CardTitle>
                        <CardDescription>Moyenne: {student.average.toFixed(2)}/20</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.status === "excellent" && (
                        <Badge className="bg-success text-success-foreground">Excellent</Badge>
                      )}
                      {student.status === "good" && (
                        <Badge className="bg-accent text-accent-foreground">Satisfaisant</Badge>
                      )}
                      {student.status === "needs-improvement" && (
                        <Badge className="bg-warning text-warning-foreground">Fragile</Badge>
                      )}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditingStudent(editingStudent === index ? null : index)
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate all button */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">IA disponible</p>
            <p className="text-xs text-muted-foreground">
              Régénérez automatiquement les appréciations avec des suggestions personnalisées
            </p>
          </div>
        </div>
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

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Exporter le bilan
        </Button>
      </div>
    </div>
  );
};

export default AppreciationsTab;