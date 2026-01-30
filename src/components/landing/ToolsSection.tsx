import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Tool {
  name: string;
  aiSuffix: boolean;
  description: string;
  features: string[];
  icon: React.ReactNode;
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
      icon: <MessageSquare className="w-8 h-8 text-[#7dd3e8]" />,
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
      icon: <FileText className="w-8 h-8 text-[#7dd3e8]" />,
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
      icon: <HelpCircle className="w-8 h-8 text-slate-400" />,
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
              {/* Icon */}
              <div className="mb-4 relative">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                  {tool.icon}
                </div>
                {tool.comingSoon && (
                  <span className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">
                    Bientôt
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {tool.name}
                {tool.aiSuffix && <span className="text-[#f0a830]">AI</span>}
              </h3>

              {/* Description */}
              <p className={`text-sm mb-4 ${tool.comingSoon ? "text-slate-400" : "text-slate-600"}`}>
                {tool.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tool.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className={`flex items-center gap-2 text-sm ${
                      tool.comingSoon ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${tool.comingSoon ? "text-slate-300" : "text-slate-500"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {tool.comingSoon ? (
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-400 cursor-not-allowed"
                  disabled
                >
                  Bientôt disponible
                </Button>
              ) : (
                <Link to={tool.href}>
                  <Button
                    variant="outline"
                    className="w-full border-[#7dd3e8] text-[#7dd3e8] hover:bg-[#7dd3e8] hover:text-white transition-colors"
                  >
                    Essayer gratuitement
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

export default ToolsSection;
