import { useState } from "react";
import { Student, StudentObservations, SpecificObservation } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle, MessageCircle, Lightbulb, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step2ObservationsProps {
  students: Student[];
  observations: StudentObservations;
  onObservationsChange: (observations: StudentObservations) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Observations = ({
  students,
  observations,
  onObservationsChange,
  onNext,
  onBack,
}: Step2ObservationsProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  // Temporary states for each question
  const [behaviorIds, setBehaviorIds] = useState(
    observations.behavior?.studentIds.join(", ") || ""
  );
  const [behaviorDesc, setBehaviorDesc] = useState(
    observations.behavior?.description || ""
  );
  const [talkativeIds, setTalkativeIds] = useState(
    observations.talkative?.studentIds.join(", ") || ""
  );
  const [specificList, setSpecificList] = useState<SpecificObservation[]>(
    observations.specific || []
  );
  const [newSpecificId, setNewSpecificId] = useState("");
  const [newSpecificObs, setNewSpecificObs] = useState("");

  const parseStudentIds = (input: string): number[] => {
    return input
      .split(/[,;]/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= students.length);
  };

  const getStudentName = (id: number): string => {
    const student = students.find((s) => s.id === id);
    return student ? `${student.lastName} ${student.firstName}` : `Élève ${id}`;
  };

  const handleBehaviorSubmit = (hasIssues: boolean) => {
    if (hasIssues) {
      const ids = parseStudentIds(behaviorIds);
      if (ids.length === 0) {
        toast({
          title: "Numéros invalides",
          description: "Veuillez entrer des numéros d'élèves valides",
          variant: "destructive",
        });
        return;
      }
      onObservationsChange({
        ...observations,
        behavior: { studentIds: ids, description: behaviorDesc },
      });
    } else {
      onObservationsChange({
        ...observations,
        behavior: { studentIds: [], description: "" },
      });
    }
    setCurrentQuestion(2);
  };

  const handleTalkativeSubmit = (hasTalkative: boolean) => {
    if (hasTalkative) {
      const ids = parseStudentIds(talkativeIds);
      if (ids.length === 0) {
        toast({
          title: "Numéros invalides",
          description: "Veuillez entrer des numéros d'élèves valides",
          variant: "destructive",
        });
        return;
      }
      onObservationsChange({
        ...observations,
        talkative: { studentIds: ids },
      });
    } else {
      onObservationsChange({
        ...observations,
        talkative: { studentIds: [] },
      });
    }
    setCurrentQuestion(3);
  };

  const handleAddSpecific = () => {
    const id = parseInt(newSpecificId);
    if (isNaN(id) || id < 1 || id > students.length) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro d'élève valide",
        variant: "destructive",
      });
      return;
    }
    if (!newSpecificObs.trim()) {
      toast({
        title: "Observation manquante",
        description: "Veuillez entrer une observation",
        variant: "destructive",
      });
      return;
    }

    const updated = [...specificList, { studentId: id, observation: newSpecificObs.trim() }];
    setSpecificList(updated);
    setNewSpecificId("");
    setNewSpecificObs("");
  };

  const handleRemoveSpecific = (index: number) => {
    const updated = specificList.filter((_, i) => i !== index);
    setSpecificList(updated);
  };

  const handleFinish = () => {
    onObservationsChange({
      ...observations,
      specific: specificList,
    });
    onNext();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Observations sur les élèves
        </h1>
        <p className="text-muted-foreground">
          Question {currentQuestion} sur 3 • Ces informations personnaliseront les appréciations
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student reference sidebar */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Liste des élèves</CardTitle>
            <CardDescription>Référence pour les numéros</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="px-4 pb-4 space-y-1">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 py-1.5 text-sm"
                  >
                    <Badge variant="outline" className="w-8 justify-center shrink-0">
                      {student.id}
                    </Badge>
                    <span className="truncate">
                      {student.lastName} {student.firstName}
                    </span>
                  </div>
                ))}
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
                  <Label>Numéros des élèves concernés</Label>
                  <Input
                    value={behaviorIds}
                    onChange={(e) => setBehaviorIds(e.target.value)}
                    placeholder="Ex: 3, 7, 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (facultatif)</Label>
                  <Textarea
                    value={behaviorDesc}
                    onChange={(e) => setBehaviorDesc(e.target.value)}
                    placeholder="Ex: bavardages incessants, insolence..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleBehaviorSubmit(false)} className="flex-1">
                    Aucun problème
                  </Button>
                  <Button onClick={() => handleBehaviorSubmit(true)} className="flex-1">
                    Valider
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
                  <Label>Numéros des élèves concernés</Label>
                  <Input
                    value={talkativeIds}
                    onChange={(e) => setTalkativeIds(e.target.value)}
                    placeholder="Ex: 2, 5, 8, 15"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => handleTalkativeSubmit(false)} className="flex-1">
                    Aucun bavard
                  </Button>
                  <Button onClick={() => handleTalkativeSubmit(true)} className="flex-1">
                    Valider
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
                    As-tu des observations spécifiques pour certains élèves ?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {currentQuestion === 3 && (
              <CardContent className="space-y-4">
                {/* Added observations */}
                {specificList.length > 0 && (
                  <div className="space-y-2">
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

                {/* Add new observation */}
                <div className="space-y-3 p-4 border border-dashed rounded-lg">
                  <div className="flex gap-3">
                    <div className="w-20">
                      <Input
                        value={newSpecificId}
                        onChange={(e) => setNewSpecificId(e.target.value)}
                        placeholder="N°"
                        className="text-center"
                      />
                    </div>
                    <Input
                      value={newSpecificObs}
                      onChange={(e) => setNewSpecificObs(e.target.value)}
                      placeholder="Ex: fait des efforts, très passif, excellente progression..."
                      className="flex-1"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddSpecific} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter cette observation
                  </Button>
                </div>

                <Button onClick={handleFinish} className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {specificList.length === 0 ? "Aucune observation supplémentaire" : "Valider les observations"}
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
