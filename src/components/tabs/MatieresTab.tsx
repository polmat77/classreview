import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";

interface MatieresTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
}

const MatieresTab = ({ onNext, data }: MatieresTabProps) => {
  const eleves = data?.bulletinsEleves || [];
  const bulletinClasse = data?.bulletinClasse;

  // Calculer les statistiques par matière
  const matieresStats = new Map<string, {
    nom: string;
    moyenneEleves: number[];
    moyenneClasse: number;
    appreciations: string[];
    pole: string;
  }>();

  eleves.forEach(eleve => {
    eleve.matieres.forEach(matiere => {
      const current = matieresStats.get(matiere.nom) || {
        nom: matiere.nom,
        moyenneEleves: [],
        moyenneClasse: matiere.moyenneClasse,
        appreciations: [],
        pole: matiere.pole
      };
      current.moyenneEleves.push(matiere.moyenneEleve);
      if (matiere.appreciation) {
        current.appreciations.push(matiere.appreciation);
      }
      matieresStats.set(matiere.nom, current);
    });
  });

  const subjects = Array.from(matieresStats.values()).map(stat => {
    const moyenne = stat.moyenneEleves.reduce((a, b) => a + b, 0) / stat.moyenneEleves.length;
    const sorted = [...stat.moyenneEleves].sort((a, b) => b - a);
    const meilleureNote = sorted[0] || 0;
    const needsHelp = stat.moyenneEleves.filter(m => m < 10).length;
    
    // Prendre l'appréciation du bulletin de classe si disponible
    const appreciationClasse = bulletinClasse?.matieres.find(m => m.nom === stat.nom)?.appreciation || '';
    
    // Trouver le meilleur élève pour cette matière
    let meilleureEleveNom = '';
    if (eleves.length > 0) {
      const elevesAvecNotes = eleves
        .map(e => {
          const matEleve = e.matieres.find(m => m.nom === stat.nom);
          return matEleve ? { nom: `${e.prenom} ${e.nom}`, note: matEleve.moyenneEleve } : null;
        })
        .filter((e): e is { nom: string; note: number } => e !== null)
        .sort((a, b) => b.note - a.note);
      
      if (elevesAvecNotes.length > 0) {
        meilleureEleveNom = `${elevesAvecNotes[0].nom} (${elevesAvecNotes[0].note.toFixed(2)}/20)`;
      }
    }
    
    return {
      name: stat.nom,
      average: moyenne,
      trend: moyenne - stat.moyenneClasse,
      top: meilleureEleveNom || `${meilleureNote.toFixed(2)}/20`,
      needsHelp,
      comments: appreciationClasse || stat.appreciations[0] || 'Pas d\'appréciation disponible',
      color: moyenne >= 14 ? "success" : moyenne >= 12 ? "accent" : moyenne >= 10 ? "warning" : "destructive",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analyse par matière</h2>
        <p className="text-muted-foreground">Détail des performances dans chaque discipline</p>
      </div>

      <div className="grid gap-4">
        {subjects.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune donnée disponible. Veuillez charger des bulletins élèves dans l'onglet Import.
            </CardContent>
          </Card>
        )}
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
