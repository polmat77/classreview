import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatieresTabProps {
  onNext: () => void;
}

const subjects = [
  {
    name: "Mathématiques",
    average: 12.5,
    trend: 0.7,
    top: "MARTIN Clara (18/20)",
    needsHelp: 3,
    comments: "Bonne participation générale. Les notions d'algèbre sont bien comprises.",
    color: "primary",
  },
  {
    name: "Français",
    average: 13.2,
    trend: -0.3,
    top: "DUBOIS Thomas (17.5/20)",
    needsHelp: 2,
    comments: "Excellentes rédactions. Continuer les efforts en grammaire.",
    color: "accent",
  },
  {
    name: "Anglais",
    average: 14.1,
    trend: 0.3,
    top: "BERNARD Sophie (18.5/20)",
    needsHelp: 1,
    comments: "Très bonne participation à l'oral. Progrès notables en expression écrite.",
    color: "success",
  },
  {
    name: "Histoire-Géographie",
    average: 11.8,
    trend: -0.4,
    top: "MARTIN Clara (16.5/20)",
    needsHelp: 4,
    comments: "Méthodologie à renforcer. Les connaissances sont présentes mais mal structurées.",
    color: "warning",
  },
  {
    name: "Sciences (SVT)",
    average: 13.5,
    trend: 0.6,
    top: "PETIT Lucas (17/20)",
    needsHelp: 2,
    comments: "Classe motivée et curieuse. Bon investissement dans les expériences.",
    color: "success",
  },
  {
    name: "Physique-Chimie",
    average: 11.2,
    trend: -0.3,
    top: "DUBOIS Thomas (16/20)",
    needsHelp: 5,
    comments: "Difficultés en résolution de problèmes. Prévoir des séances de soutien.",
    color: "warning",
  },
];

const MatieresTab = ({ onNext }: MatieresTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analyse par matière</h2>
        <p className="text-muted-foreground">Détail des performances dans chaque discipline</p>
      </div>

      <div className="grid gap-4">
        {subjects.map((subject, index) => (
          <Card key={index} className="hover:shadow-md transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription className="mt-1">{subject.comments}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-3xl font-bold text-${subject.color}`}>
                    {subject.average.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    {subject.trend > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          +{subject.trend.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">
                          {subject.trend.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Meilleur·e:</span>
                  <span className="text-sm font-medium">{subject.top}</span>
                </div>
                {subject.needsHelp > 0 && (
                  <Badge variant="outline" className="border-warning text-warning">
                    {subject.needsHelp} élève{subject.needsHelp > 1 ? "s" : ""} à accompagner
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Recommandations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-sm font-medium">Physique-Chimie</p>
              <p className="text-sm text-muted-foreground">
                Prévoir des séances de soutien en résolution de problèmes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <span className="text-lg">📚</span>
            <div>
              <p className="text-sm font-medium">Histoire-Géographie</p>
              <p className="text-sm text-muted-foreground">
                Renforcer la méthodologie de l'argumentation
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-sm font-medium">Anglais</p>
              <p className="text-sm text-muted-foreground">
                Excellent niveau général, continuer les encouragements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Générer les appréciations
        </Button>
      </div>
    </div>
  );
};

export default MatieresTab;
