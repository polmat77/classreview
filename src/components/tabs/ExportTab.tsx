import { Download, FileText, Eye, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ExportTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Export PDF</h2>
        <p className="text-muted-foreground">Générez et téléchargez votre rapport complet</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Rapport prêt</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Toutes les données sont validées
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Élèves analysés:</span>
                <span className="font-bold">25</span>
              </div>
              <div className="flex justify-between">
                <span>Matières:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Appréciations:</span>
                <span className="font-bold">26 (1 générale + 25 individuelles)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Options d'export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-graphs" className="text-sm">
                Inclure les graphiques
              </Label>
              <Switch id="include-graphs" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-comments" className="text-sm">
                Commentaires des professeurs
              </Label>
              <Switch id="include-comments" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="color-mode" className="text-sm">
                Mode couleur (sinon noir & blanc)
              </Label>
              <Switch id="color-mode" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="school-logo" className="text-sm">
                Logo de l'établissement
              </Label>
              <Switch id="school-logo" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contenu du PDF</CardTitle>
          <CardDescription>Aperçu de la structure du document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Page 1</Badge>
              <span className="text-sm font-medium">Page de garde</span>
              <span className="ml-auto text-xs text-muted-foreground">Classe 3ème B - Trimestre 1</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 2-3</Badge>
              <span className="text-sm font-medium">Analyse globale</span>
              <span className="ml-auto text-xs text-muted-foreground">Tableaux & graphiques</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 4-5</Badge>
              <span className="text-sm font-medium">Analyse par matière</span>
              <span className="ml-auto text-xs text-muted-foreground">12 matières détaillées</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Page 6</Badge>
              <span className="text-sm font-medium">Appréciation générale</span>
              <span className="ml-auto text-xs text-muted-foreground">Synthèse de classe</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Badge variant="outline">Pages 7-31</Badge>
              <span className="text-sm font-medium">Appréciations individuelles</span>
              <span className="ml-auto text-xs text-muted-foreground">25 élèves (1 page/élève)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" size="lg" className="flex-1 gap-2">
          <Eye className="h-5 w-5" />
          Aperçu avant export
        </Button>
        <Button size="lg" className="flex-1 gap-2 bg-gradient-success">
          <Download className="h-5 w-5" />
          Télécharger le PDF
        </Button>
      </div>

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
