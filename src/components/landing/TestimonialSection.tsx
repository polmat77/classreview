import { MapPin, Edit3, MessageSquare } from "lucide-react";

const TestimonialSection = () => {
  const badges = [
    { icon: MapPin, text: "Données locales" },
    { icon: Edit3, text: "Compatible PRONOTE" },
    { icon: MessageSquare, text: "Support réactif" },
  ];

  return (
    <section id="testimonial" className="py-20 lg:py-28 px-4 bg-navy">
      <div className="container mx-auto max-w-5xl">
        <div className="relative">
          {/* Quote marks decoration */}
          <div className="absolute -top-4 left-0 lg:left-12 text-gold/30">
            <svg
              width="100"
              height="80"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 pt-16 lg:pt-8">
            {/* Quote Text */}
            <div className="flex-1 text-center lg:text-left lg:pl-16">
              <blockquote className="text-xl md:text-2xl lg:text-[1.65rem] text-white leading-relaxed font-light">
                Grâce à ClassCouncil <span className="text-gold font-medium">AI</span>, j'ai divisé par deux 
                le temps passé sur mes appréciations, tout en les rendant plus précises. 
                Un véritable allié au quotidien !
              </blockquote>
            </div>

            {/* Author */}
            <div className="flex flex-col items-center text-center shrink-0">
              {/* Avatar - golden stylized */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4 shadow-lg shadow-gold/20 relative">
                {/* Stylized teacher silhouette */}
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-navy/80">
                  <circle cx="50" cy="35" r="18" fill="currentColor" />
                  <path
                    d="M50 58 C25 58 15 80 15 95 L85 95 C85 80 75 58 50 58"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="text-white font-semibold text-lg">Mathieu POL</div>
              <div className="text-slate-light text-sm">
                Professeur d'anglais & Créateur
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-white/10">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-white/80"
              >
                <badge.icon className="w-5 h-5 text-cyan" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
