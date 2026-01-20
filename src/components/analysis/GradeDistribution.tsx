import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { EleveData } from "@/utils/csvParser";

interface GradeDistributionProps {
  eleves: EleveData[];
}

interface GradeRange {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  emoji: string;
}

const gradeRanges: GradeRange[] = [
  { label: "Excellent", min: 16, max: 20, color: "text-emerald-700", bgColor: "bg-emerald-100", emoji: "🏆" },
  { label: "Très bien", min: 14, max: 16, color: "text-green-700", bgColor: "bg-green-100", emoji: "✨" },
  { label: "Bien", min: 12, max: 14, color: "text-blue-700", bgColor: "bg-blue-100", emoji: "👍" },
  { label: "Moyen", min: 10, max: 12, color: "text-amber-700", bgColor: "bg-amber-100", emoji: "📊" },
  { label: "Insuffisant", min: 8, max: 10, color: "text-orange-700", bgColor: "bg-orange-100", emoji: "⚠️" },
  { label: "Inquiétant", min: 0, max: 8, color: "text-red-700", bgColor: "bg-red-100", emoji: "🚨" },
];

const GradeDistribution = ({ eleves }: GradeDistributionProps) => {
  const validEleves = eleves.filter(e => !isNaN(e.moyenneGenerale) && e.moyenneGenerale !== null);
  const totalValid = validEleves.length;

  const getCount = (min: number, max: number): number => {
    if (min === 0) {
      return validEleves.filter(e => e.moyenneGenerale < max).length;
    }
    if (max === 20) {
      return validEleves.filter(e => e.moyenneGenerale >= min).length;
    }
    return validEleves.filter(e => e.moyenneGenerale >= min && e.moyenneGenerale < max).length;
  };

  const getPercentage = (count: number): number => {
    if (totalValid === 0) return 0;
    return Math.round((count / totalValid) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Répartition par tranche de moyenne
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gradeRanges.map((range) => {
            const count = getCount(range.min, range.max);
            const percentage = getPercentage(count);
            const rangeLabel = range.min === 0 
              ? `< ${range.max}` 
              : range.max === 20 
                ? `≥ ${range.min}` 
                : `${range.min} - ${range.max}`;
            
            return (
              <div
                key={range.label}
                className={`flex items-center justify-between p-3 rounded-lg ${range.bgColor} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{range.emoji}</span>
                  <div>
                    <p className={`font-semibold ${range.color}`}>{range.label}</p>
                    <p className="text-xs text-muted-foreground">({rangeLabel})</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${range.color}`}>{count}</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary bar */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Répartition visuelle</span>
            <span>{totalValid} élève{totalValid > 1 ? 's' : ''} évalué{totalValid > 1 ? 's' : ''}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden flex">
            {gradeRanges.map((range) => {
              const count = getCount(range.min, range.max);
              const percentage = getPercentage(count);
              if (percentage === 0) return null;
              
              const bgColors: Record<string, string> = {
                "Excellent": "bg-emerald-500",
                "Très bien": "bg-green-500",
                "Bien": "bg-blue-500",
                "Moyen": "bg-amber-500",
                "Insuffisant": "bg-orange-500",
                "Inquiétant": "bg-red-500",
              };
              
              return (
                <div
                  key={range.label}
                  className={`${bgColors[range.label]} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${range.label}: ${count} (${percentage}%)`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeDistribution;
