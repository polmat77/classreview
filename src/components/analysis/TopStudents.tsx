import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { EleveData } from "@/utils/csvParser";
import { getTopStudents } from "@/utils/statisticsCalculations";

interface TopStudentsProps {
  eleves: EleveData[];
}

const TopStudents = ({ eleves }: TopStudentsProps) => {
  const topStudents = getTopStudents(eleves, 3);

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top 3 élèves
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topStudents.map((eleve, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <span className="font-medium">{eleve.nom}</span>
              </div>
              <span className="text-lg font-bold text-success">
                {eleve.moyenneGenerale.toFixed(2)}
              </span>
            </div>
          ))}
          {topStudents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune donnée disponible.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopStudents;
