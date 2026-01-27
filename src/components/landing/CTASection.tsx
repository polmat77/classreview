import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-[#06b6d4] to-[#0891b2]">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Prêt à gagner du temps ?
        </h2>
        
        <Link to="/classcouncil-ai">
          <Button
            size="lg"
            className="bg-white text-[#06b6d4] hover:bg-white/90 px-8 py-6 text-lg rounded-lg shadow-lg transition-all hover:scale-105"
          >
            Commencer avec ClassCouncil <span className="text-[#f0a830] ml-1">AI</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        <p className="mt-6 text-white/90 text-sm">
          Gratuit • Sans inscription • Compatible PRONOTE
        </p>
      </div>
    </section>
  );
};

export default CTASection;
