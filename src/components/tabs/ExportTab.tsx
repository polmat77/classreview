import { useState } from "react";
import { Download, FileText, Eye, Settings, AlertTriangle, CheckCircle2, Image, Loader2, Award, UserX, Users, Archive, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";
import { generatePDF, downloadPDF, generateIndividualSheets, downloadIndividualSheets, ExportOptions, ExportData } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { Attribution } from "@/types/attribution";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import StepInfoBanner from "@/components/StepInfoBanner";

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
  const [isGeneratingSheets, setIsGeneratingSheets] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [previewType, setPreviewType] = useState<'full' | 'individual'>('full');
  const [previewPage, setPreviewPage] = useState(1);
  
  // Export options
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [colorMode, setColorMode] = useState(true);
  const [schoolLogo, setSchoolLogo] = useState(false);
  const [includeAttributions, setIncludeAttributions] = useState(true);
  const [hideNonEvaluableStudents, setHideNonEvaluableStudents] = useState(false);
  const [includeSubjectAnalysis, setIncludeSubjectAnalysis] = useState(true);
  const [includeDetailedJustifications, setIncludeDetailedJustifications] = useState(false);
  
  // Advanced options
  const [sortOrder, setSortOrder] = useState<'rank' | 'alpha' | 'alpha-desc' | 'rank-desc'>('rank');
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [showGapFromClass, setShowGapFromClass] = useState(true);

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
    includeAttributions: includeAttributions && (hasAttributions ?? false),
    hideNonEvaluableStudents,
    includeSubjectAnalysis,
    includeDetailedJustifications,
  });

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadPDF(getExportData(), getExportOptions());
      toast({
        title: "PDF généré avec succès",
        description: "Le rapport complet a été téléchargé sur votre appareil.",
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

  const handleGenerateIndividualSheets = async () => {
    setIsGeneratingSheets(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadIndividualSheets(getExportData(), getExportOptions());
      toast({
        title: "Fiches individuelles générées",
        description: `${nbEleves} fiches élèves téléchargées en PDF.`,
      });
    } catch (error) {
      console.error('Error generating individual sheets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les fiches individuelles.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSheets(false);
    }
  };

  const handleExportZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();
      const className = data?.bulletinClasse?.classe || '3eme';
      const trimester = data?.bulletinClasse?.trimestre?.replace(/\s+/g, '_') || 'T1';
      const folder = zip.folder(`ClassCouncil_${className}_${trimester}`);
      
      if (!folder) throw new Error('Could not create folder');
      
      // Generate full report
      const fullReport = generatePDF(getExportData(), getExportOptions());
      folder.file(`Rapport_complet_${className}.pdf`, fullReport.output('blob'));
      
      // Generate individual sheets (one combined PDF)
      const individualSheets = generateIndividualSheets(getExportData(), getExportOptions());
      folder.file(`Fiches_individuelles_${className}.pdf`, individualSheets.output('blob'));
      
      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ClassCouncil_${className}_${trimester}.zip`);
      
      toast({
        title: "Export ZIP réussi",
        description: "Le dossier complet a été téléchargé.",
      });
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'archive ZIP.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handlePreview = (type: 'full' | 'individual') => {
    setPreviewType(type);
    setPreviewPage(1);
    setShowPreview(true);
  };

  const className = data?.bulletinClasse?.classe || '3ème';
  const trimester = data?.bulletinClasse?.trimestre || '1er Trimestre';
  const moyenneClasse = data?.classeCSV?.statistiques.moyenneClasse || 
    (data?.bulletinClasse?.matieres.reduce((s, m) => s + m.moyenne, 0) || 0) / (data?.bulletinClasse?.matieres.length || 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <StepInfoBanner step={4} />
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Export et téléchargement</h2>
          <p className="text-muted-foreground">
            Générez un rapport PDF complet ou des fiches individuelles pour les familles
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

      {/* Main content - 2 columns */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Report Status Card */}
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
              {nbAttributions > 0 && (
                <div className="flex justify-between">
                  <span>Attributions:</span>
                  <span className="font-bold">{nbAttributions} élèves</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Options Card */}
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
                Inclure les attributions
              </Label>
              <Switch 
                id="include-attributions" 
                checked={includeAttributions}
                onCheckedChange={setIncludeAttributions}
                disabled={!hasAnyData || !hasAttributions} 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hide-non-evaluable" className="text-sm flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Masquer élèves non évaluables
                </Label>
                {nonEvaluableCount > 0 && (
                  <p className="text-xs text-muted-foreground">({nonEvaluableCount} élève{nonEvaluableCount > 1 ? 's' : ''} concerné{nonEvaluableCount > 1 ? 's' : ''})</p>
                )}
              </div>
              <Switch 
                id="hide-non-evaluable" 
                checked={hideNonEvaluableStudents}
                onCheckedChange={setHideNonEvaluableStudents}
                disabled={!hasAnyData || nonEvaluableCount === 0} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-gap" className="text-sm">
                Afficher écart par rapport à la classe
              </Label>
              <Switch 
                id="show-gap" 
                checked={showGapFromClass}
                onCheckedChange={setShowGapFromClass}
                disabled={!hasAnyData} 
              />
            </div>
            
            <Separator />
            
            {/* NEW: Subject Analysis and Detailed Justifications options */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-subject-analysis" className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Inclure l'analyse par matière
                </Label>
                <p className="text-xs text-muted-foreground">(Appréciations des professeurs - Pages 6-7)</p>
              </div>
              <Switch 
                id="include-subject-analysis" 
                checked={includeSubjectAnalysis}
                onCheckedChange={setIncludeSubjectAnalysis}
                disabled={!hasAnyData} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-justifications" className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Inclure les détails justificatifs
                </Label>
                <p className="text-xs text-muted-foreground">(Pour chaque élève : matières, comportements)</p>
              </div>
              <Switch 
                id="include-justifications" 
                checked={includeDetailedJustifications}
                onCheckedChange={setIncludeDetailedJustifications}
                disabled={!hasAnyData} 
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-sm">Tri des élèves</Label>
              <Select 
                value={sortOrder} 
                onValueChange={(v) => setSortOrder(v as typeof sortOrder)}
                disabled={!hasAnyData}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Par rang (meilleurs en premier)</SelectItem>
                  <SelectItem value="alpha">Alphabétique (A-Z)</SelectItem>
                  <SelectItem value="alpha-desc">Alphabétique (Z-A)</SelectItem>
                  <SelectItem value="rank-desc">Par rang (moins bons en premier)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons - 2 main types */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Full Report */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Rapport complet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF multi-pages avec toutes les analyses, statistiques et appréciations
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview('full')}
                    disabled={!hasAnyData}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Aperçu
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGeneratePDF}
                    disabled={!hasAnyData || isGenerating}
                    className="gap-2 bg-primary"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Sheets */}
        <Card className="hover:shadow-md transition-shadow border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Users className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Fiches individuelles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  1 page par élève à remettre aux familles ({nbEleves} fiches)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview('individual')}
                    disabled={!hasAnyData}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Aperçu
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateIndividualSheets}
                    disabled={!hasAnyData || isGeneratingSheets}
                    className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    {isGeneratingSheets ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ZIP Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Export groupé (ZIP)</p>
                <p className="text-sm text-muted-foreground">
                  Télécharger le rapport complet + toutes les fiches individuelles en un seul fichier
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExportZip}
              disabled={!hasAnyData || isGeneratingZip}
              className="gap-2"
            >
              {isGeneratingZip ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Exporter en ZIP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sections incluses dans le rapport complet</CardTitle>
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
              <Badge variant="outline">Page 2</Badge>
              <span className="text-sm font-medium">Résumé exécutif</span>
              <span className="ml-auto text-xs text-muted-foreground">
                Vue d'ensemble pour direction
              </span>
              {hasClasseCSV ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non importé</span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 3-4</Badge>
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
              <Badge variant="outline">Pages 5-6</Badge>
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
              <Badge variant="outline">Page 7</Badge>
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
              <Badge variant="outline">Pages 8+</Badge>
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

      {/* Pro tip */}
      <Card className="border-accent bg-accent/5">
        <CardContent className="flex items-start gap-3 p-4">
          <span className="text-2xl">💡</span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-accent-foreground">Astuce professionnelle</p>
            <p className="text-sm text-muted-foreground">
              Le PDF généré est optimisé pour l'impression. Utilisez les <strong>fiches individuelles</strong> pour distribuer aux familles lors des réunions parents-professeurs, et le <strong>rapport complet</strong> pour les archives administratives.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {previewType === 'full' ? 'Aperçu du rapport complet' : 'Aperçu des fiches individuelles'}
              </span>
            </DialogTitle>
            <DialogDescription>
              Vérifiez le contenu avant de générer le PDF
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {previewType === 'full' ? (
                <>
                  {/* Cover Preview */}
                  <div className="rounded-lg border p-6 bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold">ClassCouncil</span>
                      <span className="text-2xl font-bold text-amber-400">AI</span>
                    </div>
                    <p className="text-center text-white/80 mb-4">Rapport du Conseil de Classe</p>
                    <div className="text-center">
                      <p className="text-xl font-semibold">{className}</p>
                      <p className="text-sm text-white/70">{trimester}</p>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-2xl font-bold">{nbEleves}</p>
                        <p className="text-xs text-white/70">Élèves</p>
                      </div>
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-2xl font-bold">{nbMatieres}</p>
                        <p className="text-xs text-white/70">Matières</p>
                      </div>
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-2xl font-bold">{moyenneClasse.toFixed(1)}</p>
                        <p className="text-xs text-white/70">Moyenne</p>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Preview */}
                  {hasClasseCSV && (
                    <div className="rounded-lg border p-4 bg-slate-50">
                      <h4 className="font-semibold mb-3">📊 Résumé exécutif</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <p className="font-medium text-green-800 text-sm mb-2">✅ Points positifs</p>
                          <ul className="text-xs text-green-700 space-y-1">
                            <li>• Taux de réussite satisfaisant</li>
                            <li>• Classe homogène</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 p-3 rounded border border-amber-200">
                          <p className="font-medium text-amber-800 text-sm mb-2">⚠️ Points de vigilance</p>
                          <ul className="text-xs text-amber-700 space-y-1">
                            <li>• Matières à renforcer identifiées</li>
                            <li>• Élèves en difficulté à suivre</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

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
                        <Users className="h-4 w-4" />
                        Appréciations individuelles ({nbAppreciationsGenerated}/{nbEleves})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data?.studentAppreciations?.slice(0, 5).map((appreciation, index) => {
                          const studentName = data?.classeCSV?.eleves?.[index]?.nom || `Élève ${index + 1}`;
                          if (!appreciation) return null;
                          return (
                            <div key={index} className="bg-muted/30 p-3 rounded text-sm border-l-4 border-primary">
                              <p className="font-medium text-xs text-muted-foreground mb-1">{studentName}</p>
                              <p className="line-clamp-2">{appreciation}</p>
                            </div>
                          );
                        })}
                        {nbAppreciationsGenerated > 5 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            ... et {nbAppreciationsGenerated - 5} autres appréciations
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Individual Sheet Preview */}
                  <div className="rounded-lg border p-6 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-muted-foreground">ClassCouncil AI</div>
                      <div className="text-right">
                        <p className="font-semibold">BULLETIN DU CONSEIL DE CLASSE</p>
                        <div className="h-0.5 w-32 bg-amber-400 mt-1 ml-auto"></div>
                        <p className="text-sm text-muted-foreground mt-1">{className} - {trimester}</p>
                      </div>
                    </div>
                    
                    <div className="h-0.5 bg-amber-400 my-4"></div>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-700">
                        {data?.classeCSV?.eleves?.[0]?.nom || 'Prénom NOM'}
                      </h3>
                      <div className="h-px w-48 bg-slate-200 mx-auto mt-2"></div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-sm mb-3">RÉSULTATS GÉNÉRAUX</p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-lg font-bold text-green-600">
                            {data?.classeCSV?.eleves?.[0]?.moyenneGenerale?.toFixed(2) || '12.50'}
                          </p>
                          <p className="text-xs text-muted-foreground">Moyenne élève</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-lg font-bold text-slate-600">{moyenneClasse.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Classe moyenne</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-lg font-bold text-blue-600">1/{nbEleves}</p>
                          <p className="text-xs text-muted-foreground">Rang</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center">
                          <p className="text-lg font-bold text-slate-600">2</p>
                          <p className="text-xs text-muted-foreground">Absences</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="font-semibold text-sm text-blue-800 mb-2">APPRÉCIATION DU CONSEIL</p>
                      <p className="text-sm text-slate-700">
                        {data?.studentAppreciations?.[0] || "Aperçu de l'appréciation de l'élève qui sera générée..."}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Aperçu de la première fiche. {nbEleves} fiches seront générées au total.
                  </p>
                </>
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
                if (previewType === 'full') {
                  handleGeneratePDF();
                } else {
                  handleGenerateIndividualSheets();
                }
              }}
              disabled={isGenerating || isGeneratingSheets}
              className="gap-2"
            >
              {(isGenerating || isGeneratingSheets) ? (
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
