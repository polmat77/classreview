import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const faqs: FAQItem[] = [
    {
      question: "Est-ce vraiment gratuit ?",
      answer:
        "Oui ! ClassCouncilAI est 100% gratuit et illimité. ReportCardAI offre 30 appréciations gratuites par mois. Pour un usage intensif, vous pouvez passer à l'offre Pro à partir de 3,25€/mois.",
    },
    {
      question: "Mes données élèves sont-elles protégées ?",
      answer:
        "Absolument. Toutes les données sont traitées localement dans votre navigateur. Aucune information personnelle n'est envoyée sur nos serveurs. Nous sommes 100% conformes RGPD.",
    },
    {
      question: "Comment importer mes données depuis PRONOTE ?",
      answer:
        "C'est très simple ! Exportez votre bulletin ou conseil de classe en PDF depuis PRONOTE, puis glissez-déposez le fichier dans notre outil. L'extraction des données est automatique.",
    },
    {
      question: "Les appréciations générées sont-elles de qualité ?",
      answer:
        "Oui ! Notre IA a été entraînée spécifiquement pour générer des appréciations professionnelles et personnalisées. Vous pouvez choisir parmi 6 tons différents (sévère, neutre, bienveillant, encourageant, élogieux, constructif) et ajuster le résultat à votre guise.",
    },
    {
      question: "Puis-je utiliser les outils sur tablette ou mobile ?",
      answer:
        "Nos outils sont optimisés pour une utilisation sur ordinateur pour un confort optimal. Cependant, ils fonctionnent également sur tablette. L'utilisation sur smartphone est possible mais moins confortable.",
    },
    {
      question: "Comment fonctionne la limite de caractères PRONOTE ?",
      answer:
        "Nos outils respectent automatiquement les limites de caractères de PRONOTE. Vous pouvez configurer la limite (généralement 300-500 caractères) et l'IA génèrera des appréciations qui s'y conforment.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Questions fréquentes
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Tout ce que vous devez savoir sur AIProject4You
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6 shadow-sm dark:shadow-none transition-colors"
            >
              <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
