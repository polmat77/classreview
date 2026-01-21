import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Upload,
  MessageSquare,
  FileText,
  BarChart3,
  Home,
  RotateCcw,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

interface ReportCardSidebarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  hasStudents: boolean;
  hasObservations: boolean;
  hasAppreciations: boolean;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onReset: () => void;
}

const workflowSteps = [
  { id: 1, label: 'Import des données', icon: Upload, description: 'PDF ou saisie' },
  { id: 2, label: 'Observations', icon: MessageSquare, description: 'Comportement' },
  { id: 3, label: 'Appréciations', icon: FileText, description: 'Génération IA' },
  { id: 4, label: 'Bilan de classe', icon: BarChart3, description: 'Synthèse' },
];

// Composant séparé pour faciliter le remplacement du logo
const AppLogo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  // TODO: Remplacer par le vrai logo quand disponible
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div className={cn(
          "flex items-center justify-center bg-gradient-to-br from-success to-primary rounded-xl shadow-lg",
          isCollapsed ? "w-10 h-10" : "w-12 h-12"
        )}>
          <FileSpreadsheet className={cn("text-white", isCollapsed ? "w-5 h-5" : "w-6 h-6")} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center border-2 border-navy">
          <Sparkles className="w-2 h-2 text-white" />
        </div>
      </div>
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-white font-bold text-base leading-tight">ReportCard AI</span>
          <span className="text-white/50 text-[10px]">Génération d'appréciations</span>
        </div>
      )}
    </div>
  );
};

export function ReportCardSidebar({ 
  currentStep, 
  onStepClick, 
  hasStudents,
  hasObservations,
  hasAppreciations,
  isCollapsed, 
  onCollapsedChange,
  onReset,
}: ReportCardSidebarProps) {

  const isStepAccessible = (stepId: number) => {
    switch (stepId) {
      case 1:
        return true;
      case 2:
        return hasStudents;
      case 3:
        return hasStudents;
      case 4:
        return hasStudents && hasAppreciations;
      default:
        return false;
    }
  };

  const isStepCompleted = (stepId: number) => {
    switch (stepId) {
      case 1:
        return hasStudents;
      case 2:
        return hasObservations;
      case 3:
        return hasAppreciations;
      case 4:
        return false;
      default:
        return false;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (currentStep === stepId) return 'En cours';
    if (isStepCompleted(stepId)) return 'Complété';
    if (!isStepAccessible(stepId)) return 'Verrouillé';
    return 'À faire';
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-navy to-navy-dark text-white transition-all duration-300",
          "overflow-y-auto scrollbar-hide",
          isCollapsed ? "w-20" : "w-[260px]"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex-shrink-0 py-4",
          isCollapsed ? "px-3" : "px-4"
        )}>
          <AppLogo isCollapsed={isCollapsed} />
        </div>

        {/* Back to AIProject4You */}
        <div className="px-2 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-3 py-2 text-xs",
                  "text-gold/80 hover:bg-gold/10 hover:text-gold border border-gold/30 hover:border-gold/50"
                )}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Retour à AIProject4You</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                Retour à AIProject4You
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* App Switcher */}
        <div className="px-2 mb-3">
          <div className={cn(
            "rounded-lg bg-success/20 border border-success/30 p-2",
            isCollapsed && "p-2"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success to-success-light flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-xs">ReportCard AI</p>
                </div>
              )}
              {!isCollapsed && (
                <Badge className="bg-success text-white text-[10px] px-1.5 py-0.5">
                  Actuel
                </Badge>
              )}
            </div>
          </div>

          {/* Link to ClassCouncil AI */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/classcouncil-ai"
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-3 py-2 mt-1.5 text-xs",
                  "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">ClassCouncil AI</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                ClassCouncil AI
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-3" />

        {/* Workflow Steps */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {!isCollapsed && (
            <p className="text-[10px] uppercase tracking-wider text-white/50 px-3 mb-2 font-medium">
              Progression
            </p>
          )}
          {workflowSteps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const status = getStepStatus(step.id);

            const content = (
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "relative flex items-center gap-2 w-full rounded-lg transition-all duration-200 text-left px-2 py-2",
                  isActive && "bg-primary/20",
                  !isActive && isAccessible && "hover:bg-white/10",
                  !isAccessible && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Step indicator */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all text-xs",
                  isActive && "bg-primary text-white relative",
                  isCompleted && !isActive && "bg-success text-white",
                  !isActive && !isCompleted && "bg-white/10 text-white/60"
                )}>
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-xs truncate",
                      isActive ? "text-white" : "text-white/80"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-[10px] truncate",
                      isActive ? "text-primary-light" : "text-white/50"
                    )}>
                      {status}
                    </p>
                  </div>
                )}

                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-gradient-to-b from-success to-success-light rounded-r-full" />
                )}
              </button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <div 
                      className="animate-slide-in-left"
                      style={{ animationDelay: `${0.05 + index * 0.03}s` }}
                    >
                      {content}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                    <p className="font-medium text-xs">{step.label}</p>
                    <p className="text-[10px] text-white/60">{status}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div 
                key={step.id}
                className="animate-slide-in-left"
                style={{ animationDelay: `${0.05 + index * 0.03}s` }}
              >
                {content}
              </div>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-3" />

        {/* Secondary Navigation */}
        <nav className="px-2 py-2 space-y-0.5">
          {/* New Session */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-3 py-2 text-xs",
                      "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <RotateCcw className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Nouvelle session</span>}
                  </button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                  Nouvelle session
                </TooltipContent>
              )}
            </Tooltip>
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

          {/* Privacy Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/politique-confidentialite"
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-3 py-2 text-xs",
                  "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Confidentialité</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                Confidentialité
              </TooltipContent>
            )}
          </Tooltip>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-3 py-2 text-xs",
                  "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Aide</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                Aide
              </TooltipContent>
            )}
          </Tooltip>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-3 py-3 text-center animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            <span className="inline-block bg-gradient-to-r from-success to-success-light text-white px-2 py-1 rounded-full text-[10px] font-semibold mb-0.5">
              👨‍🏫 Créé par un prof
            </span>
            <p className="text-[10px] text-white/50">pour les profs</p>
          </div>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-success border-2 border-navy text-white hover:bg-success-light hover:scale-110 transition-all shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  );
}

export default ReportCardSidebar;