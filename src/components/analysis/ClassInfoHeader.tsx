import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, GraduationCap } from "lucide-react";

interface ClassInfoHeaderProps {
  className: string;
  period: string;
  studentCount: number;
  mainTeacher: string;
  onMainTeacherChange?: (value: string) => void;
}

const ClassInfoHeader = ({
  className,
  period,
  studentCount,
  mainTeacher,
  onMainTeacherChange,
}: ClassInfoHeaderProps) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-l-4 border-l-cyan-500">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-cyan-600" />
              Conseil de classe - {className || "Classe"} - {period || "Période"}
            </CardTitle>
            <CardDescription className="text-lg mt-1 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {studentCount} élèves
              </span>
              {period && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {period}
                </span>
              )}
            </CardDescription>
          </div>
          
          {/* Main teacher input */}
          <div className="flex items-center gap-2 min-w-[280px]">
            <Label htmlFor="mainTeacher" className="text-sm text-muted-foreground whitespace-nowrap">
              Professeur principal :
            </Label>
            {onMainTeacherChange ? (
              <Input
                id="mainTeacher"
                placeholder="M./Mme..."
                value={mainTeacher}
                onChange={(e) => onMainTeacherChange(e.target.value)}
                className="max-w-[200px] bg-white dark:bg-slate-800"
              />
            ) : (
              <span className="font-medium">{mainTeacher || "(non renseigné)"}</span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ClassInfoHeader;
