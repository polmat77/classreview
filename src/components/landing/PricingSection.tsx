import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  dark?: boolean;
}

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Gratuit",
      monthlyPrice: "0€",
      yearlyPrice: "0€",
      description: "Pour découvrir les outils",
      features: [
        { text: "ClassCouncilAI illimité", included: true },
        { text: "ReportCardAI - 30 appréciations/mois", included: true },
        { text: "Import PDF PRONOTE", included: true },
        { text: "Tous les tons disponibles", included: false },
        { text: "Export PDF", included: false },
        { text: "Support prioritaire", included: false },
      ],
      cta: "Commencer gratuitement",
      ctaHref: "/classcouncil-ai",
    },
    {
      name: "Pro",
      monthlyPrice: "4,99€",
      yearlyPrice: "3,25€",
      description: "Pour les enseignants actifs",
      features: [
        { text: "ClassCouncilAI illimité", included: true },
        { text: "ReportCardAI illimité", included: true },
        { text: "Import PDF PRONOTE", included: true },
        { text: "Tous les tons disponibles", included: true },
        { text: "Export PDF premium", included: true },
        { text: "Support prioritaire", included: true },
      ],
      cta: "Essayer Pro gratuitement",
      ctaHref: "/classcouncil-ai",
      highlighted: true,
    },
    {
      name: "School",
      monthlyPrice: "Sur devis",
      yearlyPrice: "Sur devis",
      description: "Pour les établissements",
      features: [
        { text: "Toutes les fonctionnalités Pro", included: true },
        { text: "Licences pour tout l'établissement", included: true },
        { text: "Formation équipe pédagogique", included: true },
        { text: "API personnalisée", included: true },
        { text: "Facturation établissement", included: true },
        { text: "Support dédié", included: true },
      ],
      cta: "Nous contacter",
      ctaHref: "#",
      dark: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Des prix pensés pour les enseignants
          </h2>
          <p className="text-slate-600 mt-2">
            Commencez gratuitement, évoluez selon vos besoins
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !isYearly
                ? "bg-[#f0a830] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
              isYearly
                ? "bg-[#f0a830] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Annuel
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              -35%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`rounded-xl p-8 relative transition-all hover:shadow-lg ${
                plan.highlighted
                  ? "border-2 border-[#f0a830] shadow-lg scale-105 bg-white"
                  : plan.dark
                  ? "bg-slate-900 text-white border-slate-800"
                  : "bg-white border border-slate-200"
              }`}
            >
              {/* Recommended Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 right-4 bg-[#f0a830] text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMANDÉ
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={`text-xl font-bold mb-1 ${
                  plan.dark ? "text-white" : "text-slate-900"
                }`}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p
                className={`text-sm mb-4 ${
                  plan.dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={`text-5xl font-bold ${
                    plan.dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice !== "Sur devis" && (
                  <span
                    className={`text-sm ${
                      plan.dark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    /mois
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check
                        className={`w-4 h-4 ${
                          plan.highlighted
                            ? "text-[#f0a830]"
                            : plan.dark
                            ? "text-[#7dd3e8]"
                            : "text-slate-400"
                        }`}
                      />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                    <span
                      className={
                        feature.included
                          ? plan.dark
                            ? "text-slate-200"
                            : "text-slate-700"
                          : "text-slate-400"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.ctaHref === "#" ? (
                <Button
                  variant="outline"
                  className={`w-full ${
                    plan.dark
                      ? "border-[#7dd3e8] text-[#7dd3e8] hover:bg-[#7dd3e8] hover:text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Link to={plan.ctaHref}>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-[#f0a830] hover:bg-[#e09520] text-white"
                        : "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
