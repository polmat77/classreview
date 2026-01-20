import { useState, useCallback } from "react";
import { Student, ClassMetadata } from "@/types/reportcard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Upload, FileText, Edit3, CheckCircle2, Trash2, HelpCircle, AlertCircle, AlertTriangle, BookOpen, Users, Calendar, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parsePronoteGradePDF, parseStudentsFromManualInput } from "@/utils/reportcardPdfParser";

interface Step1DataImportProps {
  students: Student[];
  classMetadata: ClassMetadata | null;
  onStudentsChange: (students: Student[]) => void;
  onClassMetadataChange: (metadata: ClassMetadata | null) => void;
  onNext: () => void;
}

const Step1DataImport = ({ 
  students, 
  classMetadata, 
  onStudentsChange, 
  onClassMetadataChange, 
  onNext 
}: Step1DataImportProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pdf");
  const [rawPdfText, setRawPdfText] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handlePDFUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setParseError(null);
    setRawPdfText("");
    
    try {
      const result = await parsePronoteGradePDF(file);
      
      // Store raw text for debug
      if (result.rawText) {
        setRawPdfText(result.rawText);
      }

      if (result.students.length === 0) {
        setParseError("Aucun élève détecté dans le fichier. Le format du PDF n'a peut-être pas été reconnu.");
        setShowDebug(true);
        toast({
          title: "Aucun élève détecté",
          description: "Impossible d'extraire les données du PDF. Consultez le mode debug ou essayez la saisie manuelle.",
          variant: "destructive",
        });
      } else {
        onStudentsChange(result.students);
        if (result.metadata) {
          onClassMetadataChange(result.metadata);
        }
        toast({
          title: "Import réussi",
          description: `${result.students.length} élève(s) importé(s)${result.metadata?.className ? ` - ${result.metadata.className}` : ""}`,
        });
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      setParseError(error instanceof Error ? error.message : "Erreur inconnue lors du parsing");
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier PDF. Vérifiez qu'il n'est pas protégé.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  }, [onStudentsChange, onClassMetadataChange, toast]);

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast({
        title: "Données manquantes",
        description: "Veuillez saisir au moins un élève",
        variant: "destructive",
      });
      return;
    }

    const parsedStudents = parseStudentsFromManualInput(manualInput);
    if (parsedStudents.length === 0) {
      toast({
        title: "Format invalide",
        description: "Impossible de parser les données. Vérifiez le format.",
        variant: "destructive",
      });
      return;
    }

    onStudentsChange(parsedStudents);
    setManualInput("");
    toast({
      title: "Import réussi",
      description: `${parsedStudents.length} élève(s) ajouté(s)`,
    });
  };

  const handleRemoveStudent = (id: number) => {
    const updated = students
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, id: index + 1 }));
    onStudentsChange(updated);
  };

  const handleClearAll = () => {
    onStudentsChange([]);
    onClassMetadataChange(null);
    setRawPdfText("");
    setParseError(null);
  };

  const getAverageBadgeVariant = (average: number | null) => {
    if (average === null) return "secondary";
    if (average >= 14) return "default"; // green via CSS
    if (average >= 10) return "secondary"; // orange via CSS
    return "destructive"; // red
  };

  const getAverageBadgeClass = (average: number | null) => {
    if (average === null) return "";
    if (average >= 14) return "bg-success text-success-foreground";
    if (average >= 10) return "bg-warning text-warning-foreground";
    return "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Import des données élèves
        </h1>
        <p className="text-muted-foreground">
          Importez vos données depuis PRONOTE ou saisissez-les manuellement
        </p>
      </div>

      {/* Help accordion */}
      <Accordion type="single" collapsible className="bg-card rounded-xl border">
        <AccordionItem value="help" className="border-none">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-2 text-primary">
              <HelpCircle className="w-5 h-5" />
              <span>Comment exporter depuis PRONOTE ?</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Se rendre dans l'onglet <strong className="text-foreground">"Notes"</strong></li>
                <li>Sélectionner la classe concernée dans le panneau de gauche</li>
                <li>Cliquer sur l'icône <strong className="text-foreground">d'imprimante</strong> (Imprimer)</li>
                <li>Dans "Données à imprimer", choisir <strong className="text-foreground">"Le service sélectionné"</strong></li>
                <li>Dans "Type de sortie", choisir <strong className="text-foreground">PDF</strong></li>
                <li className="text-destructive">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>Ne surtout pas cocher "Protégé" !</strong>
                </li>
                <li>Cliquer sur <strong className="text-foreground">"Générer"</strong> en bas à droite</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Class metadata display */}
      {classMetadata && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {classMetadata.className && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{classMetadata.className}</span>
                </div>
              )}
              {classMetadata.subject && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{classMetadata.subject}</span>
                </div>
              )}
              {classMetadata.period && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{classMetadata.period}</span>
                </div>
              )}
              {classMetadata.classAverage && (
                <div className="flex items-center gap-2">
                  <Badge className={getAverageBadgeClass(classMetadata.classAverage)}>
                    Moyenne classe : {classMetadata.classAverage.toFixed(2)}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import methods */}
      <Card>
        <CardHeader>
          <CardTitle>Méthode d'import</CardTitle>
          <CardDescription>
            Choisissez comment vous souhaitez ajouter les élèves
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="gap-2">
                <Upload className="w-4 h-4" />
                Import PDF
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Saisie manuelle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="mt-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">
                      {isProcessing ? "Traitement en cours..." : "Glissez votre PDF ici"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner un fichier
                    </p>
                  </div>
                  <Button variant="outline" disabled={isProcessing}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir un fichier
                  </Button>
                </label>
              </div>
              
              {/* Parse error message */}
              {parseError && students.length === 0 && (
                <div className="mt-6 p-6 bg-warning/10 border border-warning/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Impossible de parser automatiquement ce fichier
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {parseError}
                        </p>
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Vérifiez que le PDF a été exporté depuis PRONOTE <strong>sans protection</strong></li>
                        <li>Assurez-vous d'avoir choisi "Le service sélectionné" dans les données à imprimer</li>
                        <li>Réessayez avec un autre fichier ou utilisez la saisie manuelle</li>
                      </ul>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("manual")}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Passer à la saisie manuelle
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Debug mode */}
              {rawPdfText && (
                <Collapsible open={showDebug} onOpenChange={setShowDebug} className="mt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Bug className="w-4 h-4 mr-2" />
                      {showDebug ? "Masquer" : "Afficher"} le texte brut extrait (debug)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">
                        Texte extrait du PDF ({rawPdfText.length} caractères) :
                      </p>
                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-60 text-foreground/80">
                        {rawPdfText}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Textarea
                  id="manual-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder={`Saisissez un élève par ligne. Formats acceptés :
Dupont Marie - 14.5
Martin Lucas 12
Durand Emma`}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Format : "Nom Prénom - Moyenne" ou "Nom Prénom Moyenne" ou juste "Nom Prénom"
                </p>
              </div>
              <Button onClick={handleManualSubmit} className="w-full">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ajouter les élèves
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Students list with enhanced columns */}
      {students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liste des élèves</CardTitle>
              <CardDescription>
                {students.length} élève(s) • Triés par ordre alphabétique
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Tout effacer
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-14">N°</TableHead>
                    <TableHead>Nom Prénom</TableHead>
                    <TableHead className="w-20 text-center">Moyenne</TableHead>
                    <TableHead className="w-20 text-center">Sérieux</TableHead>
                    <TableHead className="w-24 text-center">Particip.</TableHead>
                    <TableHead className="w-16 text-center">Abs</TableHead>
                    <TableHead className="w-16 text-center">N.Rdu</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Badge variant="outline">{student.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.lastName} {student.firstName}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.average !== null ? (
                          <Badge className={getAverageBadgeClass(student.average)}>
                            {student.average.toFixed(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.seriousness !== null && student.seriousness !== undefined ? (
                          <span className="text-sm">{student.seriousness}/20</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.participation !== null && student.participation !== undefined ? (
                          <span className="text-sm">{student.participation}/20</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.absences && student.absences > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            {student.absences > 2 && (
                              <AlertTriangle className="w-3 h-3 text-warning" />
                            )}
                            <span className={student.absences > 2 ? "text-warning font-medium" : ""}>
                              {student.absences}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.nonRendus && student.nonRendus > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3 text-destructive" />
                            <span className="text-destructive font-medium">
                              {student.nonRendus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={students.length === 0}
          className="min-w-[200px]"
        >
          Valider la liste
          <CheckCircle2 className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step1DataImport;
