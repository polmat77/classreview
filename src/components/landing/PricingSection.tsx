import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PricingPlan {
  badge: string;
  badgeColor: string;
  name: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  dark?: boolean;
}

const plans: PricingPlan[] = [
  {
    badge: "GRATUIT",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    name: "Découverte",
    price: "0€",
    priceSuffix: "/mois",
    features: [
      "5 élèves inclus",
      "Accès à tous les outils",
      "Données 100% locales (RGPD)",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
  },
  {
    badge: "POPULAIRE",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    name: "Individuel",
    price: "29€",
    priceSuffix: "/an",
    features: [
      "50 élèves par an",
      "Tous les outils inclus",
      "Mises à jour automatiques",
      "Support prioritaire",
    ],
    cta: "Souscrire",
    highlighted: true,
  },
  {
    badge: "PRO",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    name: "Enseignant+",
    price: "69€",
    priceSuffix: "/an",
    features: [
      "150 élèves par an",
      "Fonctionnalités avancées",
      "Export multi-formats",
      "Support premium",
    ],
    cta: "Choisir ce pack",
  },
  {
    badge: "ÉTABLISSEMENT",
    badgeColor: "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300",
    name: "Sur mesure",
    price: "Sur devis",
    features: [
      "500 à 2000 élèves",
      "Licence établissement complète",
      "Formation équipe pédagogique",
      "Support dédié & accompagnement",
    ],
    cta: "Nous contacter",
    dark: true,
  },
];

const faqs = [
  {
    question: "Comment sont comptés les élèves ?",
    answer:
      "Un élève = une génération d'appréciation ou de bulletin. Exemple : 25 élèves × 3 trimestres = 75 générations = pack à 69€/an.",
  },
  {
    question: "Puis-je changer de pack en cours d'année ?",
    answer:
      "Oui, vous pouvez upgrader à tout moment. Le crédit restant est déduit du nouveau pack.",
  },
  {
    question: "Les tarifs établissement incluent-ils la formation ?",
    answer:
      "Oui, le pack établissement (à partir de 199€/an) inclut une formation complète de l'équipe pédagogique et un support dédié.",
  },
];

const PricingSection = () => {
  const { openAuthModal } = useAuth();

  const handleCtaClick = (plan: PricingPlan) => {
    if (plan.dark) {
      window.location.href = "mailto:contact@aiproject4you.com?subject=Offre Établissement";
    } else {
      openAuthModal();
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tarifs Simples et Transparents
          </h2>
        </div>
        <p className="text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Payez uniquement pour vos élèves, pas pour des appels API techniques.{" "}
          Modèle freemium adapté aux besoins réels des enseignants.
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`rounded-2xl relative flex flex-col transition-all hover:shadow-lg ${
                plan.highlighted
                  ? "border-2 border-[#f0a830] shadow-lg scale-105 bg-white dark:bg-slate-800"
                  : plan.dark
                  ? "bg-slate-900 dark:bg-slate-950 text-white border-slate-800"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 right-4 bg-[#f0a830] text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMANDÉ
                </div>
              )}

              <CardHeader className="pb-2 pt-8 px-6">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full w-fit mb-3 ${plan.badgeColor}`}
                >
                  {plan.badge}
                </span>
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.dark ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mt-2">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.dark ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span
                      className={`text-sm ml-1 ${
                        plan.dark ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col px-6 pb-8">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.highlighted
                            ? "text-[#f0a830]"
                            : plan.dark
                            ? "text-[#7dd3e8]"
                            : "text-emerald-500"
                        }`}
                      />
                      <span
                        className={
                          plan.dark
                            ? "text-slate-300"
                            : "text-slate-700 dark:text-slate-300"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCtaClick(plan)}
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-[#f0a830] hover:bg-[#e09520] text-white"
                      : plan.dark
                      ? "border border-[#7dd3e8] text-[#7dd3e8] hover:bg-[#7dd3e8] hover:text-white bg-transparent"
                      : "bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600"
                  }`}
                  variant={plan.dark ? "outline" : "default"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RGPD Note */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center mb-16">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>
              🔒 Toutes les données sont traitées localement sur votre appareil.
              Aucune donnée élève n'est stockée sur nos serveurs. Conformité RGPD garantie.
            </span>
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Questions fréquentes
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-slate-900 dark:text-white font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
