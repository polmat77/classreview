import { Link, useLocation } from 'react-router-dom';
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
import logo from "@/assets/logo.png";
import { Button } from '@/components/ui/button';
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
  const location = useLocation();

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
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-navy to-navy-dark text-white transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-20" : "w-[280px]"
        )}
      >
        {/* Logo Section */}
        <Link 
          to="/"
          className={cn(
            "flex-shrink-0 flex items-center justify-center py-5 animate-slide-in-left group",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          <img 
            src={logo} 
            alt="AIProject4You" 
            className={cn(
              "object-contain transition-all duration-300 group-hover:scale-105",
              isCollapsed ? "h-12 w-12" : "w-full max-w-[240px] h-auto"
            )}
          />
        </Link>

        {/* Back to AIProject4You link */}
        <div className="px-3 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2 text-sm",
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
        <div className="px-3 mb-4">
          <div className={cn(
            "rounded-lg bg-success/20 border border-success/30 p-3",
            isCollapsed && "p-2"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-success-light flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="font-semibold text-white text-sm">ReportCard AI</p>
                  <p className="text-xs text-white/60">Actuel</p>
                </div>
              )}
            </div>
          </div>

          {/* Link to ClassCouncil AI */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/classcouncil-ai"
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2 mt-2 text-sm",
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
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />

        {/* Workflow Steps */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {!isCollapsed && (
            <p className="text-[11px] uppercase tracking-wider text-white/50 px-3 mb-3 font-medium">
              Progression
            </p>
          )}
          {workflowSteps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const Icon = step.icon;
            const status = getStepStatus(step.id);

            const content = (
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "relative flex items-center gap-3 w-full rounded-lg transition-all duration-200 text-left px-3 py-3",
                  isActive && "bg-primary/20",
                  !isActive && isAccessible && "hover:bg-white/10",
                  !isAccessible && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Step indicator */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  isActive && "bg-primary text-white relative",
                  isCompleted && !isActive && "bg-success text-white",
                  !isActive && !isCompleted && "bg-white/10 text-white/60"
                )}>
                  {isCompleted && !isActive ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold text-sm">{step.id}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm truncate",
                      isActive ? "text-white" : "text-white/80"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-xs truncate",
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
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      {content}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-navy text-white border-navy-light">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-white/60">{status}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div 
                key={step.id}
                className="animate-slide-in-left"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {content}
              </div>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />

        {/* Secondary Navigation */}
        <nav className="px-3 py-3 space-y-1">
          {/* New Session */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2.5 text-sm",
                      "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <RotateCcw className="h-5 w-5 flex-shrink-0" />
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
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2.5 text-sm",
                  "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Shield className="h-5 w-5 flex-shrink-0" />
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
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2.5 text-sm",
                  "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
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

        {/* Spacer */}
        <div className="flex-grow min-h-4" />

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-4 text-center animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            <span className="inline-block bg-gradient-to-r from-success to-success-light text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-1">
              👨‍🏫 Créé par un prof
            </span>
            <p className="text-xs text-white/50">pour les profs</p>
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