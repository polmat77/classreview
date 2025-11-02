import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
import { ClasseDataCSV } from "@/utils/csvParser";

interface AnalyseTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
}

const AnalyseTab = ({ onNext, data }: AnalyseTabProps) => {
  // Calculer les statistiques depuis les données réelles
  const eleves = data?.bulletinsEleves || [];
  const classeCSV = data?.classeCSV;
  
  // Calcul de la moyenne générale de la classe depuis les bulletins élèves
  const classAverage = eleves.length > 0
    ? eleves.reduce((sum, eleve) => {
        const moyEleve = eleve.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / eleve.matieres.length;
        return sum + moyEleve;
      }, 0) / eleves.length
    : classeCSV?.statistiques.moyenneClasse || 0;

  const previousAverage = classeCSV?.statistiques.moyenneClasse || classAverage;
  const trend = classAverage > previousAverage ? "up" : classAverage < previousAverage ? "down" : "stable";

  // Distribution des notes
  const gradeDistribution = [
    { 
      name: "Excellent (≥16)", 
      value: eleves.filter(e => {
        const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
        return moy >= 16;
      }).length,
      color: "hsl(var(--success))" 
    },
    { 
      name: "Très bien (14-16)", 
      value: eleves.filter(e => {
        const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
        return moy >= 14 && moy < 16;
      }).length,
      color: "hsl(var(--success-light))" 
    },
    { 
      name: "Bien (12-14)", 
      value: eleves.filter(e => {
        const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
        return moy >= 12 && moy < 14;
      }).length,
      color: "hsl(var(--accent))" 
    },
    { 
      name: "Moyen (10-12)", 
      value: eleves.filter(e => {
        const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
        return moy >= 10 && moy < 12;
      }).length,
      color: "hsl(var(--warning))" 
    },
    { 
      name: "Insuffisant (<10)", 
      value: eleves.filter(e => {
        const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
        return moy < 10;
      }).length,
      color: "hsl(var(--destructive))" 
    },
  ];

  // Calcul des moyennes par matière
  const matieresStats = new Map<string, { total: number; count: number }>();
  eleves.forEach(eleve => {
    eleve.matieres.forEach(matiere => {
      const current = matieresStats.get(matiere.nom) || { total: 0, count: 0 };
      matieresStats.set(matiere.nom, {
        total: current.total + matiere.moyenneEleve,
        count: current.count + 1
      });
    });
  });

  const subjectAverages = Array.from(matieresStats.entries())
    .map(([nom, stats]) => ({
      subject: nom.split(' ')[0], // Prendre le premier mot pour l'affichage
      average: stats.total / stats.count,
      previous: stats.total / stats.count // Pas de données précédentes pour l'instant
    }))
    .slice(0, 6); // Limiter à 6 matières

  // Top 3 élèves
  const top3Eleves = [...eleves]
    .map(eleve => ({
      nom: `${eleve.prenom} ${eleve.nom}`,
      moyenne: eleve.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / eleve.matieres.length
    }))
    .sort((a, b) => b.moyenne - a.moyenne)
    .slice(0, 3);

  const elevesPlusDe12 = eleves.filter(e => {
    const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
    return moy >= 12;
  }).length;

  const elevesEnDifficulte = eleves.filter(e => {
    const moy = e.matieres.reduce((s, m) => s + m.moyenneEleve, 0) / e.matieres.length;
    return moy < 10;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analyse globale</h2>
        <p className="text-muted-foreground">Vue d'ensemble des performances de la classe</p>
      </div>

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
              {elevesPlusDe12}/{eleves.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {eleves.length > 0 ? Math.round((elevesPlusDe12 / eleves.length) * 100) : 0}% de la classe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Élèves en difficulté</CardDescription>
            <CardTitle className="text-4xl font-bold text-warning">
              {elevesEnDifficulte}/{eleves.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {eleves.length > 0 ? Math.round((elevesEnDifficulte / eleves.length) * 100) : 0}% de la classe
            </p>
          </CardContent>
        </Card>
      </div>

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
                Aucune donnée disponible. Veuillez charger des bulletins élèves.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Voir les matières
        </Button>
      </div>
    </div>
  );
};

export default AnalyseTab;
