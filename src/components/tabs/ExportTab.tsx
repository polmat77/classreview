import { Download, FileText, Eye, Settings, AlertTriangle, CheckCircle2, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";

interface ExportTabProps {
  data?: {
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  };
}

const ExportTab = ({ data }: ExportTabProps) => {
  const hasClasseCSV = !!data?.classeCSV;
  const hasBulletinClasse = !!data?.bulletinClasse;
  const hasBulletinsEleves = data?.bulletinsEleves && data.bulletinsEleves.length > 0;
  
  const hasAnyData = hasClasseCSV || hasBulletinClasse || hasBulletinsEleves;

  const nbEleves = data?.classeCSV?.eleves.length || data?.bulletinsEleves?.length || 0;
  const nbMatieres = data?.classeCSV?.matieres.length || data?.bulletinClasse?.matieres.length || 0;

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
                  {hasBulletinsEleves ? `${nbEleves + 1} (1 générale + ${nbEleves} individuelles)` : "Non générées"}
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
              <Switch id="include-graphs" defaultChecked disabled={!hasAnyData} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-comments" className="text-sm">
                Commentaires des professeurs
              </Label>
              <Switch id="include-comments" defaultChecked disabled={!hasAnyData} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="color-mode" className="text-sm">
                Mode couleur (sinon noir & blanc)
              </Label>
              <Switch id="color-mode" defaultChecked disabled={!hasAnyData} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="school-logo" className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4" />
                Logo de l'établissement (optionnel)
              </Label>
              <Switch id="school-logo" disabled={!hasAnyData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What will be included */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sections incluses dans le rapport</CardTitle>
          <CardDescription>Sélectionnez les sections à inclure dans votre PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Page 1</Badge>
              <span className="text-sm font-medium">Page de garde</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {hasAnyData ? "Classe & Trimestre" : "—"}
              </span>
              {hasAnyData && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 2-3</Badge>
              <span className="text-sm font-medium">Analyse globale</span>
              <span className="ml-auto text-xs text-muted-foreground">Tableaux & graphiques</span>
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
              <span className="ml-auto text-xs text-muted-foreground">Synthèse de classe</span>
              {hasBulletinsEleves ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <span className="text-xs text-warning">Non générée</span>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 7+</Badge>
              <span className="text-sm font-medium">Appréciations individuelles</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {nbEleves > 0 ? `${nbEleves} élèves (1 page/élève)` : "—"}
              </span>
              {hasBulletinsEleves ? (
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
        >
          <Eye className="h-5 w-5" />
          Aperçu avant export
        </Button>
        <Button 
          size="lg" 
          className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary-light shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
          disabled={!hasAnyData}
        >
          <Download className="h-5 w-5" />
          Générer le PDF
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
    </div>
  );
};

export default ExportTab;