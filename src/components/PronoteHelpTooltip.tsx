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
          <>
            <p className="font-semibold mb-2">Comment exporter le tableau de résultats ?</p>
            <p className="text-muted-foreground text-sm">
              PRONOTE → Notes → Tableau des moyennes → Exporter (CSV ou PDF)
            </p>
          </>
        );
      case "bulletin":
        return (
          <>
            <p className="font-semibold mb-2">Comment exporter le bulletin de classe ?</p>
            <p className="text-muted-foreground text-sm">
              PRONOTE → Bulletins → Exporter → PDF (bulletin de classe)
            </p>
          </>
        );
      case "individuels":
        return (
          <>
            <p className="font-semibold mb-2">Comment exporter les bulletins individuels ?</p>
            <p className="text-muted-foreground text-sm">
              PRONOTE → Bulletins → Exporter → PDF (un fichier par élève ou tous les élèves)
            </p>
          </>
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
