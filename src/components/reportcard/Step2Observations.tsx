import { useState } from "react";
import { Student, StudentObservations, SpecificObservation } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle, MessageCircle, Lightbulb, CheckCircle2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step2ObservationsProps {
  students: Student[];
  observations: StudentObservations;
  onObservationsChange: (observations: StudentObservations) => void;
  onNext: () => void;
  onBack: () => void;
}

const QUICK_OBSERVATIONS = [
  "fait des efforts",
  "très passif",
  "souvent en retard",
  "excellente progression",
  "manque de travail personnel",
  "très investi à l'oral",
  "distrait",
  "travail irrégulier",
];

const BEHAVIOR_SUGGESTIONS = [
  "bavardages récurrents",
  "insolence envers les adultes",
  "utilisation du téléphone",
  "perturbateur",
  "manque de respect",
  "agitation permanente",
  "refuse de travailler",
  "attitude passive-agressive",
];

const Step2Observations = ({
  students,
  observations,
  onObservationsChange,
  onNext,
  onBack,
}: Step2ObservationsProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  // State for clickable chips
  const [selectedBehaviorIds, setSelectedBehaviorIds] = useState<number[]>(
    observations.behavior?.studentIds || []
  );
  const [behaviorDesc, setBehaviorDesc] = useState(
    observations.behavior?.description || ""
  );
  const [behaviorIndividualNotes, setBehaviorIndividualNotes] = useState<Record<number, string>>(
    observations.behavior?.individualNotes || {}
  );
  const [selectedTalkativeIds, setSelectedTalkativeIds] = useState<number[]>(
    observations.talkative?.studentIds || []
  );
  const [specificList, setSpecificList] = useState<SpecificObservation[]>(
    observations.specific || []
  );
  const [selectedSpecificId, setSelectedSpecificId] = useState<number | null>(null);
  const [newSpecificObs, setNewSpecificObs] = useState("");

  const toggleStudentSelection = (
    studentId: number,
    selectedIds: number[],
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (selectedIds.includes(studentId)) {
      setSelectedIds(selectedIds.filter(id => id !== studentId));
      // Also remove individual note if deselecting from behavior
      if (setSelectedIds === setSelectedBehaviorIds) {
        setBehaviorIndividualNotes((prev) => {
          const updated = { ...prev };
          delete updated[studentId];
          return updated;
        });
      }
    } else {
      setSelectedIds([...selectedIds, studentId]);
    }
  };

  const handleIndividualNoteChange = (studentId: number, note: string) => {
    setBehaviorIndividualNotes((prev) => ({
      ...prev,
      [studentId]: note,
    }));
  };

  const addBehaviorSuggestion = (studentId: number, suggestion: string) => {
    setBehaviorIndividualNotes((prev) => {
      const current = prev[studentId] || "";
      const newNote = current ? `${current}, ${suggestion}` : suggestion;
      return { ...prev, [studentId]: newNote };
    });
  };

  const getStudentName = (id: number): string => {
    const student = students.find((s) => s.id === id);
    return student ? `${student.lastName} ${student.firstName}` : `Élève ${id}`;
  };

  const getAverageBadgeClass = (average: number | null): string => {
    if (average === null) return "bg-muted text-muted-foreground";
    if (average < 10) return "bg-destructive/10 text-destructive border-destructive/30";
    if (average < 14) return "bg-warning/10 text-warning border-warning/30";
    return "bg-success/10 text-success border-success/30";
  };

  const handleBehaviorSubmit = (hasIssues: boolean) => {
    if (hasIssues && selectedBehaviorIds.length === 0) {
      toast({
        title: "Aucun élève sélectionné",
        description: "Cliquez sur les élèves concernés ou appuyez sur 'Aucun problème'",
        variant: "destructive",
      });
      return;
    }
    onObservationsChange({
      ...observations,
      behavior: hasIssues 
        ? { 
            studentIds: selectedBehaviorIds, 
            description: behaviorDesc,
            individualNotes: behaviorIndividualNotes 
          }
        : { studentIds: [], description: "", individualNotes: {} },
    });
    setCurrentQuestion(2);
  };

  const handleTalkativeSubmit = (hasTalkative: boolean) => {
    if (hasTalkative && selectedTalkativeIds.length === 0) {
      toast({
        title: "Aucun élève sélectionné",
        description: "Cliquez sur les élèves concernés ou appuyez sur 'Aucun bavard'",
        variant: "destructive",
      });
      return;
    }
    onObservationsChange({
      ...observations,
      talkative: hasTalkative 
        ? { studentIds: selectedTalkativeIds }
        : { studentIds: [] },
    });
    setCurrentQuestion(3);
  };

  const handleAddSpecific = (observation?: string) => {
    if (selectedSpecificId === null) {
      toast({
        title: "Aucun élève sélectionné",
        description: "Cliquez sur un élève dans la liste pour ajouter une observation",
        variant: "destructive",
      });
      return;
    }
    
    const obsText = observation || newSpecificObs.trim();
    if (!obsText) {
      toast({
        title: "Observation manquante",
        description: "Entrez une observation ou cliquez sur une suggestion",
        variant: "destructive",
      });
      return;
    }

    // Check if student already has this observation
    const existingIndex = specificList.findIndex(
      obs => obs.studentId === selectedSpecificId && obs.observation === obsText
    );
    
    if (existingIndex === -1) {
      setSpecificList([...specificList, { studentId: selectedSpecificId, observation: obsText }]);
    }
    
    setSelectedSpecificId(null);
    setNewSpecificObs("");
  };

  const handleRemoveSpecific = (index: number) => {
    setSpecificList(specificList.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    onObservationsChange({
      ...observations,
      specific: specificList,
    });
    onNext();
  };

  // Get students that already have specific observations
  const studentsWithObservations = new Set(specificList.map(obs => obs.studentId));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Observations sur les élèves
        </h1>
        <p className="text-muted-foreground">
          Question {currentQuestion} sur 3 • Cliquez sur les élèves concernés
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student reference sidebar */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Liste des élèves</CardTitle>
            <CardDescription>
              {currentQuestion === 3 
                ? "Cliquez pour sélectionner" 
                : "Référence"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="px-4 pb-4 space-y-1">
                {students.map((student) => {
                  const hasObs = studentsWithObservations.has(student.id);
                  const isSelected = selectedSpecificId === student.id;
                  
                  return (
                    <div
                      key={student.id}
                      onClick={() => currentQuestion === 3 && setSelectedSpecificId(isSelected ? null : student.id)}
                      className={`flex items-center gap-2 py-1.5 px-2 text-sm rounded-md transition-colors ${
                        currentQuestion === 3 ? "cursor-pointer hover:bg-accent/50" : ""
                      } ${isSelected ? "bg-primary/10 ring-1 ring-primary" : ""}`}
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
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Question cards */}
        <div className="md:col-span-2 space-y-4">
          {/* Question 1: Behavior */}
          <Card className={currentQuestion === 1 ? "ring-2 ring-primary" : "opacity-60"}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg">Problèmes de comportement</CardTitle>
                  <CardDescription>
                    Y a-t-il des élèves ayant des problèmes de comportement ?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentQuestion === 1 && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Cliquez sur les élèves concernés :</p>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
                    {students.map((student) => {
                      const isSelected = selectedBehaviorIds.includes(student.id);
                      return (
                        <Badge
                          key={student.id}
                          variant={isSelected ? "destructive" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            isSelected ? "" : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                          }`}
                          onClick={() => toggleStudentSelection(student.id, selectedBehaviorIds, setSelectedBehaviorIds)}
                        >
                          {student.id}. {student.firstName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                {selectedBehaviorIds.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Description générale (facultatif) :</p>
                    <Input
                      value={behaviorDesc}
                      onChange={(e) => setBehaviorDesc(e.target.value)}
                      placeholder="Ex: bavardages incessants, insolence..."
                    />
                    
                    {/* Individual notes section */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Notes individuelles (facultatif) :</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Précisez le problème spécifique pour chaque élève. Ces notes remplaceront la description générale lors de la génération.
                      </p>
                      
                      <div className="space-y-3">
                        {selectedBehaviorIds.map((studentId) => {
                          const student = students.find(s => s.id === studentId);
                          if (!student) return null;
                          
                          return (
                            <div key={studentId} className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="shrink-0">
                                  {student.id}
                                </Badge>
                                <span className="font-medium text-sm">
                                  {student.lastName} {student.firstName}
                                </span>
                              </div>
                              
                              {/* Quick suggestions */}
                              <div className="flex flex-wrap gap-1">
                                {BEHAVIOR_SUGGESTIONS.map((suggestion) => (
                                  <Badge
                                    key={suggestion}
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    onClick={() => addBehaviorSuggestion(studentId, suggestion)}
                                  >
                                    + {suggestion}
                                  </Badge>
                                ))}
                              </div>
                              
                              <Input
                                value={behaviorIndividualNotes[studentId] || ""}
                                onChange={(e) => handleIndividualNoteChange(studentId, e.target.value)}
                                placeholder="Précision pour cet élève..."
                                className="text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleBehaviorSubmit(false)} className="flex-1">
                    Aucun problème
                  </Button>
                  <Button 
                    onClick={() => handleBehaviorSubmit(true)} 
                    className="flex-1"
                    disabled={selectedBehaviorIds.length === 0}
                  >
                    Valider ({selectedBehaviorIds.length})
                  </Button>
                </div>
              </CardContent>
            )}
            {currentQuestion > 1 && observations.behavior && (
              <CardContent className="pt-0">
                {observations.behavior.studentIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {observations.behavior.studentIds.map((id) => (
                      <Badge key={id} variant="destructive">
                        {getStudentName(id)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">Aucun signalé</Badge>
                )}
              </CardContent>
            )}
          </Card>

          {/* Question 2: Talkative */}
          <Card className={currentQuestion === 2 ? "ring-2 ring-primary" : currentQuestion < 2 ? "opacity-40" : "opacity-60"}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Élèves bavards</CardTitle>
                  <CardDescription>
                    Certains élèves sont-ils particulièrement bavards ?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentQuestion === 2 && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Cliquez sur les élèves concernés :</p>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
                    {students.map((student) => {
                      const isSelected = selectedTalkativeIds.includes(student.id);
                      return (
                        <Badge
                          key={student.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            isSelected 
                              ? "bg-warning text-warning-foreground hover:bg-warning/90" 
                              : "hover:bg-warning/10 hover:text-warning hover:border-warning"
                          }`}
                          onClick={() => toggleStudentSelection(student.id, selectedTalkativeIds, setSelectedTalkativeIds)}
                        >
                          {student.id}. {student.firstName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleTalkativeSubmit(false)} className="flex-1">
                    Aucun bavard
                  </Button>
                  <Button 
                    onClick={() => handleTalkativeSubmit(true)} 
                    className="flex-1"
                    disabled={selectedTalkativeIds.length === 0}
                  >
                    Valider ({selectedTalkativeIds.length})
                  </Button>
                </div>
              </CardContent>
            )}
            {currentQuestion > 2 && observations.talkative && (
              <CardContent className="pt-0">
                {observations.talkative.studentIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {observations.talkative.studentIds.map((id) => (
                      <Badge key={id} variant="secondary" className="bg-warning/10 text-warning border-warning/30">
                        {getStudentName(id)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary">Aucun signalé</Badge>
                )}
              </CardContent>
            )}
          </Card>

          {/* Question 3: Specific observations */}
          <Card className={currentQuestion === 3 ? "ring-2 ring-primary" : currentQuestion < 3 ? "opacity-40" : ""}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Observations spécifiques</CardTitle>
                  <CardDescription>
                    Sélectionnez un élève dans la liste, puis ajoutez une observation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentQuestion === 3 && (
              <CardContent className="space-y-4">
                {/* Quick observation buttons */}
                {selectedSpecificId !== null && (
                  <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium">
                      Élève sélectionné : <span className="text-primary">{getStudentName(selectedSpecificId)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Cliquez sur une suggestion ou tapez une observation :</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_OBSERVATIONS.map((obs) => (
                        <Badge
                          key={obs}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleAddSpecific(obs)}
                        >
                          {obs}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSpecificObs}
                        onChange={(e) => setNewSpecificObs(e.target.value)}
                        placeholder="Ou entrez une observation personnalisée..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddSpecific()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleAddSpecific()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Added observations */}
                {specificList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Observations ajoutées :</p>
                    {specificList.map((obs, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Badge variant="outline" className="shrink-0 mt-0.5">
                          {obs.studentId}
                        </Badge>
                        <p className="flex-1 text-sm">{obs.observation}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleRemoveSpecific(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSpecificId === null && specificList.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    👈 Cliquez sur un élève dans la liste pour ajouter une observation
                  </p>
                )}

                <Button onClick={handleFinish} className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {specificList.length === 0 ? "Aucune observation supplémentaire" : `Valider (${specificList.length} observation${specificList.length > 1 ? "s" : ""})`}
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        {currentQuestion === 3 && (
          <Button onClick={handleFinish}>
            Passer aux appréciations
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Step2Observations;
