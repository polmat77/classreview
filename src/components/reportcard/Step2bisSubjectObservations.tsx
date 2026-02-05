import { useState, useMemo } from "react";
import { Student, ObservationParMatiere } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, BookOpen, Plus, X, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepResetButton from "./StepResetButton";
import { 
  MATIERES_DISPONIBLES, 
  COMPORTEMENTS_DISPONIBLES,
  detecterComportementsRecurrents,
  categoriserResultatsParMatiere
} from "@/utils/bulletinAnalysisUtils";

interface Step2bisSubjectObservationsProps {
  students: Student[];
  observationsParMatiere: Record<number, ObservationParMatiere[]>;
  onObservationsChange: (observations: Record<number, ObservationParMatiere[]>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onReset: () => void;
}

const Step2bisSubjectObservations = ({
  students,
  observationsParMatiere,
  onObservationsChange,
  onNext,
  onBack,
  onSkip,
  onReset,
}: Step2bisSubjectObservationsProps) => {
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<string>("");
  const [selectedComportement, setSelectedComportement] = useState<string>("");

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const studentObservations = useMemo(() => 
    selectedStudentId ? (observationsParMatiere[selectedStudentId] || []) : [],
    [observationsParMatiere, selectedStudentId]
  );

  const totalObservationsCount = useMemo(() => 
    Object.values(observationsParMatiere).reduce((sum, obs) => sum + obs.length, 0),
    [observationsParMatiere]
  );

  const studentsWithObservations = useMemo(() => 
    new Set(Object.keys(observationsParMatiere).map(Number).filter(id => 
      observationsParMatiere[id]?.length > 0
    )),
    [observationsParMatiere]
  );

  const getAverageBadgeClass = (average: number | null): string => {
    if (average === null) return "bg-muted text-muted-foreground";
    if (average < 10) return "bg-destructive/10 text-destructive border-destructive/30";
    if (average < 14) return "bg-warning/10 text-warning border-warning/30";
    return "bg-success/10 text-success border-success/30";
  };

  const handleAddObservation = () => {
    if (!selectedStudentId || !selectedMatiere || !selectedComportement) {
      toast({
        title: "Champs manquants",
        description: "Sélectionnez un élève, une matière et un comportement",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate
    const existingObs = studentObservations.find(
      obs => obs.matiere === selectedMatiere && obs.comportement === selectedComportement
    );

    if (existingObs) {
      toast({
        title: "Observation existante",
        description: "Cette observation existe déjà pour cet élève",
        variant: "destructive",
      });
      return;
    }

    const newObs: ObservationParMatiere = {
      matiere: selectedMatiere,
      comportement: selectedComportement,
    };

    const updatedStudentObs = [...studentObservations, newObs];
    onObservationsChange({
      ...observationsParMatiere,
      [selectedStudentId]: updatedStudentObs,
    });

    // Reset selections but keep student selected
    setSelectedMatiere("");
    setSelectedComportement("");

    toast({ title: "Observation ajoutée" });
  };

  const handleRemoveObservation = (index: number) => {
    if (!selectedStudentId) return;

    const updatedObs = studentObservations.filter((_, i) => i !== index);
    
    if (updatedObs.length === 0) {
      const { [selectedStudentId]: _, ...rest } = observationsParMatiere;
      onObservationsChange(rest);
    } else {
      onObservationsChange({
        ...observationsParMatiere,
        [selectedStudentId]: updatedObs,
      });
    }
  };

  const getComportementBadgeClass = (comportement: string) => {
    const config = COMPORTEMENTS_DISPONIBLES.find(c => c.value === comportement);
    if (config?.type === "positif") {
      return "bg-success/10 text-success border-success/30";
    }
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

  // Calculate recurring behaviors for selected student
  const comportementsRecurrents = useMemo(() => 
    detecterComportementsRecurrents(studentObservations),
    [studentObservations]
  );

  const { reussites, difficultes } = useMemo(() => 
    categoriserResultatsParMatiere(studentObservations),
    [studentObservations]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Observations par matière
          </h1>
          <p className="text-muted-foreground">
            Étape optionnelle • Précisez les comportements par matière pour une analyse plus fine
          </p>
        </div>
        {totalObservationsCount > 0 && (
          <StepResetButton 
            onReset={onReset}
            stepName="Observations par matière"
            description="Cette action effacera toutes les observations par matière saisies."
          />
        )}
      </div>

      {/* Info card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">À quoi sert cette étape ?</p>
              <p>
                Elle permet d'affiner l'analyse du bulletin en précisant dans quelles matières 
                les comportements sont observés. L'IA mentionnera explicitement ces matières 
                et détectera les comportements récurrents (apparaissant dans 2+ matières).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student list sidebar */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sélectionner un élève</CardTitle>
            <CardDescription>
              {totalObservationsCount} observation(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="px-4 pb-4 space-y-1">
                {students.map((student) => {
                  const hasObs = studentsWithObservations.has(student.id);
                  const isSelected = selectedStudentId === student.id;
                  const obsCount = observationsParMatiere[student.id]?.length || 0;
                  
                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(isSelected ? null : student.id)}
                      className={`flex items-center gap-2 py-1.5 px-2 text-sm rounded-md transition-colors cursor-pointer hover:bg-accent/50 ${
                        isSelected ? "bg-primary/10 ring-1 ring-primary" : ""
                      }`}
                    >
                      <Badge 
                        variant="outline" 
                        className={`w-8 justify-center shrink-0 ${getAverageBadgeClass(student.average)}`}
                      >
                        {student.id}
                      </Badge>
                      <span className="truncate flex-1">
                        {student.lastName} {student.firstName}
                      </span>
                      {hasObs && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {obsCount}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          {/* Add observation form */}
          <Card className={selectedStudentId ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {selectedStudent 
                      ? `${selectedStudent.lastName} ${selectedStudent.firstName}`
                      : "Sélectionnez un élève"
                    }
                  </CardTitle>
                  <CardDescription>
                    Ajouter une observation par matière
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {selectedStudentId && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Matière</label>
                    <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une matière..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MATIERES_DISPONIBLES.map((matiere) => (
                          <SelectItem key={matiere} value={matiere}>
                            {matiere}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comportement observé</label>
                    <Select value={selectedComportement} onValueChange={setSelectedComportement}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un comportement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPORTEMENTS_DISPONIBLES.map((comp) => (
                          <SelectItem key={comp.value} value={comp.value}>
                            <span className={comp.type === "positif" ? "text-success" : "text-destructive"}>
                              {comp.type === "positif" ? "✓" : "⚠"} {comp.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleAddObservation}
                  disabled={!selectedMatiere || !selectedComportement}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter cette observation
                </Button>

                {/* Student's observations list */}
                {studentObservations.length > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Observations pour {selectedStudent?.firstName} ({studentObservations.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {studentObservations.map((obs, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge 
                              variant="outline" 
                              className={getComportementBadgeClass(obs.comportement)}
                            >
                              {obs.comportement}
                            </Badge>
                            <span className="text-sm text-muted-foreground">en</span>
                            <span className="text-sm font-medium truncate">
                              {obs.matiere}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-7 w-7"
                            onClick={() => handleRemoveObservation(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Recurring behaviors detection */}
                    {comportementsRecurrents.length > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                          <Sparkles className="w-4 h-4" />
                          Comportements récurrents détectés
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                          {comportementsRecurrents.map((cr, idx) => (
                            <p key={idx}>
                              • <strong>{cr.comportement}</strong> en : {cr.matieres.join(", ")}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success/Difficulty summary */}
                    {(reussites.length > 0 || difficultes.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {reussites.length > 0 && (
                          <div className="p-2 bg-success/10 rounded-lg">
                            <p className="font-medium text-success mb-1">✅ Réussites</p>
                            <p className="text-xs text-muted-foreground">{reussites.join(", ")}</p>
                          </div>
                        )}
                        {difficultes.length > 0 && (
                          <div className="p-2 bg-destructive/10 rounded-lg">
                            <p className="font-medium text-destructive mb-1">⚠️ Difficultés</p>
                            <p className="text-xs text-muted-foreground">{difficultes.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* No student selected placeholder */}
          {!selectedStudentId && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Aucun élève sélectionné</p>
                <p className="text-sm">
                  Cliquez sur un élève dans la liste pour ajouter des observations par matière
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour étape 2
        </Button>
        
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onSkip}>
            Passer cette étape
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={onNext} disabled={totalObservationsCount === 0}>
            Continuer
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step2bisSubjectObservations;

