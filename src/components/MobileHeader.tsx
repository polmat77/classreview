import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const logo = "/images/logos/ClassCouncilAI_logo.png";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MobileHeader({ isSidebarOpen, onToggleSidebar }: MobileHeaderProps) {
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
        <img 
          src={logo} 
          alt="ClassCouncil AI Logo" 
          className="h-10 w-10 object-contain"
        />
        <span className="font-bold text-lg">
          ClassCouncil<span className="text-gold">AI</span>
        </span>
      </div>
      
      {/* Spacer for centering */}
      <div className="w-10" />
    </header>
  );
}

export default MobileHeader;
