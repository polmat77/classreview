import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  BookOpen, 
  PenLine, 
  Download,
  Settings,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DarkModeToggle from '@/components/DarkModeToggle';
import UserMenu from '@/components/auth/UserMenu';

const logo = "/images/logos/ClassCouncilAI_logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navigationItems = [
  { id: 'analyse', label: 'Résultats de la classe', icon: BarChart3 },
  { id: 'matieres', label: 'Appréciation de la Classe', icon: BookOpen },
  { id: 'appreciations', label: 'Appréciations individuelles', icon: PenLine },
  { id: 'export', label: 'Bilan', icon: Download },
];

const secondaryItems = [
  { id: 'settings', label: 'Paramètres', icon: Settings, isLink: false },
  { id: 'privacy', label: 'Confidentialité', icon: Shield, isLink: true, to: '/politique-confidentialite' },
  { id: 'help', label: 'Aide', icon: HelpCircle, isLink: false },
];

export function AppSidebar({ activeTab, onTabChange, isCollapsed, onCollapsedChange }: AppSidebarProps) {
  const location = useLocation();

  const NavButton = ({ item, isActive, onClick, isSecondary = false }: { 
    item: typeof navigationItems[0], 
    isActive: boolean, 
    onClick: () => void,
    isSecondary?: boolean 
  }) => {
    const Icon = item.icon;
    const content = (
      <button
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-3 w-full rounded-xl transition-all duration-200 text-left",
          isSecondary ? "px-4 py-2.5 text-sm" : "px-4 py-3",
          isActive 
            ? "bg-amber-50 text-amber-700 font-medium border border-amber-200" 
            : "text-slate-600 hover:bg-slate-50 transition-colors"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-amber-600" : "text-slate-500"
        )} />
        {!isCollapsed && (
          <span className="truncate">{item.label}</span>
        )}
        {isActive && !isCollapsed && (
          <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-20" : "w-[280px]"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex-shrink-0 py-5 border-b border-slate-100 dark:border-slate-800",
          isCollapsed ? "px-3" : "px-5"
        )}>
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="ClassCouncil AI" 
              className={cn(
                "object-contain transition-all duration-300 flex-shrink-0",
                isCollapsed ? "w-12 h-12" : "w-12 h-12"
              )}
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-slate-800 dark:text-white font-bold text-lg leading-tight">
                  ClassCouncil<span className="text-amber-500">AI</span>
                </span>
                <span className="text-slate-400 text-xs">Conseil de classe</span>
              </div>
            )}
          </div>
        </div>

        {/* Back to ClassCouncil AI landing page */}
        <div className="px-4 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/classcouncil-ai"
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg transition-all duration-200 px-4 py-2.5 text-sm",
                  "bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium shadow-sm hover:shadow-md hover:from-amber-500 hover:to-amber-600"
                )}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Retour à ClassCouncil AI</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Retour à ClassCouncil AI
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation Title */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navigationItems.map((item, index) => (
            <div key={item.id}>
              <NavButton 
                item={item} 
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            </div>
          ))}
        </nav>

        {/* Separator */}
        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

        {/* Secondary Navigation */}
        <nav className="px-3 py-2 space-y-1 border-t border-slate-100 dark:border-slate-800">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isLink && item.to) {
              const isActive = location.pathname === item.to;
              const content = (
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl transition-all duration-200 px-4 py-2.5 text-sm",
                    isActive 
                      ? "bg-amber-50 text-amber-700" 
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.id}>{content}</div>;
            }

            return (
              <NavButton 
                key={item.id}
                item={item} 
                isActive={false}
                onClick={() => {}}
                isSecondary
              />
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-grow min-h-4" />

        {/* User Menu */}
        <div className={cn(
          "border-t border-slate-100 dark:border-slate-800",
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

export default AppSidebar;
