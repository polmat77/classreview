import { Button } from "@/components/ui/button";
import { Clock, Lock, Flag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/Hero_Site.png";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ onScrollToSection }: HeroSectionProps) => {
  return (
    <section className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-b from-navy to-navy-dark">
      {/* Floating particles decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cyan particles */}
        <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-cyan opacity-60 animate-pulse" />
        <div className="absolute top-40 left-[5%] w-2 h-2 rounded-full bg-cyan opacity-40" />
        <div className="absolute top-60 left-[15%] w-4 h-4 rounded-full bg-cyan/30" />
        <div className="absolute top-32 right-[30%] w-2 h-2 rounded-full bg-cyan opacity-50" />
        
        {/* Gold particles */}
        <div className="absolute top-24 right-[15%] w-3 h-3 rounded-full bg-gold opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-56 right-[10%] w-2 h-2 rounded-full bg-gold opacity-40" />
        <div className="absolute bottom-40 left-[20%] w-2 h-2 rounded-full bg-gold opacity-50" />
        
        {/* Large blurred background elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Des outils <span className="text-gold">IA</span> conçus{" "}
              <br className="hidden sm:block" />
              par un enseignant,{" "}
              <br className="hidden lg:block" />
              pour les enseignants
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-light mb-8 max-w-lg mx-auto lg:mx-0">
              Automatisez vos tâches administratives et concentrez-vous sur vos élèves
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
              <div className="inline-flex items-center gap-2 bg-cyan/20 text-cyan px-4 py-2 rounded-full border border-cyan/30">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">80% de temps gagné</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full border border-white/20">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">RGPD strict</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full border border-white/20">
                <span className="text-base">🇫🇷</span>
                <span className="text-sm font-medium">100% français</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/classcouncil-ai">
                <Button
                  size="lg"
                  className="bg-cyan hover:bg-cyan-vibrant text-white font-semibold px-8 py-6 rounded-lg shadow-lg shadow-cyan/30 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto"
                >
                  Commencer gratuitement
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onScrollToSection("outils")}
                className="border-white/40 text-white bg-transparent hover:bg-white/10 px-8 py-6 rounded-lg transition-all duration-300 w-full sm:w-auto"
              >
                Voir la démo
              </Button>
            </div>
          </div>

          {/* Right column - Hero image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <img
                src={heroImage}
                alt="Professeur IA entouré d'outils éducatifs flottants"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
