import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Star } from "lucide-react";
import { EleveData } from "@/utils/csvParser";
import {
  getStrugglingStudents,
  getAbsentStudents,
  getExcellentStudents,
  getWeakSubjects,
} from "@/utils/statisticsCalculations";

interface StudentsMonitoringProps {
  eleves: EleveData[];
}

const StudentsMonitoring = ({ eleves }: StudentsMonitoringProps) => {
  const strugglingStudents = getStrugglingStudents(eleves).slice(0, 5);
  const absentStudents = getAbsentStudents(eleves).slice(0, 5);
  const excellentStudents = getExcellentStudents(eleves).slice(0, 5);

  const hasData = strugglingStudents.length > 0 || absentStudents.length > 0 || excellentStudents.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Élèves à surveiller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Struggling students */}
        {strugglingStudents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive mb-3">
              <AlertCircle className="h-4 w-4" />
              En difficulté (moyenne &lt; 10)
            </h4>
            <div className="space-y-2">
              {strugglingStudents.map((student, index) => {
                const weakSubjects = getWeakSubjects(student);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border-l-4 border-destructive"
                  >
                    <span className="font-medium">{student.nom}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-destructive">
                        {student.moyenneGenerale.toFixed(2)}
                      </span>
                      {weakSubjects.length > 0 && (
                        <span className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {weakSubjects.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Absent students */}
        {absentStudents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-warning mb-3">
              <AlertTriangle className="h-4 w-4" />
              Données incomplètes
            </h4>
            <div className="space-y-2">
              {absentStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border-l-4 border-warning"
                >
                  <span className="font-medium">{student.nom}</span>
                  <span className="text-sm text-muted-foreground">
                    Évaluation incomplète
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excellent students */}
        {excellentStudents.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-success mb-3">
              <Star className="h-4 w-4" />
              Excellence (moyenne ≥ 16)
            </h4>
            <div className="space-y-2">
              {excellentStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-success/10 border-l-4 border-success"
                >
                  <span className="font-medium">{student.nom}</span>
                  <span className="text-lg font-bold text-success">
                    {student.moyenneGenerale.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsMonitoring;
