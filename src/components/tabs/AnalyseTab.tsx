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

interface AnalyseTabProps {
  onNext: () => void;
}

const gradeDistribution = [
  { name: "Excellent (≥16)", value: 3, color: "hsl(var(--success))" },
  { name: "Très bien (14-16)", value: 5, color: "hsl(var(--success-light))" },
  { name: "Bien (12-14)", value: 8, color: "hsl(var(--accent))" },
  { name: "Moyen (10-12)", value: 6, color: "hsl(var(--warning))" },
  { name: "Insuffisant (<10)", value: 3, color: "hsl(var(--destructive))" },
];

const subjectAverages = [
  { subject: "Maths", average: 12.5, previous: 11.8 },
  { subject: "Français", average: 13.2, previous: 13.5 },
  { subject: "Anglais", average: 14.1, previous: 13.8 },
  { subject: "Histoire", average: 11.8, previous: 12.2 },
  { subject: "SVT", average: 13.5, previous: 12.9 },
  { subject: "Physique", average: 11.2, previous: 11.5 },
];

const AnalyseTab = ({ onNext }: AnalyseTabProps) => {
  const classAverage = 12.8;
  const previousAverage = 12.5;
  const trend = classAverage > previousAverage ? "up" : classAverage < previousAverage ? "down" : "stable";

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
            <CardTitle className="text-4xl font-bold text-success">16/25</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">64% de la classe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Élèves en difficulté</CardDescription>
            <CardTitle className="text-4xl font-bold text-warning">3/25</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">12% de la classe</p>
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
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <span className="font-medium">🏆 MARTIN Clara</span>
              <span className="text-lg font-bold text-success">17.2</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <span className="font-medium">🥈 DUBOIS Thomas</span>
              <span className="text-lg font-bold text-success">16.8</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <span className="font-medium">🥉 BERNARD Sophie</span>
              <span className="text-lg font-bold text-success">16.5</span>
            </div>
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
