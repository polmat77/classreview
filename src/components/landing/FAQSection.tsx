import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Mes données sont-elles en sécurité ?",
      answer:
        "Absolument. Toutes les données sont traitées localement dans votre navigateur. Rien n'est stocké sur nos serveurs. Conformité RGPD totale.",
    },
    {
      question: "Les outils fonctionnent-ils avec PRONOTE ?",
      answer:
        "Oui. ClassCouncil AI et ReportCard AI sont conçus pour importer directement les exports PDF de PRONOTE, la solution la plus utilisée en France.",
    },
    {
      question: "Est-ce gratuit ?",
      answer:
        "Oui, les outils sont actuellement gratuits pour tous les enseignants. Notre objectif est de faciliter votre quotidien.",
    },
    {
      question: "Puis-je suggérer un nouvel outil ?",
      answer:
        "Bien sûr ! N'hésitez pas à nous contacter pour partager vos besoins. Ensemble, nous faisons évoluer la plateforme.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-[#f8fafc] scroll-mt-20">
      <div className="container mx-auto max-w-3xl">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2332] mb-4">
            Questions fréquentes
          </h2>
          <p className="text-[#94a3b8] text-lg">
            Tout ce que vous devez savoir sur nos outils
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#1a2332] pr-4">
                  {item.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openIndex === index
                      ? "bg-[#06b6d4] text-white"
                      : "bg-[#06b6d4]/10 text-[#06b6d4]"
                  }`}
                >
                  {openIndex === index ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-5 text-[#94a3b8] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
