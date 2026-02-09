import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment sont comptés les élèves ?",
    answer:
      "Un élève = une génération d'appréciation ou de bulletin. Exemple : 25 élèves × 3 trimestres = 75 générations.",
  },
  {
    question: "Puis-je changer de pack en cours d'année ?",
    answer:
      "Oui, vous pouvez upgrader à tout moment. Le crédit restant est déduit du nouveau pack.",
  },
  {
    question: "Les tarifs établissement incluent-ils la formation ?",
    answer:
      "Oui, le pack établissement (à partir de 199€/an) inclut une formation complète de l'équipe pédagogique et un support dédié.",
  },
];

const PricingFAQ = () => (
  <div className="max-w-2xl mx-auto">
    <h3 className="text-2xl font-bold text-[#1a2332] dark:text-white text-center mb-8">
      Questions fréquentes
    </h3>
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-[#1a2332] dark:text-white font-medium">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-[#64748b] dark:text-slate-400">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default PricingFAQ;
