import { useState } from "react";
import { BarChart3 } from "lucide-react";
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
import FileActionButtons from "@/components/FileActionButtons";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";

// New components
import KPICards from "@/components/analysis/KPICards";
import TopStudents from "@/components/analysis/TopStudents";
import StudentsMonitoring from "@/components/analysis/StudentsMonitoring";
import SubjectAnalysis from "@/components/analysis/SubjectAnalysis";
import AIRecommendations from "@/components/analysis/AIRecommendations";
import { getSubjectAverages } from "@/utils/statisticsCalculations";

interface AnalyseTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
  onDataLoaded?: (data: { classeCSV?: ClasseDataCSV | null }) => void;
}

const AnalyseTab = ({ onNext, data, onDataLoaded }: AnalyseTabProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localClasseCSV, setLocalClasseCSV] = useState<ClasseDataCSV | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");

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
        setCurrentFileName(file.name);
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

  const handleRemoveFile = () => {
    setLocalClasseCSV(null);
    setCurrentFileName("");
    onDataLoaded?.({ classeCSV: null });
  };

  // STATE A: No file loaded - Show upload placeholder
  if (!classeCSV) {
    return (
      <TabUploadPlaceholder
        title="Analyse des résultats de la classe"
        icon={<BarChart3 className="h-6 w-6" />}
        description="Obtenez une vue d'ensemble des performances de votre classe : moyenne générale, répartition des notes, élèves en difficulté ou en réussite."
        accept=".csv,.pdf"
        features={[
          { text: "La moyenne générale et sa comparaison avec le trimestre précédent" },
          { text: "La répartition des élèves par tranche de moyenne" },
          { text: "L'identification des profils (excellents, satisfaisants, en difficulté)" },
        ]}
        isLoading={isProcessing}
        onUpload={handleTableauResultatsUpload}
        helpTooltip={<PronoteHelpTooltip type="resultats" />}
      />
    );
  }

  // STATE B: File loaded - Show analysis dashboard
  const gradeDistribution = [
    { 
      name: "Excellent (≥16)", 
      value: classeCSV.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale >= 16).length,
      color: "hsl(var(--success))" 
    },
    { 
      name: "Très bien (14-16)", 
      value: classeCSV.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale >= 14 && e.moyenneGenerale < 16).length,
      color: "hsl(142 71% 45%)" 
    },
    { 
      name: "Bien (12-14)", 
      value: classeCSV.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale >= 12 && e.moyenneGenerale < 14).length,
      color: "hsl(var(--accent))" 
    },
    { 
      name: "Moyen (10-12)", 
      value: classeCSV.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale >= 10 && e.moyenneGenerale < 12).length,
      color: "hsl(var(--warning))" 
    },
    { 
      name: "Insuffisant (<10)", 
      value: classeCSV.eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale < 10).length,
      color: "hsl(var(--destructive))" 
    },
  ].filter(d => d.value > 0);

  const subjectAverages = getSubjectAverages(classeCSV).slice(0, 8).map(s => ({
    subject: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
    average: s.currentAvg,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with file action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analyse des résultats</h2>
            <p className="text-muted-foreground">
              {classeCSV.statistiques.totalEleves} élèves • {classeCSV.matieres.length} matières
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PronoteHelpTooltip type="resultats" />
          <FileActionButtons
            accept=".csv,.pdf"
            isLoading={isProcessing}
            currentFileName={currentFileName || "Tableau de résultats"}
            loadedInfo={`${classeCSV.statistiques.totalEleves} élèves • ${classeCSV.matieres.length} matières`}
            onReplace={handleTableauResultatsUpload}
            onRemove={handleRemoveFile}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards eleves={classeCSV.eleves} />

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des moyennes</CardTitle>
            <CardDescription>Distribution des élèves par niveau</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
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
            <CardDescription>Résultats des principales matières</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={subjectAverages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 20]} />
                <YAxis type="category" dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'Moyenne']}
                />
                <Bar 
                  dataKey="average" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Analysis */}
      <SubjectAnalysis classeCSV={classeCSV} />

      {/* Two columns: Top Students + Students Monitoring */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopStudents eleves={classeCSV.eleves} />
        <StudentsMonitoring eleves={classeCSV.eleves} />
      </div>

      {/* AI Recommendations */}
      <AIRecommendations classeCSV={classeCSV} />

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Voir l'appréciation de classe
        </Button>
      </div>
    </div>
  );
};

export default AnalyseTab;
