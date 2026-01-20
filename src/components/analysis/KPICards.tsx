import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, BarChart3, Users, Activity, CheckCircle } from "lucide-react";
import { EleveData } from "@/utils/csvParser";
import {
  calculateClassAverage,
  calculateMedian,
  calculateStdDev,
  calculateSuccessRate,
  getEvaluatedStudentsCount,
} from "@/utils/statisticsCalculations";

interface KPICardsProps {
  eleves: EleveData[];
  previousAverage?: number;
}

const KPICards = ({ eleves, previousAverage }: KPICardsProps) => {
  const classAverage = calculateClassAverage(eleves);
  const evaluatedCount = getEvaluatedStudentsCount(eleves);
  const median = calculateMedian(eleves);
  const stdDev = calculateStdDev(eleves);
  const successRate = calculateSuccessRate(eleves);
  
  const trend = previousAverage 
    ? classAverage > previousAverage ? "up" : classAverage < previousAverage ? "down" : "stable"
    : "stable";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Moyenne générale */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary-foreground/80 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Moyenne générale
          </CardDescription>
          <CardTitle className="text-4xl font-bold">
            {isNaN(classAverage) ? "—" : classAverage.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary-foreground/80 mb-1">
            Sur {evaluatedCount} élève{evaluatedCount > 1 ? 's' : ''} évalué{evaluatedCount > 1 ? 's' : ''}
          </p>
          {previousAverage && (
            <div className="flex items-center gap-2 text-sm">
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "stable" && <Minus className="h-4 w-4" />}
              <span>
                {trend === "up" && "+"}
                {(classAverage - previousAverage).toFixed(2)} vs trimestre précédent
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Médiane */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Médiane
          </CardDescription>
          <CardTitle className="text-4xl font-bold text-foreground">
            {isNaN(median) ? "—" : median.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            50% des élèves au-dessus
          </p>
        </CardContent>
      </Card>

      {/* Écart-type */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Écart-type
          </CardDescription>
          <CardTitle className="text-4xl font-bold text-foreground">
            {isNaN(stdDev) ? "—" : stdDev.toFixed(2)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${stdDev < 2.5 ? 'text-success' : stdDev < 4 ? 'text-warning' : 'text-destructive'}`}>
            {stdDev < 2.5 ? 'Classe homogène' : stdDev < 4 ? 'Hétérogénéité modérée' : 'Classe hétérogène'}
          </p>
        </CardContent>
      </Card>

      {/* Taux de réussite */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Taux de réussite
          </CardDescription>
          <CardTitle className={`text-4xl font-bold ${successRate >= 75 ? 'text-success' : successRate >= 50 ? 'text-warning' : 'text-destructive'}`}>
            {successRate}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Moyenne ≥ 10/20
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
