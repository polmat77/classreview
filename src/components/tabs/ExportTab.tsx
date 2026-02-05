import { useState } from "react";
import { Download, FileText, Eye, Settings, AlertTriangle, CheckCircle2, Image, Loader2, Award, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import { downloadPDF, ExportOptions, ExportData } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { Attribution } from "@/types/attribution";

interface ExportTabProps {
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
    generalAppreciation?: string;
    studentAppreciations?: string[];
    studentAttributions?: (Attribution | null)[];
    professeurPrincipal?: string;
  };
}

const ExportTab = ({ data }: ExportTabProps) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Export options
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [colorMode, setColorMode] = useState(true);
  const [schoolLogo, setSchoolLogo] = useState(false);
  const [includeAttributions, setIncludeAttributions] = useState(true);
  const [hideNonEvaluableStudents, setHideNonEvaluableStudents] = useState(false);

  const hasClasseCSV = !!data?.classeCSV;
  const hasBulletinClasse = !!data?.bulletinClasse;
  const hasBulletinsEleves = data?.bulletinsEleves && data.bulletinsEleves.length > 0;
  const hasGeneralAppreciation = !!data?.generalAppreciation;
  const hasStudentAppreciations = data?.studentAppreciations && data.studentAppreciations.some(t => t && t.length > 0);
  const hasAttributions = data?.studentAttributions && data.studentAttributions.some(a => a !== null);
  
  const hasAnyData = hasClasseCSV || hasBulletinClasse || hasBulletinsEleves;

  const nbEleves = data?.classeCSV?.eleves.length || data?.bulletinsEleves?.length || 0;
  const nbMatieres = data?.classeCSV?.matieres.length || data?.bulletinClasse?.matieres.length || 0;
  const nbAppreciationsGenerated = data?.studentAppreciations?.filter(t => t && t.length > 0).length || 0;
  const nbAttributions = data?.studentAttributions?.filter(a => a !== null).length || 0;
  
  // Check if there are non-evaluable students (prolonged absences)
  const nonEvaluableCount = data?.classeCSV?.eleves.filter(e => 
    e.moyenneGenerale === 0 || isNaN(e.moyenneGenerale) || (e.absences || 0) > 50
  ).length || 0;

  const getExportData = (): ExportData => ({
    bulletinClasse: data?.bulletinClasse,
    bulletinsEleves: data?.bulletinsEleves,
    classeCSV: data?.classeCSV,
    generalAppreciation: data?.generalAppreciation,
    studentAppreciations: data?.studentAppreciations,
    studentAttributions: data?.studentAttributions,
    professeurPrincipal: data?.professeurPrincipal,
  });

  const getExportOptions = (): ExportOptions => ({
    includeGraphs,
    includeComments,
    colorMode,
    schoolLogo,
    includeAttributions: includeAttributions && hasAttributions,
    hideNonEvaluableStudents,
  });

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      downloadPDF(getExportData(), getExportOptions());
      
      toast({
        title: "PDF généré avec succès",
        description: "Le rapport a été téléchargé sur votre appareil.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const className = data?.bulletinClasse?.classe || '3ème';
  const trimester = data?.bulletinClasse?.trimestre || '1er Trimestre';
  const moyenneClasse = data?.classeCSV?.statistiques.moyenneClasse || 
    (data?.bulletinClasse?.matieres.reduce((s, m) => s + m.moyenne, 0) || 0) / (data?.bulletinClasse?.matieres.length || 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Export et téléchargement</h2>
          <p className="text-muted-foreground">
            Générez un rapport PDF complet regroupant les analyses et les appréciations
          </p>
        </div>
      </div>

      {/* Warning if no data */}
      {!hasAnyData && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Aucune donnée importée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Veuillez d'abord importer vos données dans les onglets Résultats de la classe, Appréciation de la Classe et/ou Appréciations individuelles pour générer un export.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info note */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="flex items-start gap-3 p-4">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Aucun fichier supplémentaire requis — cet onglet utilise les données déjà importées dans les autres onglets.
          </p>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={hasAnyData ? "bg-gradient-primary text-primary-foreground" : "opacity-60"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{hasAnyData ? "Rapport prêt" : "Rapport non disponible"}</CardTitle>
                <CardDescription className={hasAnyData ? "text-primary-foreground/80" : ""}>
                  {hasAnyData ? "Données validées" : "Importez des données d'abord"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Élèves analysés:</span>
                <span className="font-bold">{nbEleves}</span>
              </div>
              <div className="flex justify-between">
                <span>Matières:</span>
                <span className="font-bold">{nbMatieres}</span>
              </div>
              <div className="flex justify-between">
                <span>Appréciations:</span>
                <span className="font-bold">
                  {hasStudentAppreciations 
                    ? `${hasGeneralAppreciation ? 1 : 0} générale + ${nbAppreciationsGenerated} individuelles`
                    : hasGeneralAppreciation 
                      ? "1 générale" 
                      : "Non générées"
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Options de personnalisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-graphs" className="text-sm">
                Inclure les graphiques et statistiques
              </Label>
              <Switch 
                id="include-graphs" 
                checked={includeGraphs}
                onCheckedChange={setIncludeGraphs}
                disabled={!hasAnyData} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-comments" className="text-sm">
                Commentaires des professeurs
              </Label>
              <Switch 
                id="include-comments" 
                checked={includeComments}
                onCheckedChange={setIncludeComments}
                disabled={!hasAnyData} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="color-mode" className="text-sm">
                Mode couleur (sinon noir & blanc)
              </Label>
              <Switch 
                id="color-mode" 
                checked={colorMode}
                onCheckedChange={setColorMode}
                disabled={!hasAnyData} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-attributions" className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Inclure les attributions (Félicitations, etc.)
              </Label>
              <Switch 
                id="include-attributions" 
                checked={includeAttributions}
                onCheckedChange={setIncludeAttributions}
                disabled={!hasAnyData || !hasAttributions} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="school-logo" className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4" />
                Logo de l'établissement (optionnel)
              </Label>
              <Switch 
                id="school-logo" 
                checked={schoolLogo}
                onCheckedChange={setSchoolLogo}
                disabled={!hasAnyData} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-non-evaluable" className="text-sm flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Masquer les élèves non évaluables
                {nonEvaluableCount > 0 && (
                  <span className="text-xs text-muted-foreground">({nonEvaluableCount} élève{nonEvaluableCount > 1 ? 's' : ''})</span>
                )}
              </Label>
              <Switch 
                id="hide-non-evaluable" 
                checked={hideNonEvaluableStudents}
                onCheckedChange={setHideNonEvaluableStudents}
                disabled={!hasAnyData || nonEvaluableCount === 0} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What will be included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sections incluses dans le rapport</CardTitle>
          <CardDescription>Récapitulatif des données disponibles pour l'export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Page 1</Badge>
              <span className="text-sm font-medium">Page de garde</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {hasAnyData ? `${className} • ${trimester}` : "—"}
              </span>
              {hasAnyData && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 2-3</Badge>
              <span className="text-sm font-medium">Analyse globale</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {hasClasseCSV ? `Moyenne: ${moyenneClasse.toFixed(2)}` : "Tableaux & graphiques"}
              </span>
              {hasClasseCSV ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non importé</span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 4-5</Badge>
              <span className="text-sm font-medium">Analyse par matière</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {nbMatieres} matières détaillées
              </span>
              {hasBulletinClasse || hasClasseCSV ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non importé</span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Page 6</Badge>
              <span className="text-sm font-medium">Appréciation générale</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {hasGeneralAppreciation ? `${data?.generalAppreciation?.length || 0} caractères` : "Synthèse de classe"}
              </span>
              {hasGeneralAppreciation ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non générée</span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 7+</Badge>
              <span className="text-sm font-medium">Appréciations individuelles</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {nbEleves > 0 ? `${nbAppreciationsGenerated}/${nbEleves} générées` : "—"}
              </span>
              {hasStudentAppreciations ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non générées</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 gap-2"
          disabled={!hasAnyData}
          onClick={() => setShowPreview(true)}
        >
          <Eye className="h-5 w-5" />
          Aperçu avant export
        </Button>
        <Button 
          size="lg" 
          className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary-light shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
          disabled={!hasAnyData || isGenerating}
          onClick={handleGeneratePDF}
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isGenerating ? "Génération..." : "Générer le PDF"}
        </Button>
      </div>

      {/* Pro tip */}
      <Card className="border-accent bg-accent/5">
        <CardContent className="flex items-start gap-3 p-4">
          <span className="text-2xl">💡</span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent-foreground">Astuce professionnelle</p>
            <p className="text-sm text-muted-foreground">
              Le PDF généré est optimisé pour l'impression et peut être directement importé dans votre
              système de gestion scolaire. N'oubliez pas de sauvegarder une copie avant de fermer l'application.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du rapport</DialogTitle>
            <DialogDescription>
              Vérifiez le contenu avant de générer le PDF
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Cover Preview */}
              <div className="rounded-lg border p-6 bg-gradient-to-br from-navy to-navy-light text-white">
                <h3 className="text-2xl font-bold text-center mb-2">ClassCouncil AI</h3>
                <p className="text-center text-white/80 mb-4">Rapport du Conseil de Classe</p>
                <div className="text-center">
                  <p className="text-xl font-semibold">{className}</p>
                  <p className="text-sm text-white/70">{trimester}</p>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{nbEleves}</p>
                    <p className="text-xs text-white/70">Élèves</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{nbMatieres}</p>
                    <p className="text-xs text-white/70">Matières</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{moyenneClasse.toFixed(1)}</p>
                    <p className="text-xs text-white/70">Moyenne</p>
                  </div>
                </div>
              </div>

              {/* General Appreciation Preview */}
              {hasGeneralAppreciation && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Appréciation générale
                  </h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                    {data?.generalAppreciation}
                  </p>
                </div>
              )}

              {/* Student Appreciations Preview */}
              {hasStudentAppreciations && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Appréciations individuelles ({nbAppreciationsGenerated}/{nbEleves})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data?.studentAppreciations?.map((appreciation, index) => {
                      const student = data?.bulletinsEleves?.[index] || data?.classeCSV?.eleves?.[index];
                      const studentName = data?.bulletinsEleves?.[index] 
                        ? `${data.bulletinsEleves[index].prenom} ${data.bulletinsEleves[index].nom}`
                        : data?.classeCSV?.eleves?.[index]?.nom || `Élève ${index + 1}`;
                      
                      if (!appreciation) return null;
                      
                      return (
                        <div key={index} className="bg-muted/30 p-3 rounded text-sm">
                          <p className="font-medium text-xs text-muted-foreground mb-1">{studentName}</p>
                          <p>{appreciation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data Summary */}
              {hasClasseCSV && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Données de la classe</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-lg font-bold text-primary">{data?.classeCSV?.statistiques.moyenneClasse.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Moyenne classe</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-lg font-bold text-success">{data?.classeCSV?.eleves.filter(e => e.moyenneGenerale >= 10).length}</p>
                      <p className="text-xs text-muted-foreground">≥ 10/20</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-lg font-bold text-destructive">{data?.classeCSV?.eleves.filter(e => e.moyenneGenerale < 10).length}</p>
                      <p className="text-xs text-muted-foreground">&lt; 10/20</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Fermer
            </Button>
            <Button 
              onClick={() => {
                setShowPreview(false);
                handleGeneratePDF();
              }}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Télécharger le PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportTab;
