import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, X } from "lucide-react";

const APP_DISPLAY_NAMES: Record<string, string> = {
  classcouncil: "ClassCouncil AI",
  reportcard: "ReportCard AI",
  quizmaster: "QuizMaster AI",
};

interface PrivacyBannerProps {
  isOpen: boolean;
  onAccept: () => void;
  appName: string;
}

export function PrivacyBanner({ isOpen, onAccept, appName }: PrivacyBannerProps) {
  const displayName = APP_DISPLAY_NAMES[appName] || appName;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Icon */}
            <div className="hidden sm:flex shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary sm:hidden" />
                  🔒 Protection de vos données
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 -mt-1 -mr-2"
                  onClick={onAccept}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">{displayName}</strong> traite vos fichiers{" "}
                  <strong className="text-foreground">localement dans votre navigateur</strong>.
                  Aucune donnée d'élève n'est stockée sur nos serveurs.
                </p>
                <p>
                  La génération d'appréciations utilise l'API{" "}
                  <strong className="text-foreground">OpenAI (ChatGPT)</strong>. Les données sont{" "}
                  <strong className="text-foreground">anonymisées</strong> avant envoi :{" "}
                  <span className="text-primary font-medium">
                    les noms des élèves ne sont jamais transmis
                  </span>
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" asChild className="sm:flex-1">
                  <Link to="/politique-confidentialite">
                    📄 En savoir plus
                  </Link>
                </Button>
                <Button onClick={onAccept} className="sm:flex-1">
                  ✓ J'ai compris
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
