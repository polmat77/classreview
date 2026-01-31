import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const classCouncilLogo = "/images/logos/ClassCouncilAI_logo.png";
const reportCardLogo = "/images/logos/ReportCardAI_logo.png";

interface Tool {
  name: string;
  aiSuffix: boolean;
  description: string;
  features: string[];
  logo?: string;
  icon?: React.ReactNode;
  href: string;
  comingSoon?: boolean;
}

const ToolsSection = () => {
  const tools: Tool[] = [
    {
      name: "ClassCouncil",
      aiSuffix: true,
      description: "Générez automatiquement les appréciations pour vos conseils de classe",
      features: [
        "Import PDF PRONOTE",
        "Analyse automatique des notes",
        "Appréciations personnalisées",
      ],
      logo: classCouncilLogo,
      href: "/classcouncil-ai",
    },
    {
      name: "ReportCard",
      aiSuffix: true,
      description: "Rédigez des appréciations de bulletins personnalisées en quelques clics",
      features: [
        "6 tons disponibles",
        "Limite de caractères PRONOTE",
        "Export copier-coller",
      ],
      logo: reportCardLogo,
      href: "/reportcard-ai",
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
      href: "#",
      comingSoon: true,
    },
  ];

  return (
    <section id="outils" className="py-20 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Nos outils pour les enseignants
          </h2>
          <p className="text-slate-600 mt-2">
            Une suite complète pour automatiser vos tâches administratives
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card
              key={index}
              className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md ${
                tool.comingSoon ? "opacity-75" : ""
              }`}
            >
              {/* Logo/Icon */}
              <div className="mb-4 relative">
                {tool.logo ? (
                  <img 
                    src={tool.logo} 
                    alt={`${tool.name}AI logo`} 
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    {tool.icon}
                  </div>
                )}
                {tool.comingSoon && (
                  <span className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
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
              <p className={`text-sm mb-4 ${tool.comingSoon ? "text-muted-foreground" : "text-muted-foreground"}`}>
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
                    <Check className={`w-4 h-4 ${tool.comingSoon ? "text-muted-foreground/40" : "text-secondary"}`} />
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
                <div className="space-y-2">
                  <Link to={`${tool.href}/app`}>
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-sm">
                      Essayer gratuitement
                    </Button>
                  </Link>
                  <Link to={tool.href}>
                    <Button
                      variant="ghost"
                      className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      En savoir plus →
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
