import { Upload, FileSpreadsheet, HelpCircle, FileCheck, AlertCircle, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { extractTextFromPDF, parseBulletinClasse, parseBulletinsElevesFromPDF, BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { parseCSVClasse, ClasseDataCSV } from "@/utils/csvParser";

interface ImportTabProps {
  onNext: () => void;
  onDataLoaded?: (data: { 
    bulletinClasse?: BulletinClasseData; 
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  }) => void;
}

const ImportTab = ({ onNext, onDataLoaded }: ImportTabProps) => {
  const { toast } = useToast();
  const [bulletinClasse, setBulletinClasse] = useState<BulletinClasseData | null>(null);
  const [bulletinsEleves, setBulletinsEleves] = useState<BulletinEleveData[]>([]);
  const [classeCSV, setClasseCSV] = useState<ClasseDataCSV | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers CSV sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const data = await parseCSVClasse(file);
      
      if (data) {
        setClasseCSV(data);
        toast({
          title: "✓ Fichier CSV chargé",
          description: `${data.statistiques.totalEleves} élèves • ${data.matieres.length} matières`,
        });
        onDataLoaded?.({ bulletinClasse, bulletinsEleves, classeCSV: data });
      } else {
        throw new Error("Impossible de parser le fichier CSV");
      }
    } catch (error) {
      console.error('Erreur lors du traitement du CSV:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier CSV",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'classe' | 'eleve') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers PDF sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      if (type === 'classe') {
        const text = await extractTextFromPDF(file);
        const data = parseBulletinClasse(text);
        if (data) {
          setBulletinClasse(data);
          toast({
            title: "✓ Bulletin de classe chargé",
            description: `${data.matieres.length} matières détectées`,
          });
          onDataLoaded?.({ bulletinClasse: data, bulletinsEleves, classeCSV });
        } else {
          throw new Error("Impossible de parser le bulletin de classe");
        }
      } else {
        // Parse tous les bulletins élèves du PDF (une page = un élève)
        const bulletins = await parseBulletinsElevesFromPDF(file);
        if (bulletins.length > 0) {
          setBulletinsEleves(prev => [...prev, ...bulletins]);
          toast({
            title: "✓ Bulletins élèves chargés",
            description: `${bulletins.length} élève${bulletins.length > 1 ? 's' : ''} extrait${bulletins.length > 1 ? 's' : ''} du PDF`,
          });
          onDataLoaded?.({ bulletinClasse, bulletinsEleves: [...bulletinsEleves, ...bulletins], classeCSV });
        } else {
          throw new Error("Aucun bulletin élève trouvé dans le PDF");
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement du PDF:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de lire le fichier PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset input pour permettre de charger le même fichier à nouveau
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Import des données</h2>
        <p className="text-muted-foreground">Chargez vos bulletins PRONOTE au format PDF</p>
      </div>

      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>Comment exporter depuis PRONOTE ?</AlertTitle>
        <AlertDescription>
          <strong>3 types de fichiers nécessaires :</strong>
          <br />
          <strong>1. CSV Résultats de classe</strong> : PRONOTE → Notes → Tableau des moyennes → Exporter (CSV)
          <br />
          <strong>2. PDF Bulletin de classe</strong> : PRONOTE → Bulletins → Exporter (PDF classe)
          <br />
          <strong>3. PDF Bulletins individuels</strong> : PRONOTE → Bulletins → Exporter (PDF par élève)
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`hover:shadow-md transition-smooth cursor-pointer border-2 ${classeCSV ? 'border-success bg-success/5' : 'border-dashed hover:border-primary'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${classeCSV ? 'bg-success/20' : 'bg-primary/10'}`}>
                {classeCSV ? (
                  <FileCheck className="h-6 w-6 text-success" />
                ) : (
                  <Table2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Résultats CSV</CardTitle>
                <CardDescription>Tableau des moyennes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 transition-smooth ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'}`}>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isProcessing ? 'Traitement...' : 'Charger le CSV'}
              </span>
              {classeCSV && (
                <span className="text-xs text-success font-medium">
                  ✓ {classeCSV.statistiques.totalEleves} élèves
                </span>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleCSVUpload}
                disabled={isProcessing}
              />
            </label>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-smooth cursor-pointer border-2 ${bulletinClasse ? 'border-success bg-success/5' : 'border-dashed hover:border-primary'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bulletinClasse ? 'bg-success/20' : 'bg-primary/10'}`}>
                {bulletinClasse ? (
                  <FileCheck className="h-6 w-6 text-success" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Bulletin de classe</CardTitle>
                <CardDescription>PDF - Moyennes générales par matière</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 transition-smooth ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'}`}>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isProcessing ? 'Traitement en cours...' : 'Cliquez pour charger le PDF'}
              </span>
              {bulletinClasse && (
                <span className="text-xs text-success font-medium">
                  ✓ {bulletinClasse.classe} - {bulletinClasse.matieres.length} matières
                </span>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => handleFileUpload(e, 'classe')}
                disabled={isProcessing}
              />
            </label>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-smooth cursor-pointer border-2 ${bulletinsEleves.length > 0 ? 'border-accent bg-accent/5' : 'border-dashed hover:border-accent'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bulletinsEleves.length > 0 ? 'bg-accent/20' : 'bg-accent/10'}`}>
                {bulletinsEleves.length > 0 ? (
                  <FileCheck className="h-6 w-6 text-accent" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-accent" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Bulletins individuels</CardTitle>
                <CardDescription>PDF - Un fichier par élève</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 transition-smooth ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'border-muted-foreground/25 hover:border-accent hover:bg-accent/5'}`}>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isProcessing ? 'Traitement en cours...' : 'Cliquez pour charger un PDF'}
              </span>
              {bulletinsEleves.length > 0 && (
                <span className="text-xs text-accent font-medium">
                  ✓ {bulletinsEleves.length} élève(s) chargé(s)
                </span>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf" 
                onChange={(e) => handleFileUpload(e, 'eleve')}
                disabled={isProcessing}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {(classeCSV || bulletinClasse || bulletinsEleves.length > 0) && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Fichiers chargés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {classeCSV && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Table2 className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium">Résultats CSV - Classe entière</p>
                      <p className="text-xs text-muted-foreground">
                        {classeCSV.statistiques.totalEleves} élèves • {classeCSV.matieres.length} matières • Moy: {classeCSV.statistiques.moyenneClasse.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-success">✓ Validé</span>
                </div>
              )}
              
              {bulletinClasse && (
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium">Bulletin de classe - {bulletinClasse.classe}</p>
                      <p className="text-xs text-muted-foreground">
                        {bulletinClasse.trimestre} • {bulletinClasse.matieres.length} matières
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-success">✓ Validé</span>
                </div>
              )}
              
              {bulletinsEleves.map((eleve, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">{eleve.prenom} {eleve.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {eleve.matieres.length} matières • Moyenne: {(eleve.matieres.reduce((sum, m) => sum + m.moyenneEleve, 0) / eleve.matieres.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-accent">✓ Validé</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {!classeCSV && !bulletinClasse && bulletinsEleves.length === 0 && (
        <Alert variant="default" className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertTitle>Aucun fichier chargé</AlertTitle>
          <AlertDescription>
            Veuillez charger au minimum le fichier CSV des résultats pour pouvoir effectuer l'analyse de classe.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          size="lg" 
          className="gap-2"
          disabled={!classeCSV}
        >
          Continuer vers l'analyse
        </Button>
      </div>
    </div>
  );
};

export default ImportTab;
