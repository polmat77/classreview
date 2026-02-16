import { useState } from "react";
import { Check, Shield, Loader2, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, StripePlanKey } from "@/config/stripe";
import PricingFAQ from "./pricing/PricingFAQ";

const MAILTO_LINK = "mailto:aiproject4you@gmail.com?subject=Demande%20d'acc%C3%A8s%20Pro%20-%20AIProject4You&body=Bonjour,%0D%0A%0D%0AJe%20souhaiterais%20b%C3%A9n%C3%A9ficier%20de%20l'offre%20de%20lancement%20%C3%A0%20-50%25%20sur%20les%20tarifs%20AIProject4You.%0D%0A%0D%0AMon%20email%20de%20connexion%20:%20%0D%0ANombre%20de%20cr%C3%A9dits%20souhait%C3%A9%20:%20%0D%0A%0D%0AMerci%20!";

interface PricingPlan {
  badge?: string;
  badgeStyle?: string;
  name: string;
  price: string;
  priceSuffix?: string;
  description?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  dark?: boolean;
  checkColor?: string;
}

const plans: PricingPlan[] = [
  {
    badge: "GRATUIT",
    badgeStyle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    name: "Découverte",
    price: "0€",
    description: "5 élèves offerts à vie",
    features: [
      "5 élèves inclus",
      "Accès à tous les outils",
      "Import PDF PRONOTE",
      "Tous les tons disponibles",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Commencer l'essai gratuit",
  },
  {
    name: "1 Classe",
    price: "4,99€",
    priceSuffix: "/année scolaire",
    description: "35 élèves inclus",
    features: [
      "35 élèves par année scolaire",
      "Tous les outils inclus",
      "Import PDF PRONOTE",
      "Bilans de classe inclus",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
  },
  {
    badge: "RECOMMANDÉ",
    badgeStyle: "bg-gradient-to-r from-[#f0a830] to-[#f5c563] text-white",
    name: "4 Classes",
    price: "14,99€",
    priceSuffix: "/année scolaire",
    description: "140 élèves inclus",
    features: [
      "140 élèves par année scolaire",
      "Tous les outils inclus",
      "Import PDF PRONOTE",
      "Bilans de classe inclus",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
    highlighted: true,
    checkColor: "text-[#f0a830]",
  },
  {
    name: "Année complète",
    price: "29,99€",
    priceSuffix: "/année scolaire",
    description: "500 élèves inclus",
    features: [
      "500 élèves par année scolaire",
      "Tous les outils inclus",
      "Import PDF PRONOTE",
      "Bilans de classe inclus",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
  },
  {
    badge: "⭐ BEST VALUE",
    badgeStyle: "bg-gradient-to-r from-[#1a2332] to-[#2c3e50] text-white",
    name: "Toutes les classes",
    price: "39,99€",
    priceSuffix: "/année scolaire",
    description: "2 000 élèves inclus",
    features: [
      "2 000 élèves par année scolaire",
      "Idéal profs musique, techno, arts, EPS",
      "Tous les outils inclus",
      "Bilans de classe inclus",
      "3 régénérations gratuites / classe",
      "Données 100% locales (RGPD)",
    ],
    cta: "Choisir ce pack",
    dark: true,
    checkColor: "text-[#7dd3e8]",
  },
];

const planToStripeKey: Record<string, StripePlanKey> = {
  "1 Classe": "one_class",
  "4 Classes": "four_classes",
  "Année complète": "year",
  "Toutes les classes": "all_classes",
};

const PricingSection = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCtaClick = async (plan: PricingPlan) => {
    // All paid plans → mailto
    if (plan.price !== "0€") {
      window.location.href = MAILTO_LINK;
      return;
    }
    // Free plan → auth modal
    openAuthModal();
  };

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#1a2332] dark:text-white leading-tight">
            Des prix pensés pour{" "}
            <span className="bg-gradient-to-r from-[#f0a830] to-[#f5c563] bg-clip-text text-transparent">
              les enseignants
            </span>
          </h2>
        </div>
        <p className="text-center text-[#64748b] dark:text-slate-400 max-w-2xl mx-auto mb-6 text-base sm:text-lg">
          Payez uniquement pour vos élèves. Commencez gratuitement, évoluez selon vos besoins.
        </p>

        {/* Launch Banner */}
        <div className="max-w-[900px] mx-auto mb-10 bg-blue-50 dark:bg-slate-800 border-l-4 border-[#f0a830] rounded-r-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Info className="w-6 h-6 text-[#f0a830] flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
            🚀 Phase de lancement — Le système de paiement est actuellement en cours de mise en place. Pour toute demande de crédits supplémentaires ou d'accès Pro, contactez-nous par email et bénéficiez de{" "}
            <span className="font-bold text-[#f0a830]">50% de réduction</span> sur les tarifs affichés !
          </div>
          <a href={MAILTO_LINK}>
            <Button className="bg-[#f0a830] hover:bg-[#e09520] text-white rounded-full whitespace-nowrap gap-2">
              <Mail className="w-4 h-4" />
              Nous contacter
            </Button>
          </a>
        </div>

        {/* Pricing Cards */}
        <div className="flex gap-4 lg:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none lg:justify-center items-end mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col snap-center transition-all duration-300 hover:-translate-y-1 rounded-2xl flex-shrink-0
                w-[220px] min-w-[200px] max-w-[240px]
                ${plan.highlighted
                  ? "border-2 border-[#f0a830] shadow-[0_8px_32px_rgba(240,168,48,0.2)] scale-[1.03] bg-white dark:bg-slate-800 hover:shadow-[0_12px_40px_rgba(240,168,48,0.3)]"
                  : plan.dark
                  ? "bg-gradient-to-b from-[#1a2332] to-[#2c3e50] border-2 border-[#3d5a80] text-white hover:shadow-xl"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#f0a830] to-[#f5c563] text-white text-[11px] font-bold uppercase px-4 py-1 rounded-full whitespace-nowrap">
                  RECOMMANDÉ
                </div>
              )}

              {plan.price !== "0€" && (
                <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10">
                  OFFRE DE LANCEMENT -50%
                </div>
              )}

              <CardHeader className="pb-1 pt-7 px-5">
                {plan.badge && !plan.highlighted && (
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit mb-2 ${plan.badgeStyle}`}>
                    {plan.badge}
                  </span>
                )}
                {!plan.badge && !plan.highlighted && <div className="h-5 mb-2" />}
                {plan.highlighted && <div className="h-5 mb-2" />}

                <h3 className={`text-lg font-bold mb-0.5 ${plan.dark ? "text-[#7dd3e8]" : "text-[#1a2332] dark:text-white"}`}>
                  {plan.name}
                </h3>

                <div className="mt-1">
                  <span className={`text-3xl font-extrabold ${plan.dark ? "text-white" : "text-[#1a2332] dark:text-white"}`}>
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span className={`text-xs ml-1 ${plan.dark ? "text-[#94a3b8]" : "text-[#64748b] dark:text-slate-400"}`}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className={`text-xs mt-1 ${plan.dark ? "text-[#94a3b8]" : "text-[#64748b] dark:text-slate-400"}`}>
                    {plan.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col px-5 pb-6 pt-3">
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-1.5 text-[13px]">
                      <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.checkColor || (plan.dark ? "text-[#7dd3e8]" : "text-emerald-500")}`} />
                      <span className={plan.dark ? "text-slate-300" : "text-slate-700 dark:text-slate-300"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCtaClick(plan)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full text-sm ${
                    plan.highlighted
                      ? "bg-[#f0a830] hover:bg-[#e09520] hover:shadow-[0_4px_16px_rgba(240,168,48,0.4)] text-white border-0"
                      : plan.dark
                      ? "border border-[#7dd3e8] text-[#7dd3e8] hover:bg-[#7dd3e8] hover:text-[#1a2332] bg-transparent"
                      : "border border-[#1a2332] dark:border-slate-500 text-[#1a2332] dark:text-white hover:bg-[#1a2332] hover:text-white dark:hover:bg-slate-600 bg-transparent"
                  }`}
                  variant="outline"
                >
                  {loadingPlan === plan.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Offre Établissement */}
        <div className="max-w-[900px] mx-auto mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-md border border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <span className="text-2xl">🏫</span>
                <h3 className="text-xl font-bold text-[#1a2332] dark:text-white">Offre Établissement</h3>
              </div>
              <p className="text-[#1a2332] dark:text-slate-200 font-medium mb-1">
                Équipez toute votre équipe pédagogique à partir de 199€/an
              </p>
              <p className="text-sm text-[#64748b] dark:text-slate-400">
                Contactez-nous pour un devis personnalisé • Facture établissement • Formation incluse • Support dédié
              </p>
            </div>
            <a href={MAILTO_LINK}>
              <Button
                variant="outline"
                className="border-[#1a2332] dark:border-slate-500 text-[#1a2332] dark:text-white hover:bg-[#1a2332] hover:text-white dark:hover:bg-slate-600 whitespace-nowrap"
              >
                Nous contacter
              </Button>
            </a>
          </div>
        </div>

        {/* RGPD + Garantie */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center mb-16">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>
              🔒 Paiement sécurisé en ligne — Souscrivez en quelques clics et commencez immédiatement !
            </span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Données 100% locales • Conformité RGPD garantie • Satisfait ou remboursé pendant 30 jours
          </p>
        </div>

        {/* FAQ */}
        <PricingFAQ />
      </div>
    </section>
  );
};

export default PricingSection;
