import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-[#f0a830] to-[#e09520]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
          Prêt à gagner du temps ?
        </h2>
        <p className="text-white/90 mb-8">
          Rejoignez les enseignants qui ont déjà adopté AIProject4You
        </p>

        <Link to="/classcouncil-ai">
          <Button
            size="lg"
            className="bg-white text-[#f0a830] hover:bg-white/95 px-8 py-6 text-base font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            Commencer gratuitement
          </Button>
        </Link>

        <p className="mt-6 text-white/80 text-sm font-medium">
          Gratuit • Sans inscription • Compatible PRONOTE
        </p>
      </div>
    </section>
  );
};

export default CTASection;
