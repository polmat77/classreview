import { Upload, FileSpreadsheet, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportTabProps {
  onNext: () => void;
}

const ImportTab = ({ onNext }: ImportTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Import des données</h2>
        <p className="text-muted-foreground">Chargez vos fichiers de bulletins depuis PRONOTE ou autre format</p>
      </div>

      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>Besoin d'aide pour exporter depuis PRONOTE ?</AlertTitle>
        <AlertDescription>
          Accédez à PRONOTE → Export → Sélectionnez "Bulletins" → Format CSV ou Excel
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-smooth cursor-pointer border-2 border-dashed hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Moyennes de classe</CardTitle>
                <CardDescription>Fichier CSV ou Excel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-smooth hover:border-primary hover:bg-primary/5">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Cliquez pour charger
              </span>
              <input type="file" className="hidden" accept=".csv,.xlsx,.xls" />
            </label>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-smooth cursor-pointer border-2 border-dashed hover:border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <FileSpreadsheet className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Bulletins détaillés</CardTitle>
                <CardDescription>Appréciations des professeurs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-smooth hover:border-accent hover:bg-accent/5">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Cliquez pour charger
              </span>
              <input type="file" className="hidden" accept=".csv,.xlsx,.xls" />
            </label>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Fichiers chargés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">moyennes_3eme_T1.csv</p>
                  <p className="text-xs text-muted-foreground">25 élèves • 12 matières</p>
                </div>
              </div>
              <span className="text-xs font-medium text-success">✓ Validé</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">appreciations_3eme_T1.xlsx</p>
                  <p className="text-xs text-muted-foreground">25 élèves • Commentaires profs</p>
                </div>
              </div>
              <span className="text-xs font-medium text-success">✓ Validé</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="gap-2">
          Continuer vers l'analyse
        </Button>
      </div>
    </div>
  );
};

export default ImportTab;
