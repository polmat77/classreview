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
          <div className="space-y-4">
            <p className="font-semibold">📄 Exporter un tableau de résultats en PDF depuis PRONOTE</p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">1️⃣ Menu "Notes"</p>
                <p className="text-muted-foreground">Sélectionnez la classe et la période concernées.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">2️⃣ Cliquez sur l'icône Imprimante (ou CTRL + P)</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">3️⃣ Dans la fenêtre "Impression des notes par professeur" :</p>
                <div className="ml-4 space-y-2 mt-2">
                  <div>
                    <p className="font-semibold text-foreground">Données à imprimer :</p>
                    <p className="text-muted-foreground">Sélectionnez : <strong>"Le service sélectionné"</strong></p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Type de sortie :</p>
                    <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                      <li>Sélectionnez : <strong>PDF</strong> (bouton radio)</li>
                      <li>☐ Protégé → <strong className="text-destructive">NE PAS COCHER</strong> 🔓</li>
                      <li>☑️ Imprimable</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Format :</p>
                    <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                      <li>A4</li>
                      <li>Orientation : <strong>Paysage</strong> (recommandé) 📄</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Mise en page :</p>
                    <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                      <li>Police : Arial</li>
                      <li>Taille standard : 8</li>
                      <li>Orientation : Paysage 📄</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">En-tête et pied de page :</p>
                    <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                      <li>☑️ Date et heure</li>
                      <li>☑️ Numéro de page</li>
                      <li>☑️ Nom de l'établissement</li>
                      <li>Titre de page : <strong>"Tableau de notes 4e2"</strong> (ou le nom de votre classe)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Options de liste :</p>
                    <ul className="text-muted-foreground ml-4 list-disc space-y-1">
                      <li>☑️ Alterner la couleur de fond des lignes</li>
                      <li>☑️ Élargir les colonnes pour occuper tout l'espace</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border-l-4 border-red-500 mt-4">
                <p className="font-semibold text-red-800 dark:text-red-400">⚠️ 🔒 Important : <strong>NE PAS cocher "Protégé"</strong></p>
                <p className="text-red-700 dark:text-red-300 text-xs mt-1">Sinon le PDF sera verrouillé et inutilisable.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">4️⃣ Cliquez sur "Générer" pour créer le PDF</p>
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
        <Button variant="ghost" size="sm" className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600 hover:text-white">
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
