import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/AIProject4You_logo.png";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ onScrollToSection }: HeroSectionProps) => {
  const badges = [
    "100% gratuit",
    "RGPD",
    "Compatible PRONOTE",
  ];

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column - Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#fef3c7] text-[#92400e] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span>👨‍🏫</span>
              <span>Par un prof, pour les profs</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Gagnez du temps sur vos tâches administratives
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-600 mb-6 max-w-lg mx-auto lg:mx-0">
              Des outils IA qui génèrent vos appréciations de bulletins et conseils de classe en quelques clics.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 text-sm text-slate-600"
                >
                  <Check className="w-4 h-4 text-slate-500" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => onScrollToSection("outils")}
                className="bg-[#f0a830] hover:bg-[#e09520] text-white px-6 py-3 h-auto rounded-lg font-medium transition-all hover:scale-[1.02]"
              >
                Découvrir les outils
              </Button>
              <Button
                variant="outline"
                onClick={() => onScrollToSection("how-it-works")}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 h-auto rounded-lg font-medium"
              >
                Voir une démo
              </Button>
            </div>
          </div>

          {/* Right column - Logo/Image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              <img
                src={logo}
                alt="AIProject4You - Arbre doré avec icônes éducatives"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
