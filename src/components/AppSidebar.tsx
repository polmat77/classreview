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
  ChevronRight
} from 'lucide-react';
import logo from "@/assets/logo.png";
import { Button } from '@/components/ui/button';
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
          "relative flex items-center gap-3 w-full rounded-lg transition-all duration-200 text-left",
          isSecondary ? "px-3 py-2.5 text-sm" : "px-3 py-3",
          isActive 
            ? "bg-sidebar-primary/20 text-white" 
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-gradient-to-b from-gold to-gold-light rounded-r-full" />
        )}
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive && "text-gold"
        )} />
        {!isCollapsed && (
          <span className="font-medium truncate">{item.label}</span>
        )}
        {isActive && !isCollapsed && (
          <div className="absolute right-3 w-2 h-2 bg-gold rounded-full animate-pulse-gold" />
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-navy text-white border-navy-light">
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
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-gradient-to-b from-navy to-navy-dark text-white transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-20" : "w-[280px]"
        )}
      >
        {/* Logo Section - seamlessly blended into navy background */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center pt-8 pb-6 animate-slide-in-left",
          isCollapsed ? "px-3" : "px-6"
        )}>
          <img 
            src={logo} 
            alt="ClassCouncil AI" 
            className={cn(
              "object-contain transition-all duration-300 hover:scale-105",
              "mix-blend-multiply opacity-95",
              "filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
              isCollapsed ? "h-12 w-12" : "w-full max-w-[180px] h-auto"
            )}
            style={{ 
              background: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }}
          />
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {!isCollapsed && (
            <p className="text-[11px] uppercase tracking-wider text-white/50 px-3 mb-2 font-medium">
              Navigation
            </p>
          )}
          {navigationItems.map((item, index) => (
            <div 
              key={item.id}
              className="animate-slide-in-left"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <NavButton 
                item={item} 
                isActive={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
              />
            </div>
          ))}
        </nav>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />

        {/* Secondary Navigation */}
        <nav className="px-3 py-3 space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            
            if (item.isLink && item.to) {
              const isActive = location.pathname === item.to;
              const content = (
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-lg transition-all duration-200 px-3 py-2.5 text-sm",
                    isActive 
                      ? "bg-sidebar-primary/20 text-white" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-navy text-white border-navy-light">
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

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-4 py-4 text-center animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            <span className="inline-block bg-gradient-to-r from-gold to-gold-light text-navy px-3 py-1.5 rounded-full text-xs font-semibold mb-1">
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
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gold border-2 border-navy text-navy hover:bg-gold-light hover:scale-110 transition-all shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  );
}

export default AppSidebar;
