import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="border-t bg-card py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>© 2025 ClassCouncil AI</span>
        <Link 
          to="/politique-confidentialite" 
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Shield className="h-4 w-4" />
          Politique de confidentialité
        </Link>
      </div>
    </footer>
  );
};

export default AppFooter;
