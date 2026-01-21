import { Menu, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportCardMobileHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ReportCardMobileHeader({ isSidebarOpen, onToggleSidebar }: ReportCardMobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-navy to-navy-dark text-white shadow-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="text-white hover:bg-white/10"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-success to-success-light flex items-center justify-center">
          <FileSpreadsheet className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg">
          ReportCard
          <span className="ml-1 bg-gradient-to-r from-success to-success-light text-white px-1.5 py-0.5 rounded text-xs font-bold">
            AI
          </span>
        </span>
      </div>
      
      {/* Spacer for centering */}
      <div className="w-10" />
    </header>
  );
}

export default ReportCardMobileHeader;