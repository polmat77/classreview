import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, BarChart3 } from "lucide-react";
import { Student, ClassMetadata } from "@/types/reportcard";
import { useToast } from "@/hooks/use-toast";

interface SubjectData {
  name: string;
  average: number;
}

interface ClassSyntheticSummaryProps {
  students: Student[];
  metadata: ClassMetadata | null;
  subjects?: SubjectData[];
  absenceData?: {
    totalHalfDays: number;
    totalLateArrivals: number;
    worstStudent?: { name: string; absences: number };
  };
}

interface GradeRange {
  label: string;
  min: number;
  max: number;
  count: number;
}

const ClassSyntheticSummary = ({
  students,
  metadata,
  subjects = [],
  absenceData,
}: ClassSyntheticSummaryProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const validStudents = students.filter(s => s.average !== null && !isNaN(s.average));
    const totalEvaluated = validStudents.length;
    
    if (totalEvaluated === 0) {
      return null;
    }

    // Average
    const sum = validStudents.reduce((acc, s) => acc + (s.average || 0), 0);
    const average = sum / totalEvaluated;

    // Standard deviation
    const variance = validStudents.reduce((acc, s) => {
      const diff = (s.average || 0) - average;
      return acc + diff * diff;
    }, 0) / totalEvaluated;
    const stdDev = Math.sqrt(variance);

    // Grade distribution with new ranges (NO median)
    const ranges: GradeRange[] = [
      { label: "< 8", min: 0, max: 8, count: 0 },
      { label: "8-10", min: 8, max: 10, count: 0 },
      { label: "10-12", min: 10, max: 12, count: 0 },
      { label: "12-14", min: 12, max: 14, count: 0 },
      { label: "14-16", min: 14, max: 16, count: 0 },
      { label: "≥ 16", min: 16, max: 20.01, count: 0 },
    ];

    validStudents.forEach(s => {
      const avg = s.average || 0;
      for (const range of ranges) {
        if (avg >= range.min && avg < range.max) {
          range.count++;
          break;
        }
      }
    });

    return {
      average,
      stdDev,
      totalEvaluated,
      ranges: ranges.filter(r => r.count > 0), // Only non-empty ranges
    };
  }, [students]);

  // Identify top and weak subjects
  const subjectAnalysis = useMemo(() => {
    if (subjects.length === 0) return null;

    const sorted = [...subjects].sort((a, b) => b.average - a.average);
    const top = sorted.slice(0, 2).filter(s => s.average >= 12);
    const weak = sorted.slice(-2).filter(s => s.average < 10).reverse();

    return { top, weak };
  }, [subjects]);

  // Qualify homogeneity based on standard deviation
  const getHomogeneityLabel = (stdDev: number): string => {
    if (stdDev < 2) return "homogène";
    if (stdDev < 3) return "relativement homogène";
    if (stdDev < 4) return "hétérogène";
    return "très hétérogène";
  };

  // Generate the synthetic summary text
  const generateSummaryText = (): string => {
    if (!stats) return "Données insuffisantes pour générer un bilan.";

    const parts: string[] = [];

    // 1. Class name, average, and student count
    const className = metadata?.className || "La classe";
    parts.push(
      `${className} affiche une moyenne générale de ${stats.average.toFixed(2)}/20 avec ${stats.totalEvaluated} élève${stats.totalEvaluated > 1 ? "s" : ""} évalué${stats.totalEvaluated > 1 ? "s" : ""}.`
    );

    // 2. Grade distribution (only non-empty ranges)
    if (stats.ranges.length > 0) {
      const distributionParts: string[] = [];
      
      stats.ranges.forEach(range => {
        if (range.label === "< 8") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} en grande difficulté (moins de 8)`);
        } else if (range.label === "8-10") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} entre 8 et 10`);
        } else if (range.label === "10-12") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} entre 10 et 12`);
        } else if (range.label === "12-14") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} entre 12 et 14`);
        } else if (range.label === "14-16") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} entre 14 et 16`);
        } else if (range.label === "≥ 16") {
          distributionParts.push(`${range.count} élève${range.count > 1 ? "s" : ""} au-dessus de 16`);
        }
      });

      if (distributionParts.length > 0) {
        parts.push(`La répartition est la suivante : ${distributionParts.join(", ")}.`);
      }
    }

    // 3. Homogeneity qualification
    const homogeneityLabel = getHomogeneityLabel(stats.stdDev);
    parts.push(`La classe est ${homogeneityLabel} avec un écart-type de ${stats.stdDev.toFixed(2)}.`);

    // 4. Subject analysis (strengths and weaknesses)
    if (subjectAnalysis) {
      const subjectParts: string[] = [];

      if (subjectAnalysis.top.length > 0) {
        const topNames = subjectAnalysis.top.map(s => `${s.name} (${s.average.toFixed(2)})`).join(" et ");
        subjectParts.push(`${topNames} ${subjectAnalysis.top.length > 1 ? "sont les points forts" : "est le point fort"}`);
      }

      if (subjectAnalysis.weak.length > 0) {
        const weakNames = subjectAnalysis.weak.map(s => `${s.name} (${s.average.toFixed(2)})`).join(" et ");
        subjectParts.push(`${weakNames} ${subjectAnalysis.weak.length > 1 ? "nécessitent" : "nécessite"} un renforcement`);
      }

      if (subjectParts.length > 0) {
        parts.push(subjectParts.join(", tandis que ") + ".");
      }
    }

    // 5. Absence data if concerning
    if (absenceData && (absenceData.totalHalfDays > 50 || absenceData.totalLateArrivals > 10)) {
      let absencePart = "L'assiduité est préoccupante avec ";
      const absenceParts: string[] = [];

      if (absenceData.totalHalfDays > 0) {
        absenceParts.push(`${absenceData.totalHalfDays} demi-journées d'absence`);
      }

      if (absenceData.worstStudent && absenceData.worstStudent.absences > 20) {
        absenceParts.push(`dont ${absenceData.worstStudent.absences} demi-journées pour un élève`);
      }

      if (absenceData.totalLateArrivals > 0) {
        absenceParts.push(`${absenceData.totalLateArrivals} retards cumulés`);
      }

      if (absenceParts.length > 0) {
        parts.push(absencePart + absenceParts.join(" et ") + ".");
      }
    }

    return parts.join(" ");
  };

  const summaryText = generateSummaryText();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Bilan synthétique copié !" });
  };

  if (!stats) {
    return (
      <Card className="border-[#f0a830]/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          Importez des données d'élèves pour générer le bilan synthétique.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#f0a830]/40 bg-gradient-to-br from-white to-[#7dd3e8]/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7dd3e8]" />
            <CardTitle className="text-lg text-[#1a2332]">Bilan synthétique</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-[#2c3e50] text-white hover:bg-[#2c3e50]/90 transition-colors shadow-sm"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-[#7dd3e8]/10 text-[#1a2332] border-[#7dd3e8]/30 px-3 py-1">
            Moyenne : {stats.average.toFixed(2)}/20
          </Badge>
          <Badge variant="outline" className="bg-white text-[#1a2332] border-slate-200 px-3 py-1">
            {stats.totalEvaluated} élève{stats.totalEvaluated > 1 ? "s" : ""}
          </Badge>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${
              stats.stdDev < 2.5 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : stats.stdDev < 4 
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            Écart-type : {stats.stdDev.toFixed(2)}
          </Badge>
        </div>

        {/* Summary text */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[#1a2332] leading-relaxed text-sm">
            {summaryText}
          </p>
        </div>

        {/* Grade distribution visual */}
        <div className="grid grid-cols-6 gap-1">
          {[
            { label: "< 8", color: "bg-red-500" },
            { label: "8-10", color: "bg-orange-500" },
            { label: "10-12", color: "bg-amber-500" },
            { label: "12-14", color: "bg-blue-500" },
            { label: "14-16", color: "bg-green-500" },
            { label: "≥ 16", color: "bg-emerald-500" },
          ].map((range, index) => {
            const rangeData = stats.ranges.find(r => r.label === range.label);
            const count = rangeData?.count || 0;
            const percentage = stats.totalEvaluated > 0 ? (count / stats.totalEvaluated) * 100 : 0;
            
            return (
              <div key={index} className="text-center">
                <div 
                  className={`${range.color} rounded-t-sm transition-all`} 
                  style={{ height: `${Math.max(percentage * 2, 4)}px` }}
                />
                <div className="text-[10px] text-muted-foreground mt-1">{range.label}</div>
                <div className="text-xs font-medium text-[#1a2332]">{count}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSyntheticSummary;
