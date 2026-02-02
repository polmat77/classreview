import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DarkModeToggle from '@/components/DarkModeToggle';

const logo = "/images/logos/ReportCardAI_logo.png";

interface ReportCardMobileHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ReportCardMobileHeader({ isSidebarOpen, onToggleSidebar }: ReportCardMobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      <div className="flex items-center gap-2">
        <img 
          src={logo} 
          alt="ReportCard AI Logo" 
          className="h-10 w-auto object-contain"
        />
        <span className="font-bold text-lg text-slate-800 dark:text-white">
          ReportCard<span className="text-amber-500">AI</span>
        </span>
      </div>
      
      <DarkModeToggle />
    </header>
  );
}

export default ReportCardMobileHeader;