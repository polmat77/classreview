import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PronoteHelpTooltipProps {
  type?: "all" | "resultats" | "bulletin" | "individuels";
}

const PronoteHelpTooltip = ({ type = "all" }: PronoteHelpTooltipProps) => {
  const getContent = () => {
    switch (type) {
      case "resultats":
        return (
          <div className="space-y-3">
            <p className="font-semibold">📄 Exporter un tableau de résultats en PDF</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-foreground">1️⃣ Menu Résultats → Tableau des moyennes par classe</p>
                <p className="text-muted-foreground">Sélectionnez la classe et la période concernées.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">2️⃣ Cliquez sur l'icône imprimante (ou CTRL + P)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">3️⃣ Dans la fenêtre d'impression :</p>
                <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                  <li>Cochez <strong>PDF</strong> comme type de sortie</li>
                  <li>Format A4, orientation Portrait ou Paysage</li>
                  <li>✅ Avec la moyenne générale</li>
                  <li>✅ Avec le nom du professeur</li>
                </ul>
              </div>
              <div className="bg-destructive/10 p-2 rounded-md border border-destructive/20">
                <p className="font-medium text-destructive">4️⃣ 🔒 Important : NE PAS cocher "Protégé"</p>
                <p className="text-muted-foreground text-xs">Sinon le PDF sera verrouillé et inutilisable.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">5️⃣ Cliquez sur "Générer" pour créer le PDF</p>
              </div>
            </div>
          </div>
        );
      case "bulletin":
        return (
          <div className="space-y-3">
            <p className="font-semibold">📄 Exporter le bulletin de classe en PDF</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-foreground">1️⃣ Rendez-vous dans PRONOTE</p>
                <p className="text-muted-foreground">Allez dans <strong>Bulletins → Saisie des appréciations</strong>. Sélectionnez la classe et la période concernées.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">2️⃣ Ouvrez la fenêtre d'impression</p>
                <p className="text-muted-foreground">Cliquez sur l'icône imprimante (ou CTRL + P).</p>
              </div>
              <div>
                <p className="font-medium text-foreground">3️⃣ Paramétrez votre export :</p>
                <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                  <li><strong>Documents à imprimer :</strong> Cochez "Bulletin des classes sélectionnées"</li>
                  <li><strong>Destinataires :</strong> Cochez "Professeurs principaux"</li>
                  <li><strong>Type de sortie :</strong> Choisissez <strong>PDF</strong></li>
                  <li>✅ Cochez "Ouvrir le dossier à l'issue de la génération"</li>
                </ul>
              </div>
              <div className="bg-destructive/10 p-2 rounded-md border border-destructive/20">
                <p className="font-medium text-destructive">⚠️ Important : NE PAS cocher "Protégé"</p>
                <p className="text-muted-foreground text-xs">Cela garantit que les bulletins PDF seront librement lisibles, imprimables et annotables.</p>
              </div>
            </div>
          </div>
        );
      case "individuels":
        return (
          <div className="space-y-3">
            <p className="font-semibold">📄 Exporter les bulletins individuels en PDF</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-foreground">1️⃣ Allez dans Bulletins → Saisie des appréciations</p>
                <p className="text-muted-foreground">Sélectionnez votre classe et la période concernée.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">2️⃣ Cliquez sur l'icône imprimante (ou CTRL + P)</p>
              </div>
              <div>
                <p className="font-medium text-foreground">3️⃣ Documents à imprimer :</p>
                <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                  <li>✅ Cochez <strong>"Bulletin élève"</strong></li>
                  <li>✅ Cochez <strong>"élèves des classes sélectionnées"</strong></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">4️⃣ Type de sortie :</p>
                <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                  <li>✅ Sélectionnez <strong>PDF</strong></li>
                  <li>✅ Cochez "Un document .pdf par ressource"</li>
                  <li>✅ Cochez "Ouvrir le dossier à l'issue de la génération"</li>
                </ul>
              </div>
              <div className="bg-destructive/10 p-2 rounded-md border border-destructive/20">
                <p className="font-medium text-destructive">⚠️ Important : NE PAS cocher "Protégé"</p>
                <p className="text-muted-foreground text-xs">Un fichier protégé limite la réimpression et l'annotation.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">🛠 Astuces (onglet Page) :</p>
                <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                  <li>✅ "Remonter le pied" pour l'appréciation en bas</li>
                  <li>✅ "Hauteur adaptée aux appréciations"</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground">5️⃣ Cliquez sur "Générer"</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <p className="font-semibold mb-3">Comment exporter depuis PRONOTE ?</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">1. Tableau de résultats</p>
                <p className="text-muted-foreground">
                  PRONOTE → Notes → Tableau des moyennes → Exporter (CSV ou PDF)
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">2. Bulletin de classe</p>
                <p className="text-muted-foreground">
                  PRONOTE → Bulletins → Exporter → PDF (classe)
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">3. Bulletins individuels</p>
                <p className="text-muted-foreground">
                  PRONOTE → Bulletins → Exporter → PDF (par élève)
                </p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">Comment exporter depuis PRONOTE ?</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        {getContent()}
      </PopoverContent>
    </Popover>
  );
};

export default PronoteHelpTooltip;
