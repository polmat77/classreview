import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle, AlertTriangle, Target } from "lucide-react";
import { EleveData } from "@/utils/csvParser";
import {
  getSubjectAverages,
  getPositivePoints,
  getWarningPoints,
  getSuggestedActions,
  ClassAnalysisData,
  SubjectStats,
} from "@/utils/statisticsCalculations";
import { ClasseDataCSV } from "@/utils/csvParser";

interface AIRecommendationsProps {
  classeCSV: ClasseDataCSV;
}

const AIRecommendations = ({ classeCSV }: AIRecommendationsProps) => {
  const subjects = getSubjectAverages(classeCSV);
  
  const analysisData: ClassAnalysisData = {
    eleves: classeCSV.eleves,
    subjects,
    matieres: classeCSV.matieres,
  };

  const positivePoints = getPositivePoints(analysisData);
  const warningPoints = getWarningPoints(analysisData);
  const suggestedActions = getSuggestedActions(analysisData);

  return (
    <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-foreground">
          <Lightbulb className="h-5 w-5" />
          Recommandations pour le conseil de classe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Positive points */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="flex items-center gap-2 font-semibold text-sm mb-3 text-primary-foreground">
              <CheckCircle className="h-4 w-4" />
              Points à valoriser
            </h4>
            <ul className="space-y-2">
              {positivePoints.map((point, index) => (
                <li key={index} className="text-sm text-primary-foreground/90 leading-relaxed">
                  • {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning points */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="flex items-center gap-2 font-semibold text-sm mb-3 text-primary-foreground">
              <AlertTriangle className="h-4 w-4" />
              Points d'attention
            </h4>
            <ul className="space-y-2">
              {warningPoints.map((point, index) => (
                <li key={index} className="text-sm text-primary-foreground/90 leading-relaxed">
                  • {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h4 className="flex items-center gap-2 font-semibold text-sm mb-3 text-primary-foreground">
              <Target className="h-4 w-4" />
              Actions suggérées
            </h4>
            <ul className="space-y-2">
              {suggestedActions.map((action, index) => (
                <li key={index} className="text-sm text-primary-foreground/90 leading-relaxed">
                  → {action}
                </li>
              ))}
              {suggestedActions.length === 0 && (
                <li className="text-sm text-primary-foreground/70">
                  Aucune action spécifique requise
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
