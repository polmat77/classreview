import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ArrowRight,
  Lock,
  MapPin,
  Zap,
  MessageSquare,
  Menu,
  X,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import classCouncilLogo from "@/assets/logo.png";
import reportCardLogo from "@/assets/Logo_ReportCardAI.png";
import aiProject4YouLogo from "@/assets/Logo_AIProject4you.png";
import heroIllustration from "@/assets/hero-illustration.png";
import quizmasterIcon from "@/assets/quizmaster-icon.png";

// Floating particle component with animation
const FloatingParticle = ({ delay, size, color, left, top }: {
  delay: number;
  size: number;
  color: 'gold' | 'cyan';
  left: string;
  top: string;
}) => {
  return (
    <div 
      className={`absolute rounded-full pointer-events-none ${
        color === 'gold' ? 'bg-gold/30' : 'bg-cyan/40'
      }`}
      style={{
        width: size,
        height: size,
        left,
        top,
        animation: `float ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const particles = [
    { delay: 0, size: 8, color: 'gold' as const, left: '8%', top: '15%' },
    { delay: 1.2, size: 6, color: 'cyan' as const, left: '92%', top: '20%' },
    { delay: 0.5, size: 12, color: 'gold' as const, left: '78%', top: '65%' },
    { delay: 1.8, size: 5, color: 'cyan' as const, left: '15%', top: '75%' },
    { delay: 2.2, size: 9, color: 'gold' as const, left: '55%', top: '12%' },
    { delay: 0.8, size: 7, color: 'cyan' as const, left: '35%', top: '85%' },
    { delay: 1.5, size: 10, color: 'gold' as const, left: '88%', top: '45%' },
    { delay: 0.3, size: 6, color: 'cyan' as const, left: '5%', top: '50%' },
    { delay: 2.5, size: 8, color: 'gold' as const, left: '45%', top: '8%' },
    { delay: 1, size: 5, color: 'cyan' as const, left: '70%', top: '78%' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.7; }
        }
      `}</style>

      {/* ===== 1. HEADER / NAVIGATION ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={aiProject4YouLogo} 
              alt="AIProject4You" 
              className="h-10 w-auto"
            />
            <span className={`font-bold text-lg hidden sm:block transition-colors ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}>
              AIProject4<span className="text-gold">You</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('solutions')} 
              className={`transition-colors font-medium ${
                isScrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              Outils
            </button>
            <button 
              onClick={() => scrollToSection('temoignage')} 
              className={`transition-colors font-medium ${
                isScrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              À propos
            </button>
            <button 
              onClick={() => scrollToSection('solutions')} 
              className={`transition-colors font-medium ${
                isScrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'
              }`}
            >
              FAQ
            </button>
            <Button 
              size="sm" 
              className="bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white rounded-full px-6"
              onClick={() => scrollToSection('solutions')}
            >
              Découvrir nos outils
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('solutions')} 
                className="block w-full text-left text-foreground py-2"
              >
                Outils
              </button>
              <button 
                onClick={() => scrollToSection('temoignage')} 
                className="block w-full text-left text-foreground py-2"
              >
                À propos
              </button>
              <Button 
                className="w-full bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white"
                onClick={() => scrollToSection('solutions')}
              >
                Découvrir nos outils
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ===== 2. HERO SECTION ===== */}
      <section className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-b from-primary to-secondary">
        {/* Floating particles */}
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} />
        ))}
        
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Column - 60% */}
            <div className="lg:col-span-3 space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Des outils <span className="text-gold">IA</span> conçus par un enseignant, pour les enseignants
              </h1>
              
              <p className="text-lg md:text-xl text-slate-light max-w-xl">
                Automatisez vos tâches administratives et concentrez-vous sur vos élèves
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-white text-sm font-medium">80% de temps gagné</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Lock className="w-4 h-4 text-cyan" />
                  <span className="text-white text-sm font-medium">RGPD strict</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span className="text-sm">🇫🇷</span>
                  <span className="text-white text-sm font-medium">100% français</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/classcouncil-ai">
                  <Button 
                    size="lg" 
                    className="bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white text-base px-8 py-6 rounded-lg shadow-lg shadow-cyan-vibrant/30 transition-all hover:scale-105 w-full sm:w-auto"
                  >
                    Commencer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 py-6 border-white/40 text-white hover:bg-white/10 hover:text-white rounded-lg transition-all w-full sm:w-auto"
                  onClick={() => scrollToSection('solutions')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </div>
            </div>

            {/* Right Column - 40% Hero Illustration */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <img 
                src={heroIllustration} 
                alt="Professeur entouré d'outils IA" 
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. SECTION "NOS SOLUTIONS" ===== */}
      <section 
        id="solutions" 
        className="py-20 lg:py-24 px-4 bg-muted scroll-mt-16"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Nos solutions pour simplifier votre quotidien
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 - ClassCouncil AI */}
            <Card className="bg-white border border-border hover:border-cyan-vibrant/50 overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg rounded-xl">
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img 
                    src={classCouncilLogo} 
                    alt="ClassCouncil AI" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <h3 className="text-xl font-bold text-foreground">
                    ClassCouncil <span className="text-gold">AI</span>
                  </h3>
                </div>

                {/* Mockup placeholder */}
                <div className="bg-gradient-to-br from-primary/5 to-cyan/10 rounded-lg p-4 aspect-video flex items-center justify-center border border-border">
                  <div className="bg-white rounded-md shadow-sm p-3 w-full">
                    <div className="flex gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-destructive/50"></div>
                      <div className="w-2 h-2 rounded-full bg-warning/50"></div>
                      <div className="w-2 h-2 rounded-full bg-success/50"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-cyan/20 rounded w-1/2"></div>
                      <div className="h-2 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-base font-medium text-muted-foreground">
                  Préparez vos conseils de classe en un clic
                </p>

                {/* Features */}
                <ul className="space-y-2 text-sm">
                  {[
                    "Génération automatique de synthèses",
                    "Suggestions de commentaires personnalisés",
                    "Analyse des résultats par élève et matière",
                    "Export compatible avec les logiciels scolaires"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link to="/classcouncil-ai" className="block pt-2">
                  <Button className="w-full bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white rounded-lg">
                    Essayer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2 - ReportCard AI */}
            <Card className="bg-white border border-border hover:border-cyan-vibrant/50 overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg rounded-xl">
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img 
                    src={reportCardLogo} 
                    alt="ReportCard AI" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <h3 className="text-xl font-bold text-foreground">
                    ReportCard <span className="text-gold">AI</span>
                  </h3>
                </div>

                {/* Mockup placeholder */}
                <div className="bg-gradient-to-br from-primary/5 to-gold/10 rounded-lg p-4 aspect-video flex items-center justify-center border border-border">
                  <div className="bg-white rounded-md shadow-sm p-3 w-full">
                    <div className="flex gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-destructive/50"></div>
                      <div className="w-2 h-2 rounded-full bg-warning/50"></div>
                      <div className="w-2 h-2 rounded-full bg-success/50"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-gold/30 rounded w-1/2"></div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-base font-medium text-muted-foreground">
                  Rédigez vos bulletins plus rapidement
                </p>

                {/* Features */}
                <ul className="space-y-2 text-sm">
                  {[
                    "Commentaires détaillés et constructifs",
                    "Adaptation automatique au niveau de l'élève",
                    "Gain de temps significatif sur la saisie",
                    "Respect de votre style pédagogique"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link to="/reportcard-ai" className="block pt-2">
                  <Button className="w-full bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white rounded-lg">
                    Essayer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 3 - QuizMaster (Coming Soon) */}
            <Card className="bg-white/80 border border-border overflow-hidden rounded-xl relative opacity-75">
              {/* Coming Soon Badge */}
              <Badge className="absolute top-4 right-4 bg-muted-foreground text-white border-0">
                Coming Soon
              </Badge>
              
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img 
                    src={quizmasterIcon} 
                    alt="QuizMaster" 
                    className="w-12 h-12 rounded-lg object-cover grayscale"
                  />
                  <h3 className="text-xl font-bold text-muted-foreground">
                    Quiz<span className="text-muted-foreground/70">Master</span>
                  </h3>
                </div>

                {/* Mockup placeholder - grayed out */}
                <div className="bg-muted/50 rounded-lg p-4 aspect-video flex items-center justify-center border border-border">
                  <div className="bg-white/50 rounded-md shadow-sm p-3 w-full">
                    <div className="flex gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-2 bg-muted/50 rounded w-1/2"></div>
                      <div className="h-2 bg-muted/50 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-base font-medium text-muted-foreground/70">
                  Créez des évaluations interactives
                </p>

                {/* No feature list for coming soon */}
                <div className="h-24"></div>

                {/* Disabled Button */}
                <Button 
                  className="w-full bg-muted text-muted-foreground rounded-lg cursor-not-allowed" 
                  disabled
                >
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== 4. SECTION TÉMOIGNAGE ===== */}
      <section 
        id="temoignage"
        className="py-16 lg:py-20 px-4 bg-white scroll-mt-16"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            {/* Quote */}
            <div className="relative">
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl text-gold/20 font-serif">"</span>
              <blockquote className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto pt-8">
                Grâce à ClassCouncil AI, j'ai divisé par deux le temps passé sur mes appréciations, tout en les rendant plus précises. Un véritable allié au quotidien !
              </blockquote>
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl text-gold font-bold">M</span>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground text-lg">Mathieu POL</p>
                <p className="text-muted-foreground text-sm">Professeur d'anglais & Créateur</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-cyan-vibrant" />
                <span className="text-sm font-medium">Données locales</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-cyan-vibrant" />
                <span className="text-sm font-medium">Compatible PRONOTE</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-5 h-5 text-cyan-vibrant" />
                <span className="text-sm font-medium">Support réactif</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. SECTION CTA FINALE ===== */}
      <section className="py-16 lg:py-20 px-4 bg-gradient-to-r from-primary to-cyan-vibrant">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
            Prêt à gagner du temps ?
          </h2>
          
          <Link to="/classcouncil-ai">
            <Button 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-white text-base md:text-lg px-10 py-6 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              Commencer avec ClassCouncil <span className="text-white font-bold ml-1">AI</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <p className="text-white/80 text-sm mt-6">
            Gratuit • Sans inscription • Compatible PRONOTE
          </p>
        </div>
      </section>

      {/* ===== 6. FOOTER ===== */}
      <footer className="py-10 lg:py-12 px-4 bg-primary">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            {/* Left - Logo & Tagline */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <img 
                  src={aiProject4YouLogo} 
                  alt="AIProject4You" 
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-slate-light text-sm">
                L'intelligence artificielle au service des enseignants
              </p>
            </div>

            {/* Center - Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <button 
                onClick={() => scrollToSection('solutions')} 
                className="text-slate-light hover:text-white transition-colors"
              >
                Outils
              </button>
              <button 
                onClick={() => scrollToSection('temoignage')} 
                className="text-slate-light hover:text-white transition-colors"
              >
                À propos
              </button>
              <a 
                href="mailto:contact@aiproject4you.com" 
                className="text-slate-light hover:text-white transition-colors"
              >
                Contact
              </a>
              <span className="text-slate-light/50">|</span>
              <Link 
                to="/politique-confidentialite" 
                className="text-slate-light hover:text-white transition-colors"
              >
                Mentions légales
              </Link>
              <Link 
                to="/politique-confidentialite" 
                className="text-slate-light hover:text-white transition-colors"
              >
                Politique de confidentialité
              </Link>
            </nav>

            {/* Right - Badge */}
            <div className="flex-shrink-0">
              <div className="border border-gold text-gold px-4 py-2 rounded-full text-sm font-medium">
                Créé par un prof, pour les profs
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-light/60 text-xs">
              © 2025 AIProject4You. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
