import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/Logo_AIProject4youV2.png";

interface NavbarProps {
  onScrollToSection: (sectionId: string) => void;
}

const Navbar = ({ onScrollToSection }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Outils", sectionId: "outils" },
    { label: "À propos", sectionId: "testimonial" },
    { label: "FAQ", sectionId: "faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="AIProject4You" className="h-9 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.sectionId}
              onClick={() => onScrollToSection(link.sectionId)}
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </button>
          ))}
          <Button
            onClick={() => onScrollToSection("outils")}
            variant="outline"
            className="border-cyan text-cyan bg-transparent hover:bg-cyan hover:text-white transition-all rounded-full px-6"
          >
            Découvrir nos outils
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 py-4 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.sectionId}
                onClick={() => {
                  onScrollToSection(link.sectionId);
                  setIsMenuOpen(false);
                }}
                className="text-white/80 hover:text-white transition-colors text-left py-2"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => {
                onScrollToSection("outils");
                setIsMenuOpen(false);
              }}
              className="bg-cyan hover:bg-cyan-vibrant text-white w-full mt-2"
            >
              Découvrir nos outils
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
