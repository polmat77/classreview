import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home, FileText, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportCardLayoutProps {
  children: ReactNode;
  onReset: () => void;
}

const ReportCardLayout = ({ children, onReset }: ReportCardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy text-white border-b border-navy-light">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">AIProject4You</span>
            </Link>
            <span className="text-white/40">|</span>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              <span className="font-semibold">ReportCard AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Accueil</span>
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nouvelle session</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Réinitialiser la session ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera toutes les données actuelles (élèves, observations, appréciations). Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset} className="bg-destructive hover:bg-destructive/90">
                    Réinitialiser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          <p>
            ReportCard AI fait partie de{" "}
            <Link to="/" className="text-primary hover:underline">
              AIProject4You
            </Link>
            {" "}- Créé par un enseignant, pour les enseignants
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReportCardLayout;
