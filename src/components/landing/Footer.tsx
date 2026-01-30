import { Link } from "react-router-dom";
import logo from "@/assets/AIProject4You_logo.png";

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

const Footer = ({ onScrollToSection }: FooterProps) => {
  return (
    <footer className="py-16 bg-navy">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="AIProject4You" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold">
                <span className="text-accent">AI</span>
                <span className="text-white">Project4You</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              L'intelligence artificielle au service des enseignants
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          {/* Column 2: Outils */}
          <div>
            <h4 className="text-white font-semibold mb-4">Outils</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/classcouncil-ai"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ClassCouncilAI
                </Link>
              </li>
              <li>
                <Link
                  to="/reportcard-ai"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  ReportCardAI
                </Link>
              </li>
              <li>
                <span className="text-slate-500 text-sm">
                  QuizMasterAI (bientôt)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Ressources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onScrollToSection("how-it-works")}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Guide d'utilisation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection("faq")}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@aiproject4you.com"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Légal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="#"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  to="/politique-confidentialite"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  RGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-slate-500 text-sm text-center">
            © {new Date().getFullYear()} AIProject4You. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
