import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, Table2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV, parseCSVClasse, parseTableauMoyennesPDF } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";
import TabUploadPlaceholder from "@/components/TabUploadPlaceholder";
import ModifyFileButton from "@/components/ModifyFileButton";

interface AnalyseTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
  onDataLoaded?: (data: { classeCSV: ClasseDataCSV }) => void;
}

const AnalyseTab = ({ onNext, data, onDataLoaded }: AnalyseTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localClasseCSV, setLocalClasseCSV] = useState<ClasseDataCSV | null>(null);

  const classeCSV = data?.classeCSV || localClasseCSV;

  const handleTableauResultatsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isPDF = file.name.endsWith('.pdf');

    if (!isCSV && !isPDF) {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers CSV et PDF sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let parsedData: ClasseDataCSV | null = null;

      if (isCSV) {
        parsedData = await parseCSVClasse(file);
      } else if (isPDF) {
        parsedData = await parseTableauMoyennesPDF(file);
      }

      if (parsedData && parsedData.eleves.length > 0) {
        setLocalClasseCSV(parsedData);
        onDataLoaded?.({ classeCSV: parsedData });
        toast({
          title: "✓ Tableau de résultats chargé",
          description: `${parsedData.statistiques.totalEleves} élèves • ${parsedData.matieres.length} matières`,
        });
      } else {
        throw new Error("Impossible de parser le fichier. Vérifiez le format.");
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de lire le fichier",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  // STATE A: No file loaded - Show upload placeholder
  if (!classeCSV) {
    return (
      <TabUploadPlaceholder
        title="Analyse des résultats de la classe"
        icon={<BarChart3 className="h-6 w-6" />}
        description="Obtenez une vue d'ensemble des performances de votre classe : moyenne générale, répartition des notes, élèves en difficulté ou en réussite."
        fileLabel="📁 Fichier requis : Tableau de résultats de la classe"
        fileHelper="Exportez depuis PRONOTE → Notes → Tableau des moyennes → Exporter (CSV ou PDF)"
        accept=".csv,.pdf"
        features={[
          { text: "La moyenne générale et sa comparaison avec le trimestre précédent" },
          { text: "La répartition des élèves par tranche de moyenne" },
          { text: "L'identification des profils (excellents, satisfaisants, en difficulté)" },
        ]}
        isLoading={isProcessing}
        onUpload={handleTableauResultatsUpload}
      />
    );
  }

  // STATE B: File loaded - Show analysis dashboard
  const eleves = data?.bulletinsEleves || [];
  
  const classAverage = eleves.length > 0
    ? eleves.reduce((sum, eleve) => {
        const moyEleve = eleve.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / eleve.matieres.length;
        return sum + moyEleve;
      }, 0) / eleves.length
    : classeCSV?.statistiques.moyenneClasse || 0;

  const previousAverage = classeCSV?.statistiques.moyenneClasse || classAverage;
  const trend = classAverage > previousAverage ? "up" : classAverage < previousAverage ? "down" : "stable";

  const gradeDistribution = classeCSV ? [
    { 
      name: "Excellent (≥16)", 
      value: classeCSV.eleves.filter(e => e.moyenneGenerale >= 16).length,
      color: "hsl(var(--success))" 
    },
    { 
      name: "Très bien (14-16)", 
      value: classeCSV.eleves.filter(e => e.moyenneGenerale >= 14 && e.moyenneGenerale < 16).length,
      color: "hsl(var(--success-light))" 
    },
    { 
      name: "Bien (12-14)", 
      value: classeCSV.eleves.filter(e => e.moyenneGenerale >= 12 && e.moyenneGenerale < 14).length,
      color: "hsl(var(--accent))" 
    },
    { 
      name: "Moyen (10-12)", 
      value: classeCSV.eleves.filter(e => e.moyenneGenerale >= 10 && e.moyenneGenerale < 12).length,
      color: "hsl(var(--warning))" 
    },
    { 
      name: "Insuffisant (<10)", 
      value: classeCSV.eleves.filter(e => e.moyenneGenerale < 10).length,
      color: "hsl(var(--destructive))" 
    },
  ] : [];

  const subjectAverages = classeCSV?.matieres.map(matiere => {
    const notes = classeCSV.eleves
      .map(e => e.moyennesParMatiere[matiere])
      .filter(n => n !== undefined);
    const avg = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
    return {
      subject: matiere.split(' ')[0],
      average: avg,
      previous: avg,
    };
  }).slice(0, 6) || [];

  const top3Eleves = classeCSV?.eleves
    .map(e => ({ nom: e.nom, moyenne: e.moyenneGenerale }))
    .sort((a, b) => b.moyenne - a.moyenne)
    .slice(0, 3) || [];

  const elevesPlusDe12 = classeCSV?.eleves.filter(e => e.moyenneGenerale >= 12).length || 0;
  const elevesEnDifficulte = classeCSV?.eleves.filter(e => e.moyenneGenerale < 10).length || 0;
  const totalEleves = classeCSV?.eleves.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with modify button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analyse des résultats de la classe</h2>
            <p className="text-muted-foreground">
              {classeCSV.statistiques.totalEleves} élèves • {classeCSV.matieres.length} matières
            </p>
          </div>
        </div>
        <ModifyFileButton
          accept=".csv,.pdf"
          isLoading={isProcessing}
          onUpload={handleTableauResultatsUpload}
        />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <CardDescription className="text-primary-foreground/80">Moyenne générale</CardDescription>
            <CardTitle className="text-4xl font-bold">{classAverage.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "stable" && <Minus className="h-4 w-4" />}
              <span>
                {trend === "up" && "+"}
                {(classAverage - previousAverage).toFixed(2)} par rapport au T1
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Élèves au-dessus de 12</CardDescription>
            <CardTitle className="text-4xl font-bold text-success">
              {elevesPlusDe12}/{totalEleves}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalEleves > 0 ? Math.round((elevesPlusDe12 / totalEleves) * 100) : 0}% de la classe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Élèves en difficulté</CardDescription>
            <CardTitle className="text-4xl font-bold text-warning">
              {elevesEnDifficulte}/{totalEleves}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalEleves > 0 ? Math.round((elevesEnDifficulte / totalEleves) * 100) : 0}% de la classe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des moyennes</CardTitle>
            <CardDescription>Distribution des élèves par niveau</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moyennes par matière</CardTitle>
            <CardDescription>Comparaison avec le trimestre précédent</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 20]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="average" fill="hsl(var(--primary))" name="Actuel" radius={[8, 8, 0, 0]} />
                <Bar dataKey="previous" fill="hsl(var(--muted))" name="Précédent" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Top 3 élèves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {top3Eleves.map((eleve, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <span className="font-medium">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'} {eleve.nom}
                </span>
                <span className="text-lg font-bold text-success">
                  {eleve.moyenne.toFixed(2)}
                </span>
              </div>
            ))}
            {top3Eleves.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée disponible.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Voir l'appréciation de classe
        </Button>
      </div>
    </div>
  );
};

export default AnalyseTab;