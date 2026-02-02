import { Link } from "react-router-dom";
import { Info } from "lucide-react";

interface AIGenerationWarningProps {
  className?: string;
}

export function AIGenerationWarning({ className = "" }: AIGenerationWarningProps) {
  return (
    <div className={`flex items-start gap-2 text-sm text-muted-foreground ${className}`}>
      <Info className="h-4 w-4 mt-0.5 shrink-0" />
      <p>
        Les appréciations sont générées par IA à partir de données anonymisées.
        Relisez et adaptez chaque texte avant utilisation.{" "}
        <Link 
          to="/politique-confidentialite#ia" 
          className="text-primary hover:underline"
        >
          En savoir plus
        </Link>
      </p>
    </div>
  );
}
