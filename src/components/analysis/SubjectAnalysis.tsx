import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { ClasseDataCSV } from "@/utils/csvParser";
import { getSubjectAverages, getStrongSubjects, getWeakSubjectsClass } from "@/utils/statisticsCalculations";

interface SubjectAnalysisProps {
  classeCSV: ClasseDataCSV;
}

const SubjectAnalysis = ({ classeCSV }: SubjectAnalysisProps) => {
  const subjects = getSubjectAverages(classeCSV);
  const strongSubjects = getStrongSubjects(subjects);
  const weakSubjects = getWeakSubjectsClass(subjects);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Analyse par matière
        </CardTitle>
        <CardDescription>
          Points forts et matières à renforcer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Strong subjects */}
          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <h4 className="flex items-center gap-2 font-semibold text-success mb-3">
              <TrendingUp className="h-4 w-4" />
              Points forts (moyenne ≥ 14)
            </h4>
            {strongSubjects.length > 0 ? (
              <ul className="space-y-2">
                {strongSubjects.slice(0, 5).map((subject, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between text-sm py-1 border-b border-success/10 last:border-0"
                  >
                    <span className="truncate max-w-[150px]">{subject.name}</span>
                    <span className="font-bold text-success">{subject.currentAvg.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune matière avec moyenne ≥ 14
              </p>
            )}
          </div>

          {/* Weak subjects */}
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <h4 className="flex items-center gap-2 font-semibold text-warning mb-3">
              <TrendingDown className="h-4 w-4" />
              À renforcer (moyenne &lt; 12)
            </h4>
            {weakSubjects.length > 0 ? (
              <ul className="space-y-2">
                {weakSubjects.slice(0, 5).map((subject, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between text-sm py-1 border-b border-warning/10 last:border-0"
                  >
                    <span className="truncate max-w-[150px]">{subject.name}</span>
                    <span className="font-bold text-warning">{subject.currentAvg.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune matière avec moyenne &lt; 12
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectAnalysis;
