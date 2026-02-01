import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";

const logo = "/images/logos/AIProject4You_logo.png";

interface NavbarProps {
  onScrollToSection: (sectionId: string) => void;
}

const Navbar = ({ onScrollToSection }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Outils", sectionId: "outils" },
    { label: "Fonctionnalités", sectionId: "features" },
    { label: "Témoignages", sectionId: "testimonials" },
    { label: "Tarifs", sectionId: "pricing" },
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
            <button
              key={link.sectionId}
              onClick={() => onScrollToSection(link.sectionId)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button + Dark Mode Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
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
          <button
            className="text-slate-700 dark:text-slate-300 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-4 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => {
                  onScrollToSection(link.sectionId);
                  setIsMenuOpen(false);
                }}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left py-2"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => {
                onScrollToSection("outils");
                setIsMenuOpen(false);
              }}
              className="bg-[#f0a830] hover:bg-[#e09520] text-white w-full mt-2"
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
