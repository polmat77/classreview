import { Link } from "react-router-dom";
import logo from "@/assets/Logo_AIProject4youV2.png";

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

const Footer = ({ onScrollToSection }: FooterProps) => {
  return (
    <footer className="bg-navy py-10 lg:py-12 px-4 border-t border-white/10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center lg:items-start gap-2">
            <img src={logo} alt="AIProject4You" className="h-10 w-auto" />
            <p className="text-slate-light text-sm text-center lg:text-left">
              L'intelligence artificielle au service des enseignants
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <button
              onClick={() => onScrollToSection("outils")}
              className="text-white/70 hover:text-white transition-colors"
            >
              Outils
            </button>
            <button
              onClick={() => onScrollToSection("testimonial")}
              className="text-white/70 hover:text-white transition-colors"
            >
              À propos
            </button>
            <Link
              to="#"
              className="text-white/70 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              to="#"
              className="text-white/70 hover:text-white transition-colors"
            >
              Mentions légales
            </Link>
            <Link
              to="/politique-confidentialite"
              className="text-white/70 hover:text-white transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/50 text-gold text-sm font-medium whitespace-nowrap">
            <span>👨‍🏫</span>
            <span>Créé par un prof, pour les profs</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-light text-xs">
            © {new Date().getFullYear()} AIProject4You - Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
