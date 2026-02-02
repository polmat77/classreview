import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

const MentionsLegales = () => {
  const handleScrollToSection = (sectionId: string) => {
    // Navigate to home first if needed
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logos/AIProject4You_logo.png" alt="AIProject4You" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold">
                <span className="text-amber-500">AI</span>
                <span className="text-slate-800">Project4You</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <h1 className="text-[32px] font-bold text-[#2c3e50] mb-12">
            Mentions Légales
          </h1>

          {/* Éditeur du site */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Éditeur du site
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-2">
              <p className="font-semibold">AIProject4You.com</p>
              <p>Suite d'outils éducatifs propulsés par l'IA</p>
              <p>Développé par un enseignant de l'Éducation Nationale</p>
              <p>
                Contact :{" "}
                <a 
                  href="mailto:contact@aiproject4you.com" 
                  className="text-[#7dd3e8] hover:text-[#f0a830] transition-colors duration-300"
                >
                  contact@aiproject4you.com
                </a>
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Hébergement
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-2">
              <p className="font-semibold">Hostinger International Ltd</p>
              <p>61 Lordou Vironos Street</p>
              <p>6023 Larnaca, Chypre</p>
              <p>Serveurs localisés en Union Européenne (Pays-Bas / Lituanie)</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Propriété intellectuelle
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, marques) est la propriété 
                exclusive d'AIProject4You. Toute reproduction, même partielle, est strictement 
                interdite sans autorisation préalable.
              </p>
              <p>
                Les logos et illustrations ont été créés spécifiquement pour AIProject4You et sont 
                protégés par le droit d'auteur.
              </p>
            </div>
          </section>

          {/* Back link */}
          <div className="pt-8">
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onScrollToSection={handleScrollToSection} />
    </div>
  );
};

export default MentionsLegales;
