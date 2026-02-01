import { FileUp, Shield, Sparkles, Check } from "lucide-react";
import logo from "@/assets/Logo_AIProject4youV2.png";
import heroImage from "@/assets/Hero_Site.png";

interface Feature {
  title: string;
  description: string;
  miniFeatures: { icon: React.ReactNode; text: string }[];
  image: string;
  imageAlt: string;
  reversed?: boolean;
}

const FeaturesSection = () => {
  const features: Feature[] = [
    {
      title: "Importez vos bulletins PRONOTE en un clic",
      description:
        "Notre technologie extrait automatiquement toutes les données nécessaires : moyennes, absences, comportement. Plus de saisie manuelle fastidieuse.",
      miniFeatures: [
        { icon: <Check className="w-4 h-4 text-[#7dd3e8]" />, text: "Import PDF simple" },
        { icon: <Check className="w-4 h-4 text-[#7dd3e8]" />, text: "Extraction automatique des données" },
        { icon: <Check className="w-4 h-4 text-[#7dd3e8]" />, text: "Compatible tous formats PRONOTE" },
      ],
      image: heroImage,
      imageAlt: "Interface d'import PRONOTE",
    },
    {
      title: "Vos données restent sur votre ordinateur",
      description:
        "100% conforme RGPD. Aucune donnée élève n'est envoyée sur nos serveurs. Tout le traitement se fait localement dans votre navigateur.",
      miniFeatures: [
        { icon: <Shield className="w-4 h-4 text-[#7dd3e8]" />, text: "Traitement 100% local" },
        { icon: <Shield className="w-4 h-4 text-[#7dd3e8]" />, text: "Aucun stockage serveur" },
        { icon: <Shield className="w-4 h-4 text-[#7dd3e8]" />, text: "Conformité RGPD garantie" },
      ],
      image: logo,
      imageAlt: "Logo AIProject4You - Sécurité des données",
      reversed: true,
    },
    {
      title: "Des appréciations personnalisées en quelques secondes",
      description:
        "Choisissez le ton adapté à chaque élève. L'IA génère des appréciations uniques, professionnelles et prêtes à copier dans PRONOTE.",
      miniFeatures: [
        { icon: <Sparkles className="w-4 h-4 text-[#7dd3e8]" />, text: "6 tons disponibles" },
        { icon: <Sparkles className="w-4 h-4 text-[#7dd3e8]" />, text: "Appréciations uniques" },
        { icon: <Sparkles className="w-4 h-4 text-[#7dd3e8]" />, text: "Prêt à copier dans PRONOTE" },
      ],
      image: heroImage,
      imageAlt: "Interface de génération d'appréciations",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col gap-12 items-center ${
                feature.reversed ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.miniFeatures.map((mini, miniIndex) => (
                    <li
                      key={miniIndex}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 justify-center lg:justify-start"
                    >
                      {mini.icon}
                      <span>{mini.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-colors">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
