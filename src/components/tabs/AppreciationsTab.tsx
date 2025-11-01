import { useState } from "react";
import { Sparkles, User, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AppreciationsTabProps {
  onNext: () => void;
}

const generalAppreciation = `Trimestre satisfaisant dans l'ensemble. La classe montre une bonne dynamique de travail avec une moyenne générale en progression (+0.3 points). Les résultats sont particulièrement encourageants en anglais et SVT. Toutefois, un accompagnement renforcé est nécessaire en physique-chimie.`;

const studentAppreciations = [
  {
    name: "MARTIN Clara",
    average: 17.2,
    text: "Excellent trimestre ! Clara maintient un niveau remarquable dans toutes les matières, avec une participation active et des travaux de grande qualité. Son sérieux et sa rigueur sont exemplaires. Continue ainsi, tu es sur la bonne voie pour réussir brillamment ton orientation.",
    status: "excellent",
  },
  {
    name: "DUBOIS Thomas",
    average: 16.8,
    text: "Très bon trimestre. Thomas s'investit pleinement dans son travail et obtient d'excellents résultats, particulièrement en français et physique. Sa curiosité intellectuelle est un atout majeur. Garde cette motivation pour la suite de l'année.",
    status: "excellent",
  },
  {
    name: "BERNARD Sophie",
    average: 16.5,
    text: "Trimestre très satisfaisant. Sophie progresse constamment grâce à sa persévérance et son organisation exemplaire. Ses résultats en anglais sont remarquables. Continue sur cette lancée, tes efforts portent leurs fruits !",
    status: "excellent",
  },
  {
    name: "PETIT Lucas",
    average: 14.3,
    text: "Bon trimestre. Lucas montre de belles capacités, notamment en sciences où il excelle. Quelques efforts supplémentaires en méthodologie lui permettraient de progresser encore. Pense à soigner davantage la présentation de tes devoirs.",
    status: "good",
  },
  {
    name: "MOREAU Emma",
    average: 11.8,
    text: "Trimestre en demi-teinte. Emma possède du potentiel mais manque de régularité dans son travail. Il est impératif de fournir un effort constant pour progresser, notamment en mathématiques. Une meilleure organisation et plus de sérieux sont attendus au prochain trimestre.",
    status: "needs-improvement",
  },
];

const AppreciationsTab = ({ onNext }: AppreciationsTabProps) => {
  const [generalText, setGeneralText] = useState(generalAppreciation);
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [studentTexts, setStudentTexts] = useState(
    studentAppreciations.map((s) => s.text)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Appréciations</h2>
        <p className="text-muted-foreground">Générale et individuelles pour chaque élève</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Appréciation générale</TabsTrigger>
          <TabsTrigger value="students">Appréciations individuelles</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Appréciation générale de la classe</CardTitle>
                  <CardDescription>Synthèse du trimestre (max 255 caractères)</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Régénérer avec IA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  value={generalText}
                  onChange={(e) => setGeneralText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={255}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {generalText.length}/255 caractères
                  </span>
                  <Badge variant={generalText.length > 240 ? "destructive" : "secondary"}>
                    {255 - generalText.length} restants
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4">
            {studentAppreciations.map((student, index) => (
              <Card key={index} className="hover:shadow-md transition-smooth">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{student.name}</CardTitle>
                        <CardDescription>Moyenne: {student.average}/20</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.status === "excellent" && (
                        <Badge className="bg-success text-success-foreground">Excellent</Badge>
                      )}
                      {student.status === "good" && (
                        <Badge className="bg-accent text-accent-foreground">Bien</Badge>
                      )}
                      {student.status === "needs-improvement" && (
                        <Badge className="bg-warning text-warning-foreground">À améliorer</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditingStudent(editingStudent === index ? null : index)
                        }
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingStudent === index ? (
                    <div className="space-y-3">
                      <Textarea
                        value={studentTexts[index]}
                        onChange={(e) => {
                          const newTexts = [...studentTexts];
                          newTexts[index] = e.target.value;
                          setStudentTexts(newTexts);
                        }}
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {studentTexts[index].length}/500 caractères
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStudent(null)}
                          >
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setEditingStudent(null)}
                          >
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground">
                      {studentTexts[index]}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">IA disponible</p>
            <p className="text-xs text-muted-foreground">
              Régénérez automatiquement les appréciations avec des suggestions personnalisées
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Régénérer tout
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Préparer l'export PDF
        </Button>
      </div>
    </div>
  );
};

export default AppreciationsTab;
