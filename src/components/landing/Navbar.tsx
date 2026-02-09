import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

const logo = "/images/logos/AIProject4You_logo.png";

interface NavbarProps {
  onScrollToSection: (sectionId: string) => void;
}

const Navbar = ({ onScrollToSection }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Outils", sectionId: "outils", isRoute: false },
    { label: "Fonctionnalités", sectionId: "features", isRoute: false },
    { label: "Témoignages", sectionId: "testimonials", isRoute: false },
    { label: "Tarifs", sectionId: "/pricing", isRoute: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 transition-all duration-300 ${
        isScrolled ? "shadow-sm dark:shadow-slate-800/50" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AIProject4You" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold">
            <span className="text-accent">AI</span>
            <span className="text-foreground">Project4You</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.sectionId}
                to={link.sectionId}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.sectionId}
                onClick={() => onScrollToSection(link.sectionId)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </button>
            )
          ))}
        </div>

        {/* CTA Button + Dark Mode Toggle + Auth */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          {isAuthenticated ? (
            <UserMenu variant="header" />
          ) : (
            <Button
              variant="outline"
              onClick={openAuthModal}
              className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent gap-2"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Button>
          )}
          <Button
            onClick={() => onScrollToSection("outils")}
            className="bg-[#f0a830] hover:bg-[#e09520] text-white px-6 rounded-lg font-medium"
          >
            Commencer
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <DarkModeToggle />
          {!isAuthenticated && (
            <button
              onClick={openAuthModal}
              className="text-accent p-2"
              aria-label="Se connecter"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
          <button
            className="text-foreground p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border py-4 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.sectionId}
                  to={link.sectionId}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left py-2"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.sectionId}
                  onClick={() => {
                    onScrollToSection(link.sectionId);
                    setIsMenuOpen(false);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors text-left py-2"
                >
                  {link.label}
                </button>
              )
            ))}
            <Button
              onClick={() => {
                onScrollToSection("outils");
                setIsMenuOpen(false);
              }}
              className="bg-accent hover:bg-accent-hover text-accent-foreground w-full mt-2"
            >
              Commencer
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
