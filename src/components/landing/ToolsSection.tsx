import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import classCouncilLogo from "@/assets/logo.png";
import reportCardLogo from "@/assets/Logo_ReportCardAI.png";

const ToolsSection = () => {
  const tools = [
    {
      id: "classcouncil",
      name: "ClassCouncil",
      logo: classCouncilLogo,
      title: "ClassCouncil AI: Préparez vos conseils de classe en un clic",
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
      title: "ReportCard AI: Rédigez vos bulletins plus rapidement",
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
      title: "QuizMaster: Créez des évaluations interactives",
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

  // App mockup component for the cards
  const AppMockup = ({ tool }: { tool: typeof tools[0] }) => (
    <div className="bg-slate-100 rounded-lg p-3 mb-4">
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {/* App header mockup */}
        <div className="bg-navy h-8 flex items-center px-3 gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        {/* App content mockup */}
        <div className="p-3 space-y-2">
          <div className="flex gap-2">
            <div className="w-16 h-3 bg-cyan/30 rounded" />
            <div className="w-12 h-3 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded w-full" />
            <div className="h-2 bg-slate-100 rounded w-5/6" />
            <div className="h-2 bg-slate-100 rounded w-4/6" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-cyan/20 rounded flex-1" />
            <div className="h-6 bg-gold/20 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );

  // Quiz mockup for QuizMaster
  const QuizMockup = () => (
    <div className="bg-slate-100 rounded-lg p-3 mb-4 flex items-center justify-center h-32">
      <div className="text-4xl font-black text-navy/20 tracking-wider">
        QUIZ
      </div>
    </div>
  );

  return (
    <section id="outils" className="py-20 lg:py-28 px-4 bg-muted scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
            Nos solutions pour simplifier votre quotidien
          </h2>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`bg-white border border-border relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl ${
                !tool.available ? "opacity-90" : ""
              }`}
            >
              {/* Status Badge */}
              {!tool.available && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-slate-200 text-slate-600 border-0 font-medium">
                    Coming Soon
                  </Badge>
                </div>
              )}

              <CardContent className="p-5">
                {/* Logo header */}
                <div className="flex items-center gap-3 mb-4">
                  {tool.logo ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                      <span className="text-gold font-bold text-sm">Q</span>
                    </div>
                  )}
                  <span className="font-semibold text-navy">
                    {tool.name} <span className="text-gold">AI</span>
                  </span>
                </div>

                {/* App Mockup */}
                {tool.available ? <AppMockup tool={tool} /> : <QuizMockup />}

                {/* Title */}
                <h3 className="font-semibold text-navy text-sm mb-3">
                  {tool.title.split(":")[0]}:{" "}
                  <span className="font-normal text-muted-foreground">
                    {tool.title.split(":")[1]}
                  </span>
                </h3>

                {/* Features List */}
                <ul className="space-y-1.5 text-xs text-muted-foreground mb-5">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {tool.available ? (
                  <Link to={tool.link} className="block">
                    <Button className="w-full bg-cyan hover:bg-cyan-vibrant text-white rounded-lg transition-all font-medium">
                      Essayer
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full border-slate-300 text-slate-500 cursor-not-allowed rounded-lg"
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
