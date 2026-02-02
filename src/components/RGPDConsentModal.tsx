import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, CheckCircle2, ExternalLink } from "lucide-react";

const APP_DISPLAY_NAMES: Record<string, string> = {
  classcouncil: "ClassCouncil AI",
  reportcard: "ReportCard AI",
  quizmaster: "QuizMaster AI",
};

interface RGPDConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  appName: string;
}

export function RGPDConsentModal({ isOpen, onAccept, appName }: RGPDConsentModalProps) {
  const displayName = APP_DISPLAY_NAMES[appName] || appName;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              🔒 Protection de vos données
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Avant d'utiliser <strong className="text-foreground">{displayName}</strong>, veuillez prendre 
            connaissance des informations suivantes :
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Traitement local</p>
              <p className="text-sm text-muted-foreground">
                Les données de vos élèves sont stockées uniquement sur votre appareil (navigateur)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Anonymisation</p>
              <p className="text-sm text-muted-foreground">
                Avant toute génération IA, les prénoms sont remplacés par des balises et les noms ne sont jamais transmis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Pas de stockage serveur</p>
              <p className="text-sm text-muted-foreground">
                Aucune base de données ne conserve les informations de vos élèves
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Conformité RGPD</p>
              <p className="text-sm text-muted-foreground">
                Nos pratiques respectent le RGPD et le cadre IA en éducation du Ministère de l'Éducation nationale
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button variant="outline" asChild className="sm:flex-1">
            <Link to="/politique-confidentialite" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              En savoir plus
            </Link>
          </Button>
          <Button onClick={onAccept} className="sm:flex-1">
            ✓ J'ai compris et j'accepte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
