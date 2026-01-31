import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import ReportCardSidebar from "./ReportCardSidebar";
import ReportCardMobileHeader from "./ReportCardMobileHeader";
import AppFooter from "@/components/AppFooter";

interface ReportCardLayoutProps {
  children: ReactNode;
  currentStep: number;
  onStepClick: (step: number) => void;
  hasStudents: boolean;
  hasObservations: boolean;
  hasAppreciations: boolean;
  onReset: () => void;
}

const ReportCardLayout = ({ 
  children, 
  currentStep,
  onStepClick,
  hasStudents,
  hasObservations,
  hasAppreciations,
  onReset,
}: ReportCardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on step change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentStep]);

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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <ReportCardMobileHeader 
        isSidebarOpen={isMobileSidebarOpen} 
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
      />

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile as drawer */}
      <div className={cn(
        "lg:block",
        isMobileSidebarOpen ? "block" : "hidden"
      )}>
        <ReportCardSidebar 
          currentStep={currentStep}
          onStepClick={onStepClick}
          hasStudents={hasStudents}
          hasObservations={hasObservations}
          hasAppreciations={hasAppreciations}
          isCollapsed={isCollapsed}
          onCollapsedChange={setIsCollapsed}
          onReset={onReset}
        />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 flex flex-col",
          "lg:ml-[260px]",
          isCollapsed && "lg:ml-20",
          "pt-16 lg:pt-0"
        )}
      >
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
        <AppFooter />
      </main>
    </div>
  );
};

export default ReportCardLayout;
