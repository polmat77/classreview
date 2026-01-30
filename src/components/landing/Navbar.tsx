import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

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
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold">
            <span className="text-[#f0a830]">AI</span>
            <span className="text-slate-800">Project4You</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.sectionId}
              onClick={() => onScrollToSection(link.sectionId)}
              className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button
            onClick={() => onScrollToSection("outils")}
            className="bg-[#f0a830] hover:bg-[#e09520] text-white px-6 rounded-lg font-medium"
          >
            Commencer
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-700 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => {
                  onScrollToSection(link.sectionId);
                  setIsMenuOpen(false);
                }}
                className="text-slate-600 hover:text-slate-900 transition-colors text-left py-2"
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
