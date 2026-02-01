import { Upload, Settings, Sparkles, Copy } from "lucide-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowItWorksSection = () => {
  const steps: Step[] = [
    {
      number: 1,
      icon: <Upload className="w-6 h-6 text-[#7dd3e8]" />,
      title: "Importez vos données",
      description: "Glissez-déposez votre fichier PDF ou CSV exporté depuis PRONOTE.",
    },
    {
      number: 2,
      icon: <Settings className="w-6 h-6 text-[#7dd3e8]" />,
      title: "Configurez vos préférences",
      description: "Choisissez le ton et les options adaptés à chaque élève.",
    },
    {
      number: 3,
      icon: <Sparkles className="w-6 h-6 text-[#7dd3e8]" />,
      title: "Générez en un clic",
      description: "L'IA génère des appréciations personnalisées instantanément.",
    },
    {
      number: 4,
      icon: <Copy className="w-6 h-6 text-[#7dd3e8]" />,
      title: "Copiez dans PRONOTE",
      description: "Copiez-collez directement les appréciations dans votre logiciel.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Comment ça marche ?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            3 étapes simples pour gagner du temps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Number */}
              <div className="w-10 h-10 rounded-full bg-[#f0a830] text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 transition-colors">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
