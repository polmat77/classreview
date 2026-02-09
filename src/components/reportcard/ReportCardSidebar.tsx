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
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';

const reportCardLogo = "/images/logos/ReportCardAI_logo.png";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DarkModeToggle from '@/components/DarkModeToggle';
import UserMenu from '@/components/auth/UserMenu';
import { CreditsBadge } from '@/components/credits';
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
  { id: 2.5, label: 'Par matière', icon: BookOpen, description: 'Optionnel', isOptional: true },
  { id: 3, label: 'Appréciations', icon: FileText, description: 'Génération IA' },
  { id: 4, label: 'Bilan de classe', icon: BarChart3, description: 'Synthèse' },
];

// Composant Logo avec image
const AppLogo = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={reportCardLogo} 
        alt="ReportCard AI Logo" 
        className={cn(
          "flex-shrink-0 object-contain",
          isCollapsed ? "h-12 w-auto" : "h-12 w-auto"
        )}
      />
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-slate-800 dark:text-white font-bold text-lg leading-tight">
            ReportCard<span className="text-amber-500">AI</span>
          </span>
          <span className="text-slate-400 text-xs">Génération d'appréciations</span>
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
      case 2.5:
        return hasStudents && hasObservations;
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
      case 2.5:
        return currentStep > 2.5; // Optional step is "completed" if we've passed it
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
    if (isStepCompleted(stepId)) return 'Terminé';
    if (!isStepAccessible(stepId)) return 'Verrouillé';
    return 'À faire';
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300",
          "overflow-y-auto scrollbar-hide",
          isCollapsed ? "w-20" : "w-[260px]"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex-shrink-0 py-5 border-b border-slate-100 dark:border-slate-800",
          isCollapsed ? "px-3" : "px-5"
        )}>
          <AppLogo isCollapsed={isCollapsed} />
        </div>

        {/* Back to ReportCard AI landing page */}
        <div className="px-4 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/reportcard-ai"
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-4 py-2.5 text-sm",
                  "bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium shadow-sm hover:shadow-md hover:from-amber-500 hover:to-amber-600"
                )}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Retour à ReportCard AI</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Retour à ReportCard AI
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* App Switcher */}
        <div className="px-4 py-2">
          <div className={cn(
            "rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3",
            isCollapsed && "p-2"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-amber-800 dark:text-amber-400 text-sm">ReportCard AI</span>
              )}
              {!isCollapsed && (
                <Badge className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 hover:bg-amber-600">
                  Actuel
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Title */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Progression
            </span>
          </div>
        )}

        {/* Workflow Steps */}
        <nav className="flex-1 px-4 space-y-1">
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
                  "flex items-start gap-3 w-full rounded-xl transition-all duration-200 text-left px-3 py-3",
                  isActive && "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                  !isActive && isAccessible && "hover:bg-slate-50 dark:hover:bg-slate-800",
                  !isAccessible && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Step indicator */}
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all text-sm font-semibold",
                  isActive && "bg-amber-500 text-white",
                  isCompleted && !isActive && "bg-emerald-500 text-white",
                  !isActive && !isCompleted && "bg-slate-200 text-slate-500"
                )}>
                  {isCompleted && !isActive ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.id === 2.5 ? "2b" : step.id}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-xs",
                      isActive ? "text-amber-600" : 
                      isCompleted ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {status}
                    </p>
                  </div>
                )}
              </button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <div>{content}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                    <p className="font-medium text-xs">{step.label}</p>
                    <p className="text-[10px] text-white/60">{status}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={step.id}>{content}</div>;
          })}
        </nav>

        {/* Separator */}
        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4" />

        {/* Secondary Navigation */}
        <nav className="px-4 py-2 space-y-1 border-t border-slate-100 dark:border-slate-800">
          {/* New Session */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2 text-sm",
                      "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <RotateCcw className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Nouvelle session</span>}
                  </button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
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
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2 text-sm",
                  "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Confidentialité</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Confidentialité
              </TooltipContent>
            )}
          </Tooltip>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2 text-sm",
                  "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Aide</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Aide
              </TooltipContent>
            )}
          </Tooltip>
        </nav>

        {/* Spacer */}
        <div className="flex-grow min-h-4" />

        {/* Credits Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-border">
            <CreditsBadge />
          </div>
        )}

        {/* User Menu */}
        <div className={cn(
          "border-t border-border",
          isCollapsed ? "px-3 py-3" : "px-4 py-3"
        )}>
          <UserMenu variant="sidebar" isCollapsed={isCollapsed} />
        </div>

        {/* Dark Mode Toggle */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <DarkModeToggle variant="switch" showLabel />
          </div>
        )}

        {/* Footer Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-medium rounded-full">
              🎓 Créé par un prof
            </span>
            <p className="text-xs text-slate-400 mt-1">pour les profs</p>
          </div>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-amber-500 border-2 border-white text-white hover:bg-amber-600 hover:scale-110 transition-all shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  );
}

export default ReportCardSidebar;
