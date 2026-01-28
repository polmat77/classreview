import { Button } from "@/components/ui/button";
import { Clock, Lock, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ onScrollToSection }: HeroSectionProps) => {
  return (
    <section className="min-h-screen pt-20 relative overflow-hidden bg-gradient-to-b from-navy to-navy-dark">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-160px)]">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Headline */}
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Des outils <span className="text-gold">IA</span> conçus par un enseignant,{" "}
              <br className="hidden lg:block" />
              pour les enseignants
            </h1>

            {/* Subtitle */}
            <p 
              className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in"
              style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
            >
              Automatisez vos tâches administratives et concentrez-vous sur ce qui compte vraiment : vos élèves.
            </p>

            {/* Trust badges */}
            <div 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10 animate-fade-in"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium">80% de temps gagné</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/10">
                <Lock className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium">RGPD strict</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/10">
                <Flag className="w-4 h-4 text-cyan" />
                <span className="text-sm font-medium">100% français</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in"
              style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
            >
              <Button
                size="lg"
                onClick={() => onScrollToSection("outils")}
                className="bg-gold hover:bg-gold-light text-white font-bold px-8 py-6 rounded-lg shadow-lg shadow-gold/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold/40"
              >
                Découvrir nos outils
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onScrollToSection("faq")}
                className="border-cyan text-cyan bg-transparent hover:bg-cyan/10 px-8 py-6 rounded-lg transition-all duration-300"
              >
                En savoir plus
              </Button>
            </div>
          </div>

          {/* Right column - Hero image */}
          <div 
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end animate-scale-in"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <div className="relative w-full max-w-md lg:max-w-none lg:w-[110%] lg:-mr-12">
              <img
                src={heroImage}
                alt="Professeur IA entouré d'outils éducatifs flottants"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
              {/* Decorative glow behind image */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan/20 to-gold/20 blur-3xl rounded-full scale-75 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
