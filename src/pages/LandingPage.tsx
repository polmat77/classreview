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
  ClipboardList, 
  FlaskConical, 
  Lightbulb,
  ChevronDown,
  ExternalLink,
  Mail,
  Heart,
  GraduationCap,
  Sparkles,
  Users,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LandingPage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">AIProject4You</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('outils')} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Outils
            </button>
            <button 
              onClick={() => scrollToSection('confiance')} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              À propos
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </button>
            <Link to="/classcouncil-ai">
              <Button size="sm">
                Accéder aux outils
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge de confiance */}
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-foreground px-4 py-2 rounded-full mb-8 border border-gold/20">
              <GraduationCap className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">Créé par un professeur en exercice</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Des outils IA conçus par un enseignant,{" "}
              <span className="text-primary">pour les enseignants</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Automatisez vos tâches chronophages et concentrez-vous sur ce qui compte vraiment : <strong className="text-foreground">vos élèves</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('outils')}
                className="text-base px-8"
              >
                Découvrir les outils
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/classcouncil-ai">
                <Button size="lg" variant="outline" className="text-base px-8 w-full sm:w-auto">
                  Essayer ClassCouncil AI
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Visual element */}
          <div className="mt-16 relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-navy to-navy-dark rounded-2xl shadow-elevated overflow-hidden border border-border/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/90 p-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-2xl font-semibold mb-2">AIProject4You</p>
                  <p className="text-white/70">L'IA au service des enseignants</p>
                </div>
              </div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -left-4 top-1/4 bg-card rounded-xl shadow-lg p-4 border border-border hidden lg:block animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Appréciation générée</p>
                  <p className="text-xs text-muted-foreground">En 2 secondes</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 bg-card rounded-xl shadow-lg p-4 border border-border hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">80% de temps gagné</p>
                  <p className="text-xs text-muted-foreground">Sur les tâches admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problème */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trop de temps perdu sur l'administratif ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nous connaissons ces défis quotidiens qui vous éloignent de votre cœur de métier.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, title: "Des heures passées", desc: "à rédiger des appréciations pour chaque élève" },
              { icon: FileText, title: "Des rapports à préparer", desc: "pour chaque conseil de classe" },
              { icon: RefreshCw, title: "Des tâches répétitives", desc: "qui s'accumulent trimestre après trimestre" },
              { icon: Frown, title: "Moins de temps", desc: "pour préparer vos cours et accompagner vos élèves" },
            ].map((item, index) => (
              <Card key={index} className="bg-card border-border/50 text-center">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Solution */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AIProject4You automatise le travail fastidieux
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des outils intelligents qui vous font gagner un temps précieux.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Rocket, 
                title: "Gain de temps", 
                desc: "Réduisez de 80% le temps passé sur les tâches administratives",
                color: "primary"
              },
              { 
                icon: Target, 
                title: "Qualité", 
                desc: "Des résultats professionnels générés en quelques clics",
                color: "success"
              },
              { 
                icon: Shield, 
                title: "Confiance", 
                desc: "Vos données restent protégées et confidentielles (RGPD)",
                color: "accent"
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-${item.color}/10 flex items-center justify-center`}>
                  <item.icon className={`w-8 h-8 text-${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Outils */}
      <section id="outils" className="py-20 px-4 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Une suite d'outils qui s'enrichit
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez nos solutions pour simplifier votre quotidien d'enseignant.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* ClassCouncil AI - Disponible */}
            <Card className="bg-card border-2 border-primary/20 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-4 right-4">
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Disponible
                </Badge>
              </div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <ClipboardList className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">ClassCouncil AI</CardTitle>
                <CardDescription>
                  Préparez vos conseils de classe en quelques minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Importez vos bulletins PRONOTE, générez automatiquement les appréciations de classe et individuelles, obtenez des suggestions d'attributions.
                </p>
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
                <Link to="/classcouncil-ai">
                  <Button className="w-full mt-4 group-hover:bg-primary/90">
                    Essayer ClassCouncil AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Outil à venir */}
            <Card className="bg-card border-border/50 relative overflow-hidden opacity-80">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  🔜 Bientôt
                </Badge>
              </div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <FlaskConical className="w-7 h-7 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl text-muted-foreground">Prochain outil</CardTitle>
                <CardDescription>
                  En cours de développement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  De nouveaux outils sont en développement pour vous simplifier la vie. Restez informé des nouveautés.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Suggestion */}
            <Card className="bg-card border-border/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-gold/10 text-gold-foreground border-gold/20">
                  💬 Suggérez
                </Badge>
              </div>
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <Lightbulb className="w-7 h-7 text-gold" />
                </div>
                <CardTitle className="text-xl">Une idée d'outil ?</CardTitle>
                <CardDescription>
                  Partagez vos suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vous avez une tâche chronophage que l'IA pourrait automatiser ? Partagez votre idée et contribuez à l'évolution de la plateforme !
                </p>
                <Button variant="outline" className="w-full" asChild>
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

      {/* Section Confiance */}
      <section id="confiance" className="py-20 px-4 scroll-mt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-foreground px-3 py-1 rounded-full mb-6 text-sm border border-gold/20">
                <Heart className="w-4 h-4 text-gold" />
                <span>Notre engagement</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Conçu par un enseignant, pour les enseignants
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Je suis professeur en collège depuis plus de 20 ans. J'ai créé ces outils pour répondre à mes propres besoins et ceux de mes collègues. 
                <strong className="text-foreground"> Chaque fonctionnalité est pensée pour le terrain.</strong>
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Données traitées localement - Respect du RGPD" },
                  { icon: Users, text: "Adapté au système éducatif français" },
                  { icon: Mail, text: "Support réactif par un prof qui comprend vos besoins" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-success" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-navy flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">Créé avec passion</p>
                  <p className="text-muted-foreground">Par un enseignant, pour les enseignants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ */}
      <section id="faq" className="py-20 px-4 bg-muted/50 scroll-mt-20">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Tout ce que vous devez savoir sur AIProject4You
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card rounded-xl border border-border/50 px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Mes données sont-elles en sécurité ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolument. Vos données sont traitées localement dans votre navigateur. Seules les données strictement nécessaires (anonymisées) sont envoyées à l'IA pour la génération des appréciations. Nous respectons scrupuleusement le RGPD.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-card rounded-xl border border-border/50 px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Les outils fonctionnent-ils avec PRONOTE ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Oui ! ClassCouncil AI accepte directement les exports PDF de bulletins PRONOTE. Il vous suffit d'exporter vos bulletins depuis PRONOTE et de les importer dans notre outil.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-card rounded-xl border border-border/50 px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Est-ce gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Oui, ClassCouncil AI est actuellement gratuit pour tous les enseignants. Notre objectif est de rendre ces outils accessibles au plus grand nombre.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="bg-card rounded-xl border border-border/50 px-6">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                Puis-je suggérer un nouvel outil ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Bien sûr ! Nous sommes à l'écoute de vos besoins. N'hésitez pas à nous contacter pour partager vos idées d'outils qui pourraient vous faire gagner du temps.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-navy to-navy-dark rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à gagner du temps ?
              </h2>
              <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
                Rejoignez les enseignants qui ont déjà simplifié leur préparation de conseils de classe.
              </p>
              <Link to="/classcouncil-ai">
                <Button size="lg" className="bg-white text-navy hover:bg-white/90 text-base px-8">
                  Commencer avec ClassCouncil AI
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">AIProject4You</span>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button 
                onClick={() => scrollToSection('outils')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Outils
              </button>
              <button 
                onClick={() => scrollToSection('confiance')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                À propos
              </button>
              <button 
                onClick={() => scrollToSection('faq')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </button>
              <a 
                href="mailto:contact@aiproject4you.com" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
              <Link 
                to="/politique-confidentialite" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Politique de confidentialité
              </Link>
            </nav>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 AIProject4You - Créé avec <Heart className="w-3 h-3 inline text-destructive" /> par un enseignant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
