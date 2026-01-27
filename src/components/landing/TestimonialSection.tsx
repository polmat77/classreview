import { MapPin, Edit3, MessageSquare } from "lucide-react";

const TestimonialSection = () => {
  const badges = [
    { icon: MapPin, text: "Données locales" },
    { icon: Edit3, text: "Compatible PRONOTE" },
    { icon: MessageSquare, text: "Support réactif" },
  ];

  return (
    <section id="testimonial" className="py-24 px-4 bg-[#1a2332]">
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          {/* Quote Icon */}
          <div className="absolute -top-8 left-0 lg:left-8 text-[#f0a830]/30">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 pt-12 lg:pt-0">
            {/* Quote Text */}
            <div className="flex-1 text-center lg:text-left lg:pl-16">
              <blockquote className="text-xl md:text-2xl text-white leading-relaxed mb-8 italic">
                "Grâce à ClassCouncil <span className="text-[#f0a830]">AI</span>, j'ai divisé par deux 
                le temps passé sur mes appréciations, tout en les rendant plus précises. 
                Un véritable allié au quotidien !"
              </blockquote>
            </div>

            {/* Author */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f0a830] to-[#f5c563] flex items-center justify-center mb-4 shadow-lg shadow-[#f0a830]/30">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <div className="text-white font-semibold text-lg">Mathieu POL</div>
              <div className="text-[#94a3b8] text-sm">
                Professeur d'anglais & Créateur
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-white/10">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-white/70"
              >
                <badge.icon className="w-5 h-5 text-[#7dd3e8]" />
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
