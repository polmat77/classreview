import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Shield, ArrowLeft, Star, School, Loader2, Info, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import DarkModeToggle from "@/components/DarkModeToggle";
import PromoCodeInput from "@/components/promo/PromoCodeInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, StripePlanKey } from "@/config/stripe";

const logo = "/images/logos/AIProject4You_logo.png";

const MAILTO_LINK = "mailto:aiproject4you@gmail.com?subject=Demande%20d'acc%C3%A8s%20Pro%20-%20AIProject4You&body=Bonjour%2C%0D%0A%0D%0AJe%20souhaiterais%20b%C3%A9n%C3%A9ficier%20de%20l'offre%20de%20lancement%20%C3%A0%20-50%25%20sur%20les%20tarifs%20AIProject4You.%0D%0A%0D%0AMon%20email%20de%20connexion%20%3A%20%0D%0ANombre%20de%20cr%C3%A9dits%20souhait%C3%A9%20%3A%20%0D%0A%0D%0AMerci%20!";

// Pricing plans data
const pricingPlans = [
  {
    id: "free",
    name: "DÉCOUVERTE",
    price: "0€",
    priceSubtext: "",
    students: 5,
    studentLabel: "5 élèves",
    description: "Pour tester la qualité",
    features: [
      "5 élèves à vie",
      "Tous les outils accessibles",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Commencer l'essai gratuit",
    theme: "light",
  },
  {
    id: "one_class",
    name: "1 CLASSE",
    price: "4,99€",
    priceSubtext: "/année scolaire",
    students: 35,
    studentLabel: "35 élèves",
    description: "Un conseil de classe pour moins de 5€",
    features: [
      "35 élèves inclus",
      "Tous les outils accessibles",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Bilan de classe inclus",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
    theme: "light",
  },
  {
    id: "four_classes",
    name: "4 CLASSES",
    price: "14,99€",
    priceSubtext: "/année scolaire",
    students: 140,
    studentLabel: "140 élèves",
    description: "Un niveau complet",
    features: [
      "140 élèves inclus",
      "Tous les outils accessibles",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Bilans de classe inclus",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
    theme: "gold",
    recommended: true,
  },
  {
    id: "year",
    name: "ANNÉE COMPLÈTE",
    price: "29,99€",
    priceSubtext: "/année scolaire",
    students: 500,
    studentLabel: "500 élèves",
    description: "Tous vos bulletins de l'année",
    features: [
      "500 élèves inclus",
      "Tous les outils accessibles",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Bilans de classe inclus",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
    theme: "light",
  },
  {
    id: "all_classes",
    name: "TOUTES LES CLASSES",
    price: "39,99€",
    priceSubtext: "/année scolaire",
    students: 2000,
    studentLabel: "2 000 élèves",
    description: "18 classes ? On gère.",
    features: [
      "2 000 élèves inclus",
      "Tous les outils accessibles",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Bilans de classe inclus",
      "Données 100% locales (RGPD)",
      "Support prioritaire",
    ],
    cta: "Choisir ce pack",
    theme: "dark",
    bestValue: true,
  },
];

// Profile presets for simulator
const profilePresets = [
  { icon: "👨‍🏫", label: "Prof principal (1 classe)", classes: 1 },
  { icon: "🗣️", label: "Prof de langue (4 classes)", classes: 4 },
  { icon: "📚", label: "Prof standard (6 classes)", classes: 6 },
  { icon: "🎵", label: "Prof techno/musique (18 classes)", classes: 18 },
];

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, session } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [classCount, setClassCount] = useState(4);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  // Calculate estimated students based on classes
  const estimatedStudents = (classCount * 30 * 3) + (classCount * 5 * 3);
  
  // Find recommended pack
  const getRecommendedPack = () => {
    if (estimatedStudents <= 5) return pricingPlans[0];
    if (estimatedStudents <= 35) return pricingPlans[1];
    if (estimatedStudents <= 140) return pricingPlans[2];
    if (estimatedStudents <= 500) return pricingPlans[3];
    return pricingPlans[4];
  };

  const recommendedPack = getRecommendedPack();

  // Intersection observer for animations
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

    Object.values(sectionsRef.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleProfileClick = (index: number, classes: number) => {
    setSelectedProfile(index);
    setClassCount(classes);
  };

  const handlePackClick = async (planId: string) => {
    // Free plan
    if (planId === "free") {
      if (!isAuthenticated) {
        openAuthModal();
      } else {
        navigate("/classcouncil-ai/app");
      }
      return;
    }

    // Paid plans → mailto during launch phase
    window.location.href = MAILTO_LINK;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header/Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="AIProject4You" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold">
              <span className="text-accent">AI</span>
              <span className="text-foreground">Project4You</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16 px-4 md:px-6">
        {/* Hero Section */}
        <section
          id="pricing-hero"
          ref={(el) => (sectionsRef.current["pricing-hero"] = el)}
          className={cn(
            "text-center max-w-4xl mx-auto mb-16 transition-all duration-700",
            isVisible["pricing-hero"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">
            Tarifs
          </Badge>
          <h1 className="text-3xl md:text-[44px] font-extrabold text-primary mb-4 leading-tight">
            Des prix pensés pour{" "}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              les enseignants
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Commencez gratuitement avec 5 élèves. Payez uniquement selon vos besoins.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-secondary text-secondary-foreground text-sm">
            <Shield className="h-4 w-4 text-secondary" />
            <span>Données 100% locales • RGPD • Aucune donnée élève sur nos serveurs</span>
          </div>
        </section>

        {/* Pricing Cards */}
        {/* Launch Banner */}
        <section className="max-w-[1400px] mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-start gap-4 p-5 rounded-xl bg-blue-50 dark:bg-slate-800 border-l-4 border-[#f0a830]">
            <Info className="h-6 w-6 text-[#f0a830] flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-foreground leading-relaxed">
                🚀 Phase de lancement — Le système de paiement est actuellement en cours de mise en place. Pour toute demande de crédits supplémentaires ou d'accès Pro, contactez-nous par email et bénéficiez de{" "}
                <span className="font-bold text-[#f0a830]">50% de réduction</span> sur les tarifs affichés !
              </p>
              <a
                href={MAILTO_LINK}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0a830] hover:bg-[#e09520] text-white text-sm font-medium transition-colors"
              >
                <Mail className="h-4 w-4" />
                Nous contacter
              </a>
            </div>
          </div>
        </section>

        <section
          id="pricing-cards"
          ref={(el) => (sectionsRef.current["pricing-cards"] = el)}
          className={cn(
            "max-w-[1400px] mx-auto mb-20 transition-all duration-700 delay-200",
            isVisible["pricing-cards"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-visible lg:gap-5">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={() => handlePackClick(plan.id)}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
        </section>

        {/* Simulator */}
        <section
          id="simulator"
          ref={(el) => (sectionsRef.current["simulator"] = el)}
          className={cn(
            "max-w-[700px] mx-auto mb-16 transition-all duration-700 delay-300",
            isVisible["simulator"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Card className="bg-gradient-to-br from-primary to-primary-hover border-0 text-primary-foreground p-8 rounded-3xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">🎯 Quel pack est fait pour vous ?</h2>
              <p className="text-primary-foreground/70 text-[15px]">
                Sélectionnez votre profil ou ajustez le nombre de classes
              </p>
            </div>

            {/* Profile buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {profilePresets.map((profile, index) => (
                <button
                  key={index}
                  onClick={() => handleProfileClick(index, profile.classes)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                    selectedProfile === index
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-primary-foreground/30 text-primary-foreground/80 hover:border-primary-foreground/50"
                  )}
                >
                  {profile.icon} {profile.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-primary-foreground/60">1 classe</span>
                <span className="text-2xl font-extrabold text-secondary">{classCount}</span>
                <span className="text-sm text-primary-foreground/60">18 classes</span>
              </div>
              <Slider
                value={[classCount]}
                onValueChange={(val) => {
                  setClassCount(val[0]);
                  setSelectedProfile(null);
                }}
                min={1}
                max={18}
                step={1}
                className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-secondary [&_[role=slider]]:to-secondary/80 [&_[role=slider]]:border-[3px] [&_[role=slider]]:border-primary [&>span:first-child]:bg-primary-foreground/10 [&>span:first-child>span]:bg-secondary"
              />
              <p className="text-center text-primary-foreground/70 mt-4 text-sm">
                ~{estimatedStudents} élèves estimés sur l'année
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-accent/20 border border-accent/40 rounded-2xl p-6 text-center">
              <p className="text-xs uppercase font-semibold text-accent tracking-wider mb-2">
                ⭐ Notre recommandation
              </p>
              <p className="text-lg font-bold text-primary-foreground mb-1">
                Pack {recommendedPack.name}
              </p>
              <p className="text-3xl font-extrabold text-accent-hover mb-1">
                {recommendedPack.price}
              </p>
              <p className="text-xs text-primary-foreground/60">
                {recommendedPack.students} élèves inclus
              </p>
            </div>
          </Card>
        </section>

        {/* Établissement Section */}
        <section
          id="etablissement"
          ref={(el) => (sectionsRef.current["etablissement"] = el)}
          className={cn(
            "max-w-[700px] mx-auto mb-12 transition-all duration-700 delay-400",
            isVisible["etablissement"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Card className="p-8 rounded-3xl text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <School className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary">Offre Établissement</h3>
            </div>
            <p className="text-muted-foreground mb-2">
              Équipez toute votre équipe pédagogique à partir de <strong>199€/an</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Facture établissement • Formation incluse • Support dédié
            </p>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => window.location.href = MAILTO_LINK}
            >
              Nous contacter →
            </Button>
          </Card>
        </section>

        {/* Promo Code Section */}
        <section
          id="promo-code"
          ref={(el) => (sectionsRef.current["promo-code"] = el)}
          className={cn(
            "max-w-[500px] mx-auto mb-12 transition-all duration-700 delay-500",
            isVisible["promo-code"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <PromoCodeInput 
            variant="card" 
            onSuccess={() => {
              toast({
                title: "🎉 Crédits ajoutés !",
                description: "Votre solde a été mis à jour.",
              });
            }}
          />
        </section>

        {/* Garantie */}
        <section className="text-center text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Satisfait ou remboursé pendant 30 jours • Paiement sécurisé via Stripe</span>
          </div>
        </section>
      </main>
    </div>
  );
};

// Pricing Card Component
interface PricingCardProps {
  plan: typeof pricingPlans[0];
  onSelect: () => void;
  loading?: boolean;
}

const PricingCard = ({ plan, onSelect, loading }: PricingCardProps) => {
  const isGold = plan.theme === "gold";
  const isDark = plan.theme === "dark";

  return (
    <Card
      className={cn(
        "relative flex-shrink-0 w-[260px] min-w-[220px] snap-center p-7 rounded-[20px] transition-all duration-300 hover:scale-[1.02]",
        isGold && "scale-[1.04] border-2 border-accent shadow-[0_8px_40px_rgba(240,168,48,0.2)] hover:scale-[1.06]",
        isDark && "bg-gradient-to-br from-primary to-primary-hover border-2 border-secondary/30 text-primary-foreground",
        !isGold && !isDark && "bg-card border border-border hover:shadow-lg"
      )}
    >
      {/* Launch badge */}
      {plan.id !== "free" && (
        <div className="absolute -top-3 left-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-full shadow-md z-10">
          OFFRE DE LANCEMENT -50%
        </div>
      )}
      {/* Badges */}
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-accent to-accent-hover text-white text-[11px] font-bold uppercase rounded-full shadow-md">
          RECOMMANDÉ
        </div>
      )}
      {plan.bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-hover to-primary text-primary-foreground text-[11px] font-bold uppercase rounded-full border border-secondary/30 shadow-md">
          ⭐ BEST VALUE
        </div>
      )}

      {/* Plan name */}
      <p
        className={cn(
          "text-[13px] font-semibold uppercase tracking-wide mb-3",
          isGold && "text-accent",
          isDark && "text-secondary",
          !isGold && !isDark && "text-muted-foreground"
        )}
      >
        {plan.name}
      </p>

      {/* Price */}
      <div className="mb-3">
        <span
          className={cn(
            "text-[40px] font-extrabold",
            isGold && "text-accent",
            isDark && "text-primary-foreground",
            !isGold && !isDark && "text-foreground"
          )}
        >
          {plan.price}
        </span>
        {plan.priceSubtext && (
          <span className={cn("text-[13px] ml-1", isDark ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {plan.priceSubtext}
          </span>
        )}
      </div>

      {/* Students badge */}
      <Badge
        className={cn(
          "mb-3 font-medium",
          isGold && "bg-accent/20 text-accent border-accent/30",
          isDark && "bg-secondary/20 text-secondary border-secondary/30",
          !isGold && !isDark && "bg-muted text-muted-foreground"
        )}
      >
        👤 {plan.studentLabel}
      </Badge>

      {/* Description */}
      <p
        className={cn(
          "text-sm italic mb-4",
          isDark ? "text-primary-foreground/70" : "text-muted-foreground"
        )}
      >
        {plan.description}
      </p>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check
              className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                isGold && "text-accent",
                isDark && "text-secondary",
                !isGold && !isDark && "text-secondary"
              )}
            />
            <span className={isDark ? "text-primary-foreground/80" : "text-foreground"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={onSelect}
        disabled={loading}
        className={cn(
          "w-full rounded-xl h-11 font-medium transition-all",
          isGold && "bg-gradient-to-r from-accent to-accent-hover text-white hover:shadow-lg",
          isDark && "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary",
          !isGold && !isDark && "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.cta}
      </Button>
    </Card>
  );
};

export default Pricing;
