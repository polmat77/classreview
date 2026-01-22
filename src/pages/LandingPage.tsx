import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  RefreshCw, 
  Frown, 
  Rocket, 
  Target, 
  Shield, 
  CheckCircle2, 
  Lightbulb,
  ChevronDown,
  Mail,
  Heart,
  GraduationCap,
  ArrowRight,
  Lock,
  Users,
  MessageSquare,
  Plus,
  Minus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import classCouncilLogo from "@/assets/logo.png";
import reportCardLogo from "@/assets/Logo_ReportCardAI.png";

// Floating particle component
const FloatingParticle = ({ delay, duration, size, color, left, top }: {
  delay: number;
  duration: number;
  size: number;
  color: 'gold' | 'cyan';
  left: string;
  top: string;
}) => {
  return (
    <div 
      className={`absolute rounded-full pointer-events-none animate-pulse ${
        color === 'gold' ? 'bg-gold/40' : 'bg-cyan-vibrant/40'
      }`}
      style={{
        width: size,
        height: size,
        left,
        top,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
};

// FAQ Item component
const FAQItem = ({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden transition-all duration-300">
      <button 
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isOpen ? 'bg-cyan-vibrant text-white' : 'bg-cyan-vibrant/10 text-cyan-vibrant'
        }`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
        <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqItems = [
    {
      question: "Mes données sont-elles en sécurité ?",
      answer: "Absolument. Toutes les données sont traitées localement dans votre navigateur. Rien n'est envoyé à un serveur. Conformité RGPD totale."
    },
    {
      question: "Les outils fonctionnent-ils avec PRONOTE ?",
      answer: "Oui. ClassCouncil AI et ReportCard AI sont conçus pour importer directement les exports PDF de PRONOTE, la solution la plus utilisée en France."
    },
    {
      question: "Est-ce gratuit ?",
      answer: "Oui, les outils sont actuellement gratuits pour tous les enseignants. Notre objectif est de faciliter votre quotidien."
    },
    {
      question: "Puis-je suggérer un nouvel outil ?",
      answer: "Bien sûr ! Utilisez le bouton 'Proposer une idée' pour partager vos besoins. Ensemble, nous faisons évoluer la plateforme."
    }
  ];

  const particles = [
    { delay: 0, duration: 4, size: 8, color: 'gold' as const, left: '10%', top: '20%' },
    { delay: 1, duration: 5, size: 6, color: 'cyan' as const, left: '85%', top: '15%' },
    { delay: 0.5, duration: 4.5, size: 10, color: 'gold' as const, left: '75%', top: '60%' },
    { delay: 1.5, duration: 3.5, size: 5, color: 'cyan' as const, left: '20%', top: '70%' },
    { delay: 2, duration: 4, size: 7, color: 'gold' as const, left: '60%', top: '25%' },
    { delay: 0.8, duration: 5, size: 8, color: 'cyan' as const, left: '40%', top: '80%' },
    { delay: 1.2, duration: 4.2, size: 6, color: 'gold' as const, left: '90%', top: '45%' },
    { delay: 0.3, duration: 3.8, size: 9, color: 'cyan' as const, left: '5%', top: '55%' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={classCouncilLogo} 
              alt="AIProject4You" 
              className="w-10 h-10 rounded-lg"
            />
            <span className="font-bold text-xl text-white">
              AIProject4<span className="text-gold">You</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('outils')} 
              className="text-white/80 hover:text-white transition-colors"
            >
              Outils
            </button>
            <button 
              onClick={() => scrollToSection('engagement')} 
              className="text-white/80 hover:text-white transition-colors"
            >
              À propos
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-white/80 hover:text-white transition-colors"
            >
              FAQ
            </button>
            <Link to="/classcouncil-ai">
              <Button size="sm" className="bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white">
                Accéder aux outils
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-16 relative overflow-hidden bg-gradient-hero">
        {/* Floating particles */}
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} />
        ))}
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-8 border border-white/20">
              <GraduationCap className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">👨‍🏫 Créé par un professeur en exercice</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Des outils <span className="text-gold">IA</span> conçus par un enseignant,{" "}
              <span className="text-cyan">pour les enseignants</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto">
              Automatisez vos tâches chronophages et concentrez-vous sur ce qui compte vraiment : <span className="text-gold font-semibold">vos élèves</span>.
            </p>

            {/* Stats line */}
            <p className="text-sm md:text-base text-white/70 mb-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan" />
                80% de temps gagné
              </span>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan" />
                RGPD strict
              </span>
              <span className="hidden md:inline text-white/40">|</span>
              <span className="flex items-center gap-1.5">
                🇫🇷 100% adapté au système français
              </span>
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('outils')}
                className="bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white text-base px-8 shadow-lg shadow-cyan-vibrant/30 transition-all hover:scale-105"
              >
                Découvrir les outils
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/classcouncil-ai">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white transition-all hover:scale-105"
                >
                  Essayer ClassCouncil <span className="text-gold ml-1">AI</span> gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Section Problème */}
      <section 
        id="probleme"
        ref={(el) => (sectionRefs.current['probleme'] = el)}
        className="py-20 px-4 bg-white"
      >
        <div className={`container mx-auto max-w-6xl transition-all duration-700 ${
          isVisible['probleme'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trop de temps perdu sur l'administratif ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Des heures passées", desc: "à rédiger des appréciations pour chaque élève" },
              { icon: FileText, title: "Des rapports à préparer", desc: "pour chaque conseil de classe" },
              { icon: RefreshCw, title: "Des tâches répétitives", desc: "qui s'accumulent trimestre après trimestre" },
              { icon: Frown, title: "Moins de temps", desc: "pour préparer vos cours et accompagner vos élèves" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-muted/30 rounded-xl p-6 border-l-4 border-cyan-vibrant transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-10 text-lg">
            Nous connaissons ces défis quotidiens qui vous éloignent de votre cœur de métier.
          </p>
        </div>
      </section>

      {/* Section Solution */}
      <section 
        id="solution"
        ref={(el) => (sectionRefs.current['solution'] = el)}
        className="py-20 px-4 bg-slate"
      >
        <div className={`container mx-auto max-w-6xl transition-all duration-700 ${
          isVisible['solution'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AIProject4<span className="text-gold">You</span> automatise le travail fastidieux
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Des outils intelligents qui vous font gagner un temps précieux.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Rocket, 
                title: "Gain de temps", 
                desc: "Réduisez de 80% le temps passé sur les tâches administratives",
                iconColor: "text-cyan"
              },
              { 
                icon: Target, 
                title: "Qualité", 
                desc: "Des résultats professionnels générés en quelques clics",
                iconColor: "text-gold"
              },
              { 
                icon: Shield, 
                title: "Confiance", 
                desc: "Vos données restent protégées et confidentielles (RGPD)",
                iconColor: "text-cyan"
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-cyan hover:border-cyan-vibrant/50 group"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Outils */}
      <section 
        id="outils" 
        ref={(el) => (sectionRefs.current['outils'] = el)}
        className="py-24 px-4 bg-white scroll-mt-20"
      >
        <div className={`container mx-auto max-w-6xl transition-all duration-700 ${
          isVisible['outils'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gold/10 text-gold-foreground border-gold/20 hover:bg-gold/20">
              💡 Une suite d'outils qui s'enrichit
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Découvrez nos solutions pour simplifier votre quotidien d'enseignant
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* ClassCouncil AI */}
            <Card className="bg-white border border-border hover:border-cyan-vibrant/50 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="absolute top-4 right-4">
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Disponible
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={classCouncilLogo} 
                    alt="ClassCouncil AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl">
                  ClassCouncil <span className="text-gold">AI</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Préparez vos conseils de classe en quelques minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {[
                    "Import des bulletins PRONOTE",
                    "Analyse automatique des résultats",
                    "Génération d'appréciations IA",
                    "Suggestions d'attributions",
                    "Export PDF complet"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/classcouncil-ai" className="block">
                  <Button className="w-full bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white group-hover:shadow-lg transition-all">
                    Essayer ClassCouncil <span className="text-gold-light ml-1">AI</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* ReportCard AI */}
            <Card className="bg-white border border-border hover:border-cyan-vibrant/50 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="absolute top-4 right-4">
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Disponible
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={reportCardLogo} 
                    alt="ReportCard AI" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-xl">
                  ReportCard <span className="text-gold">AI</span>
                </CardTitle>
                <CardDescription className="text-base">
                  Générez vos appréciations en quelques clics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {[
                    "Import PDF PRONOTE ou saisie manuelle",
                    "3 questions pour personnaliser",
                    "Appréciations 300-400 caractères",
                    "Bilan de classe automatique",
                    "Export texte complet"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/reportcard-ai" className="block">
                  <Button className="w-full bg-cyan-vibrant hover:bg-cyan-vibrant/90 text-white group-hover:shadow-lg transition-all">
                    Essayer ReportCard <span className="text-gold-light ml-1">AI</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Suggestion */}
            <Card className="bg-white border border-border hover:border-gold/50 relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gold/10 text-gold-foreground border-gold/20">
                  💡 Suggérez
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="w-20 h-20 rounded-2xl bg-cyan/20 flex items-center justify-center mb-4">
                  <Lightbulb className="w-10 h-10 text-gold" />
                </div>
                <CardTitle className="text-xl">
                  Proposez votre idée
                </CardTitle>
                <CardDescription className="text-base">
                  Contribuez à l'évolution de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous avez une tâche chronophage que l'IA pourrait automatiser ? Partagez votre idée et contribuez à l'évolution de la plateforme !
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-cyan-vibrant text-cyan-vibrant hover:bg-cyan-vibrant/10 group-hover:shadow-lg transition-all" 
                  asChild
                >
                  <a href="mailto:contact@aiproject4you.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Proposer une idée
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Engagement */}
      <section 
        id="engagement"
        ref={(el) => (sectionRefs.current['engagement'] = el)}
        className="py-20 px-4 bg-gradient-hero scroll-mt-20"
      >
        <div className={`container mx-auto max-w-6xl transition-all duration-700 ${
          isVisible['engagement'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/30">
              🎓 Notre engagement
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Conçu par un enseignant, pour les enseignants
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <blockquote className="text-xl md:text-2xl text-white/90 italic leading-relaxed border-l-4 border-gold pl-6">
                "Je suis professeur en collège depuis plus de 20 ans. J'ai créé ces outils pour répondre à mes propres besoins et ceux de mes collègues. Chaque fonctionnalité est pensée pour le terrain."
              </blockquote>
              
              <div className="text-white/80">
                <p className="font-semibold text-white text-lg">Mathieu POL</p>
                <p>Professeur d'anglais & Personnel Ressources Numériques</p>
                <p className="text-sm text-white/60">Collège Romain Rolland, Waziers (REP)</p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  { icon: Lock, text: "Données traitées localement - Respect du RGPD" },
                  { icon: Users, text: "Adapté au système éducatif français - Compatible PRONOTE" },
                  { icon: MessageSquare, text: "Support réactif - Un prof qui comprend vos besoins" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-vibrant/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-cyan" />
                    </div>
                    <span className="text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <div className="w-48 h-48 rounded-full bg-gradient-gold flex items-center justify-center">
                  <GraduationCap className="w-24 h-24 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section 
        id="faq" 
        ref={(el) => (sectionRefs.current['faq'] = el)}
        className="py-20 px-4 bg-muted/30 scroll-mt-20"
      >
        <div className={`container mx-auto max-w-3xl transition-all duration-700 ${
          isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Tout ce que vous devez savoir sur AIProject4<span className="text-gold">You</span>
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-cta relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center border border-white/20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Prêt à gagner du temps ?
            </h2>
            <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
              Rejoignez les enseignants qui ont déjà simplifié leur préparation de conseils de classe.
            </p>
            <Link to="/classcouncil-ai">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-base px-10 shadow-xl transition-all hover:scale-105"
              >
                Commencer avec ClassCouncil <span className="text-gold ml-1">AI</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-white/60 text-sm mt-4">
              Gratuit • Sans inscription • Compatible PRONOTE
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-primary border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: Logo */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={classCouncilLogo} 
                  alt="AIProject4You" 
                  className="w-12 h-12 rounded-lg"
                />
                <span className="font-bold text-xl text-white">
                  AIProject4<span className="text-gold">You</span>
                </span>
              </div>
              <p className="text-white/70 mb-4">L'IA au service des enseignants</p>
              <p className="text-white/50 text-sm">
                © 2025 AIProject4You - Créé avec <Heart className="w-3 h-3 inline text-destructive" /> par un enseignant
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <button 
                  onClick={() => scrollToSection('outils')} 
                  className="text-white/70 hover:text-cyan transition-colors text-left"
                >
                  Outils
                </button>
                <button 
                  onClick={() => scrollToSection('engagement')} 
                  className="text-white/70 hover:text-cyan transition-colors text-left"
                >
                  À propos
                </button>
                <button 
                  onClick={() => scrollToSection('faq')} 
                  className="text-white/70 hover:text-cyan transition-colors text-left"
                >
                  FAQ
                </button>
                <a 
                  href="mailto:contact@aiproject4you.com" 
                  className="text-white/70 hover:text-cyan transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link 
                  to="/politique-confidentialite" 
                  className="text-white/70 hover:text-cyan transition-colors"
                >
                  Politique de confidentialité
                </Link>
                <span className="text-white/70">Mentions légales</span>
                <span className="text-white/70">RGPD</span>
              </nav>
            </div>
          </div>

          {/* Bottom separator */}
          <div className="pt-8 border-t border-cyan-vibrant/30" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
