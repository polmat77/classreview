import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import AppSidebar from './AppSidebar';
import MobileHeader from './MobileHeader';
import AppFooter from './AppFooter';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on tab change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Mobile Header */}
      <MobileHeader 
        isSidebarOpen={isMobileSidebarOpen} 
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
      />

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-30 transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile as drawer */}
      <div className={cn(
        "lg:block",
        isMobileSidebarOpen ? "block" : "hidden"
      )}>
        <AppSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
        />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 flex flex-col",
          // Desktop margins
          "lg:ml-[280px]",
          isCollapsed && "lg:ml-20",
          // Mobile top padding for header
          "pt-16 lg:pt-0"
        )}
      >
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
        <AppFooter />
      </main>
    </div>
  );
}

export default MainLayout;
