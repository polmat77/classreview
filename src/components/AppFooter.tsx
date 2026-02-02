import { Link, useLocation } from "react-router-dom";
import { Shield, FileText, Settings } from "lucide-react";
import { useRGPDConsent, AppName } from "@/hooks/useRGPDConsent";

const AppFooter = () => {
  const location = useLocation();
  const isReportCardAI = location.pathname.includes('/reportcard-ai');
  const appName = isReportCardAI ? 'ReportCard AI' : 'ClassCouncil AI';
  const appSlug: AppName = isReportCardAI ? 'reportcard' : 'classcouncil';
  
  const { revokeConsent } = useRGPDConsent(appSlug);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 mt-auto transition-colors">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>© 2025 {appName} - <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">AIProject4You</Link></span>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link 
            to="/mentions-legales" 
            className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Mentions légales
          </Link>
          <Link 
            to="/politique-confidentialite" 
            className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Confidentialité
          </Link>
          <button
            onClick={revokeConsent}
            className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Gérer mes préférences
          </button>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
