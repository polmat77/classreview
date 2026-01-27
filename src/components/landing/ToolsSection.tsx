import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import classCouncilLogo from "@/assets/logo.png";
import reportCardLogo from "@/assets/Logo_ReportCardAI.png";

const ToolsSection = () => {
  const tools = [
    {
      id: "classcouncil",
      name: "ClassCouncil",
      logo: classCouncilLogo,
      subtitle: "Préparez vos conseils de classe en un clic",
      features: [
        "Génération automatique de synthèses",
        "Suggestions de commentaires personnalisés",
        "Analyse des résultats par élève et matière",
        "Export compatible avec les logiciels scolaires",
      ],
      available: true,
      link: "/classcouncil-ai",
    },
    {
      id: "reportcard",
      name: "ReportCard",
      logo: reportCardLogo,
      subtitle: "Rédigez vos bulletins plus rapidement",
      features: [
        "Commentaires détaillés et constructifs",
        "Adaptation automatique au niveau de l'élève",
        "Gain de temps significatif sur la saisie",
        "Respect de votre style pédagogique",
      ],
      available: true,
      link: "/reportcard-ai",
    },
    {
      id: "quizmaster",
      name: "QuizMaster",
      logo: null,
      subtitle: "Créez des évaluations interactives",
      features: [
        "Génération automatique de QCM",
        "Évaluations adaptées au niveau",
        "Correction automatisée",
        "Statistiques de progression",
      ],
      available: false,
      link: "#",
    },
  ];

  return (
    <section id="outils" className="py-24 px-4 bg-[#f8fafc] scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332]">
            Nos solutions pour simplifier votre quotidien
          </h2>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`bg-white border border-gray-200 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl ${
                !tool.available ? "opacity-80" : ""
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {tool.available ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Disponible
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-0">
                    Coming Soon
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-4">
                {/* Logo/Icon */}
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                  {tool.logo ? (
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">QUIZ</div>
                  )}
                </div>
                <CardTitle className="text-xl text-[#1a2332]">
                  {tool.name} <span className="text-[#f0a830]">AI</span>
                </CardTitle>
                <CardDescription className="text-base text-[#94a3b8]">
                  {tool.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <ul className="space-y-2 text-sm">
                  {tool.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-600"
                    >
                      <span className="text-[#06b6d4] mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {tool.available ? (
                  <Link to={tool.link} className="block">
                    <Button className="w-full bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white rounded-lg transition-all">
                      Essayer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 cursor-not-allowed rounded-lg"
                  >
                    Bientôt disponible
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
