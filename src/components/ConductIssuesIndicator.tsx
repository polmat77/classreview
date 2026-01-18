import { ConductAnalysis } from "@/types/attribution";
import { AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConductIssuesIndicatorProps {
  analysis: ConductAnalysis;
  compact?: boolean;
  className?: string;
}

const ConductIssuesIndicator = ({
  analysis,
  compact = false,
  className,
}: ConductIssuesIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!analysis.hasConductIssues) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-emerald-600", className)}>
        <CheckCircle className="h-4 w-4" />
        <span className={compact ? "hidden sm:inline" : ""}>
          Aucun problème de conduite détecté
        </span>
      </div>
    );
  }
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors">
        <AlertTriangle className="h-4 w-4" />
        <span>
          Problèmes de conduite détectés ({analysis.relevantExcerpts.length})
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
          <p className="text-xs font-medium text-amber-800 mb-2">
            🔍 Détails des problèmes de conduite détectés
          </p>
          
          {analysis.relevantExcerpts.map((excerpt, index) => (
            <div 
              key={index} 
              className="text-sm border-l-2 border-amber-400 pl-3 py-1"
            >
              <span className="font-medium text-amber-900">
                📚 {excerpt.subject} :
              </span>
              <p className="text-amber-800 mt-0.5 italic">
                "{excerpt.excerpt}"
              </p>
              <span className="inline-block mt-1 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                Mot-clé : {excerpt.keyword}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ConductIssuesIndicator;
