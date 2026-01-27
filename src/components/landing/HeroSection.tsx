import { Button } from "@/components/ui/button";
import { Clock, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingParticles from "./FloatingParticles";
import heroIllustration from "@/assets/hero-illustration.png";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

const HeroSection = ({ onScrollToSection }: HeroSectionProps) => {
  return (
    <section className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-b from-[#1a2332] to-[#0f1722]">
      {/* Floating particles */}
      <FloatingParticles />

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left column - 60% */}
          <div className="lg:col-span-3 text-center lg:text-left">
            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white mb-6 leading-tight">
              Des outils <span className="text-[#f0a830]">IA</span> conçus par un enseignant,{" "}
              <br className="hidden lg:block" />
              pour les enseignants
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-[#94a3b8] mb-8 max-w-xl mx-auto lg:mx-0">
              Automatisez vos tâches administratives et concentrez-vous sur vos élèves
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="inline-flex items-center gap-2 bg-[#06b6d4]/20 text-[#7dd3e8] px-4 py-2 rounded-full border border-[#06b6d4]/30">
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/classcouncil-ai">
                <Button
                  size="lg"
                  className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white px-8 rounded-lg shadow-lg shadow-[#06b6d4]/30 transition-all hover:scale-105 w-full sm:w-auto"
                >
                  Commencer gratuitement
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onScrollToSection("outils")}
                className="border-white/30 text-white bg-transparent hover:bg-white/10 px-8 rounded-lg transition-all w-full sm:w-auto"
              >
                Voir la démo
              </Button>
            </div>
          </div>

          {/* Right column - 40% */}
          <div className="lg:col-span-2 relative">
            <div className="relative">
              <img
                src={heroIllustration}
                alt="AI Education Tools"
                className="w-full max-w-md mx-auto lg:max-w-none"
              />
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/20 to-[#f0a830]/20 blur-3xl rounded-full opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
