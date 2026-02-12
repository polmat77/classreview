import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const classCouncilLogo = "/images/logos/ClassCouncilAI_logo.png";
const reportCardLogo = "/images/logos/ReportCardAI_logo.png";

interface Tool {
  name: string;
  aiSuffix: boolean;
  description: string;
  features: string[];
  logo?: string;
  icon?: React.ReactNode;
  landingHref: string;
  appHref: string;
  comingSoon?: boolean;
}

const ToolsSection = () => {
  const navigate = useNavigate();

  const tools: Tool[] = [
    {
      name: "ClassCouncil",
      aiSuffix: true,
      description: "Préparez la totalité de votre conseil de classe en quelques clics",
      features: [
        "Import PDF PRONOTE",
        "Analyse automatique des notes",
        "Appréciations personnalisées",
      ],
      logo: classCouncilLogo,
      landingHref: "/classcouncil-ai",
      appHref: "/classcouncil-ai/app",
    },
    {
      name: "ReportCard",
      aiSuffix: true,
      description: "Créez en un instant des appréciations de bulletins sur mesure pour chacune de vos classes dans votre matière",
      features: [
        "4 tons disponibles",
        "Prise en compte du comportement, participation, bavardages...",
        "Export copier-coller",
      ],
      logo: reportCardLogo,
      landingHref: "/reportcard-ai",
      appHref: "/reportcard-ai/app",
    },
    {
      name: "QuizMaster",
      aiSuffix: true,
      description: "Créez des quiz interactifs pour vos élèves à partir de vos cours",
      features: [
        "Génération automatique",
        "QCM et questions ouvertes",
        "Export PDF",
      ],
      icon: <HelpCircle className="w-12 h-12 text-muted-foreground" />,
      landingHref: "#",
      appHref: "#",
      comingSoon: true,
    },
  ];

  return (
    <section id="outils" className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Nos outils pour les enseignants
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Une suite complète pour automatiser vos tâches administratives
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const cardContent = (
              <Card
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 transition-all duration-300 flex flex-col h-full ${
                  tool.comingSoon
                    ? "opacity-75"
                    : "hover:shadow-lg hover:border-secondary dark:hover:border-secondary cursor-pointer"
                }`}
              >
                {/* Logo/Icon */}
                <div className="mb-4 relative">
                  {tool.logo ? (
                    <img
                      src={tool.logo}
                      alt={`${tool.name}AI logo`}
                      className="h-16 max-h-[60px] w-auto object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted dark:bg-slate-700 flex items-center justify-center">
                      {tool.icon}
                    </div>
                  )}
                  {tool.comingSoon && (
                    <span className="absolute top-0 right-0 bg-muted dark:bg-slate-700 text-muted-foreground text-xs px-2 py-1 rounded-full">
                      Bientôt
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {tool.name}
                  {tool.aiSuffix && <span className="text-accent">AI</span>}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {tool.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tool.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center gap-2 text-sm ${
                        tool.comingSoon ? "text-muted-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`w-4 h-4 flex-shrink-0 ${tool.comingSoon ? "text-muted-foreground/40" : "text-secondary"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Buttons */}
                {tool.comingSoon ? (
                  <Button
                    variant="outline"
                    className="w-full border-border text-muted-foreground cursor-not-allowed"
                    disabled
                  >
                    Bientôt disponible
                  </Button>
                ) : (
                  <div className="space-y-2 mt-auto">
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-sm">
                      Découvrir l'outil →
                    </Button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(tool.appHref);
                      }}
                      className="w-full text-sm text-secondary hover:underline text-center py-1 transition-colors"
                    >
                      Accéder directement
                    </button>
                  </div>
                )}
              </Card>
            );

            if (tool.comingSoon) {
              return <div key={index}>{cardContent}</div>;
            }

            return (
              <Link key={index} to={tool.landingHref} className="block">
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
