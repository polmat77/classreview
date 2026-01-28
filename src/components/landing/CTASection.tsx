import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 lg:py-20 px-4 bg-gradient-to-r from-cyan-vibrant to-cyan">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8">
          Prêt à gagner du temps ?
        </h2>
        
        <Link to="/classcouncil-ai">
          <Button
            size="lg"
            className="bg-white text-cyan-vibrant hover:bg-white/95 px-8 py-6 text-base font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
          >
            Commencer avec ClassCouncil <span className="text-gold ml-1">AI</span>
          </Button>
        </Link>

        <p className="mt-6 text-white/90 text-sm font-medium">
          Gratuit • Sans inscription • Compatible PRONOTE
        </p>
      </div>
    </section>
  );
};

export default CTASection;
