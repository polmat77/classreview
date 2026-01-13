import { useState } from "react";
import { Sparkles, User, Edit2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";

interface StudentData {
  name: string;
  average: number;
  subjects?: { name: string; grade: number; classAverage?: number }[];
  status: "excellent" | "good" | "needs-improvement";
}

interface AppreciationsTabProps {
  onNext: () => void;
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
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

const AppreciationsTab = ({ onNext, data }: AppreciationsTabProps) => {
  const { toast } = useToast();
  
  // Build students list from data
  const buildStudentsList = (): StudentData[] => {
    if (data?.classeCSV?.eleves) {
      return data.classeCSV.eleves.map(eleve => {
        const average = eleve.moyenneGenerale;
        let status: "excellent" | "good" | "needs-improvement" = "good";
        if (average >= 16) status = "excellent";
        else if (average < 12) status = "needs-improvement";
        
        // Convert moyennesParMatiere Record to array of subjects
        const subjects = Object.entries(eleve.moyennesParMatiere).map(([matiere, note]) => ({
          name: matiere,
          grade: note,
          classAverage: undefined // Not available in this format
        }));
        
        return {
          name: eleve.nom,
          average,
          subjects,
          status,
        };
      });
    }
    
    if (data?.bulletinsEleves) {
      return data.bulletinsEleves.map(eleve => {
        // Calculate average from subjects
        const totalMoyenne = eleve.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0);
        const average = eleve.matieres.length > 0 ? totalMoyenne / eleve.matieres.length : 0;
        let status: "excellent" | "good" | "needs-improvement" = "good";
        if (average >= 16) status = "excellent";
        else if (average < 12) status = "needs-improvement";
        
        return {
          name: `${eleve.nom} ${eleve.prenom}`,
          average,
          subjects: eleve.matieres.map(m => ({ 
            name: m.nom, 
            grade: m.moyenneEleve,
            classAverage: m.moyenneClasse
          })),
          status,
        };
      });
    }
    
    // Fallback sample data
    return [
      { name: "MARTIN Clara", average: 17.2, status: "excellent" },
      { name: "DUBOIS Thomas", average: 16.8, status: "excellent" },
      { name: "BERNARD Sophie", average: 16.5, status: "excellent" },
      { name: "PETIT Lucas", average: 14.3, status: "good" },
      { name: "MOREAU Emma", average: 11.8, status: "needs-improvement" },
    ];
  };

  const students = buildStudentsList();
  
  const [generalText, setGeneralText] = useState("");
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [studentTexts, setStudentTexts] = useState<string[]>(students.map(() => ""));
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [loadingStudentIndex, setLoadingStudentIndex] = useState<number | null>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const generateAppreciation = async (type: 'general' | 'individual', student?: StudentData): Promise<string> => {
    const classData = data?.classeCSV ? {
      className: "3ème",
      trimester: "1er trimestre",
      averageClass: data.classeCSV.statistiques.moyenneClasse,
      subjects: data.classeCSV.matieres.map(m => ({ name: m, average: 0 })), // matieres is string[]
    } : data?.bulletinClasse ? {
      className: data.bulletinClasse.classe || "3ème",
      trimester: data.bulletinClasse.trimestre || "1er trimestre",
      averageClass: data.bulletinClasse.matieres.reduce((sum, m) => sum + m.moyenne, 0) / (data.bulletinClasse.matieres.length || 1),
      subjects: data.bulletinClasse.matieres.map(m => ({ name: m.nom, average: m.moyenne })),
    } : undefined;

    const { data: result, error } = await supabase.functions.invoke('generate-appreciation', {
      body: { type, classData, student },
    });

    if (error) throw error;
    return result.appreciation;
  };

  const handleRegenerateGeneral = async () => {
    setIsLoadingGeneral(true);
    try {
      const appreciation = await generateAppreciation('general');
      setGeneralText(appreciation);
      toast({ title: "Appréciation générée", description: "L'appréciation générale a été générée avec succès." });
    } catch (error) {
      console.error('Error generating general appreciation:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
    } finally {
      setIsLoadingGeneral(false);
    }
  };

  const handleRegenerateStudent = async (index: number) => {
    setLoadingStudentIndex(index);
    try {
      const student = students[index];
      const appreciation = await generateAppreciation('individual', student);
      const newTexts = [...studentTexts];
      newTexts[index] = appreciation;
      setStudentTexts(newTexts);
      toast({ title: "Appréciation générée", description: `L'appréciation de ${student.name} a été générée.` });
    } catch (error) {
      console.error('Error generating student appreciation:', error);
      toast({ title: "Erreur", description: "Impossible de générer l'appréciation.", variant: "destructive" });
    } finally {
      setLoadingStudentIndex(null);
    }
  };

  const handleRegenerateAll = async () => {
    setIsLoadingAll(true);
    try {
      // Generate general appreciation
      const generalAppreciation = await generateAppreciation('general');
      setGeneralText(generalAppreciation);

      // Generate all student appreciations
      const newTexts = [...studentTexts];
      for (let i = 0; i < students.length; i++) {
        const appreciation = await generateAppreciation('individual', students[i]);
        newTexts[i] = appreciation;
        setStudentTexts([...newTexts]);
      }
      
      toast({ title: "Toutes les appréciations générées", description: "Les appréciations ont été générées avec succès." });
    } catch (error) {
      console.error('Error generating all appreciations:', error);
      toast({ title: "Erreur", description: "Impossible de générer toutes les appréciations.", variant: "destructive" });
    } finally {
      setIsLoadingAll(false);
    }
  };

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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleRegenerateGeneral}
                  disabled={isLoadingGeneral || isLoadingAll}
                >
                  {isLoadingGeneral ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
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
            {students.map((student, index) => (
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
                        onClick={() => handleRegenerateStudent(index)}
                        disabled={loadingStudentIndex === index || isLoadingAll}
                      >
                        {loadingStudentIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
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
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleRegenerateAll}
          disabled={isLoadingAll}
        >
          {isLoadingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
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
