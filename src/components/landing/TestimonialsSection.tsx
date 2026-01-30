import { Quote, MapPin, FileCheck, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  subject: string;
  location: string;
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      quote:
        "Avant, je passais des heures sur mes appréciations de conseil de classe. Maintenant, c'est fait en quelques minutes. Un gain de temps incroyable !",
      subject: "Professeur de Mathématiques",
      location: "Collège Jean Moulin, Académie de Lyon",
    },
    {
      quote:
        "J'apprécie particulièrement le respect de la vie privée. Savoir que les données de mes élèves restent sur mon ordinateur me rassure énormément.",
      subject: "Professeur de Français",
      location: "Lycée Victor Hugo, Académie de Paris",
    },
    {
      quote:
        "Les appréciations générées sont vraiment personnalisées et pertinentes. Mes collègues pensent que je les ai toutes écrites moi-même !",
      subject: "Professeure d'Histoire-Géo",
      location: "Collège Albert Camus, Académie de Bordeaux",
    },
    {
      quote:
        "L'import depuis PRONOTE fonctionne parfaitement. Plus besoin de ressaisir toutes les informations. C'est fluide et intuitif.",
      subject: "Professeur d'Anglais",
      location: "Lycée Saint-Exupéry, Académie de Lille",
    },
  ];

  const trustBadges = [
    { icon: <MapPin className="w-4 h-4" />, text: "Données 100% locales" },
    { icon: <FileCheck className="w-4 h-4" />, text: "Compatible PRONOTE" },
    { icon: <Shield className="w-4 h-4" />, text: "RGPD Compliant" },
  ];

  return (
    <section id="testimonials" className="py-20 bg-[#1e293b]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Ce que disent les enseignants
          </h2>
          <p className="text-slate-400 mt-2">
            Ils ont adopté AIProject4You pour leur quotidien
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/5 border-white/10 rounded-xl p-6"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-[#f0a830] mb-4" />

              {/* Quote Text */}
              <p className="text-white text-sm italic leading-relaxed mb-4">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="text-slate-400 text-sm">
                <p className="font-medium text-slate-300">{testimonial.subject}</p>
                <p>{testimonial.location}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm"
            >
              <span className="text-[#7dd3e8]">{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
