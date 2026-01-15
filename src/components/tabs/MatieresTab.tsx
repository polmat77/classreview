import { useState } from "react";
import { BookOpen, TrendingUp, TrendingDown, Trophy, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulletinClasseData, BulletinEleveData, extractTextFromPDF, parseBulletinClasse } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import ModifyFileButton from "@/components/ModifyFileButton";

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

  // Build subjects from available data
  const buildSubjects = () => {
    if (bulletinClasse) {
      return bulletinClasse.matieres.map(matiere => ({
        name: matiere.nom,
        average: matiere.moyenne,
        trend: 0,
        top: "",
        needsHelp: 0,
        comments: matiere.appreciation || 'Pas d\'appréciation disponible',
        color: matiere.moyenne >= 14 ? "success" : matiere.moyenne >= 12 ? "accent" : matiere.moyenne >= 10 ? "warning" : "destructive",
      }));
    }

    if (classeCSV) {
      return classeCSV.matieres.map(matiere => {
        const notes = classeCSV.eleves
          .map(e => e.moyennesParMatiere[matiere])
          .filter(n => n !== undefined);
        const moyenne = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
        const needsHelp = notes.filter(n => n < 10).length;
        
        const topEleve = classeCSV.eleves
          .filter(e => e.moyennesParMatiere[matiere] !== undefined)
          .sort((a, b) => (b.moyennesParMatiere[matiere] || 0) - (a.moyennesParMatiere[matiere] || 0))[0];
        
        return {
          name: matiere,
          average: moyenne,
          trend: 0,
          top: topEleve ? `${topEleve.nom} (${topEleve.moyennesParMatiere[matiere]?.toFixed(2)}/20)` : "",
          needsHelp,
          comments: 'Données issues du tableau de résultats',
          color: moyenne >= 14 ? "success" : moyenne >= 12 ? "accent" : moyenne >= 10 ? "warning" : "destructive",
        };
      });
    }

    return [];
  };

  const subjects = buildSubjects();
  const hasData = subjects.length > 0;

  // STATE A: No file loaded - Show upload placeholder
  if (!bulletinClasse && !classeCSV) {
    return (
      <TabUploadPlaceholder
        title="Analyse par matière"
        icon={<BookOpen className="h-6 w-6" />}
        description="Visualisez les performances de la classe dans chaque discipline pour identifier les points forts et les matières à renforcer."
        fileLabel="📁 Fichier requis : Bulletin de classe (PDF)"
        fileHelper="Exportez depuis PRONOTE → Bulletins → Exporter (PDF classe)"
        accept=".pdf"
        features={[
          { text: "Les moyennes de classe par matière" },
          { text: "La comparaison avec les moyennes de l'établissement (si disponibles)" },
          { text: "Un classement des disciplines par réussite" },
        ]}
        isLoading={isProcessing}
        onUpload={handleBulletinClasseUpload}
      />
    );
  }

  // STATE B: Data loaded - Show subject analysis
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with modify button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analyse par matière</h2>
            <p className="text-muted-foreground">
              {bulletinClasse 
                ? `${bulletinClasse.classe} • ${bulletinClasse.matieres.length} matières`
                : `${subjects.length} matières analysées`
              }
            </p>
          </div>
        </div>
        <ModifyFileButton
          accept=".pdf"
          isLoading={isProcessing}
          onUpload={handleBulletinClasseUpload}
        />
      </div>

      {/* Subject cards */}
      {hasData && (
        <>
          <div className="grid gap-4">
            {subjects.map((subject, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription className="mt-1">{subject.comments}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-3xl font-bold text-${subject.color}`}>
                        {subject.average.toFixed(1)}
                      </span>
                      {subject.trend !== 0 && (
                        <div className="flex items-center gap-1">
                          {subject.trend > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-success" />
                              <span className="text-sm font-medium text-success">
                                +{subject.trend.toFixed(1)}
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-destructive" />
                              <span className="text-sm font-medium text-destructive">
                                {subject.trend.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {subject.top && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-warning" />
                        <span className="text-sm text-muted-foreground">Meilleur·e:</span>
                        <span className="text-sm font-medium">{subject.top}</span>
                      </div>
                    )}
                    {subject.needsHelp > 0 && (
                      <Badge variant="outline" className="border-warning text-warning">
                        {subject.needsHelp} élève{subject.needsHelp > 1 ? "s" : ""} à accompagner
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Recommandations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-medium">Matières en difficulté</p>
                  <p className="text-sm text-muted-foreground">
                    Prévoir des séances de soutien pour les matières avec moyenne inférieure à 10
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-sm font-medium">Points forts</p>
                  <p className="text-sm text-muted-foreground">
                    Continuer les encouragements dans les matières avec de bons résultats
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Générer les appréciations
        </Button>
      </div>
    </div>
  );
};

export default MatieresTab;