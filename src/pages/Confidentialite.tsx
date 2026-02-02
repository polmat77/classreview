import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";

const Confidentialite = () => {
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
            Politique de Confidentialité & RGPD
          </h1>

          {/* Engagement de confidentialité */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Engagement de confidentialité
            </h2>
            <p className="text-[#2c3e50] leading-relaxed">
              AIProject4You s'engage à protéger la vie privée de ses utilisateurs et à respecter 
              le Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          {/* Traitement des données - Principe fondamental */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Traitement des données - Principe fondamental
            </h2>
            
            {/* Encadré spécial */}
            <div 
              className="my-8 p-6 rounded-lg border-l-[5px] border-l-[#f0a830] flex items-start gap-4"
              style={{ backgroundColor: 'rgba(125, 211, 232, 0.1)' }}
            >
              <Lock className="h-6 w-6 text-[#f0a830] shrink-0 mt-0.5" />
              <p className="text-[#2c3e50] font-semibold leading-relaxed">
                Aucune donnée personnelle d'élèves n'est collectée, stockée ou transmise par nos serveurs.
              </p>
            </div>

            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>Tous les outils de la plateforme fonctionnent selon le principe du traitement local :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Les données importées (bulletins PRONOTE, informations élèves) restent dans votre navigateur</li>
                <li>Le traitement s'effectue localement sur votre appareil</li>
                <li>Aucune donnée n'est envoyée à nos serveurs</li>
                <li>Les données sont stockées temporairement dans le localStorage de votre navigateur</li>
                <li>Vous pouvez effacer toutes les données à tout moment via le bouton "Réinitialiser"</li>
              </ul>
            </div>
          </section>

          {/* Données techniques collectées */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Données techniques collectées
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>Pour le bon fonctionnement du site, nous collectons uniquement :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Données de navigation anonymes (pages visitées, durée)</li>
                <li>Informations techniques (type de navigateur, système d'exploitation)</li>
                <li>Ces données sont anonymisées et ne permettent pas de vous identifier</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Cookies
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>
                Le site utilise uniquement des cookies techniques nécessaires au fonctionnement 
                (préférences utilisateur, session).
              </p>
              <p>
                Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
              </p>
            </div>
          </section>

          {/* Services tiers */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Services tiers
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>
                Les outils utilisent l'API Google Gemini pour la génération de texte. Seul le prompt 
                de génération (sans données personnelles identifiantes) est envoyé à l'API. 
                <strong> Aucun nom d'élève n'est transmis.</strong>
              </p>
              <p>
                Les prénoms sont systématiquement remplacés par des balises génériques avant tout envoi, 
                et les notes sont converties en descripteurs qualitatifs.
              </p>
            </div>
          </section>

          {/* Vos droits */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Vos droits
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p>
                Pour exercer ces droits :{" "}
                <a 
                  href="mailto:contact@aiproject4you.com" 
                  className="text-[#7dd3e8] hover:text-[#f0a830] transition-colors duration-300"
                >
                  contact@aiproject4you.com
                </a>
              </p>
            </div>
          </section>

          {/* Responsable du traitement */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Responsable du traitement
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-2">
              <p className="font-semibold">AIProject4You</p>
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

          {/* DPO */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              DPO (Délégué à la Protection des Données)
            </h2>
            <p className="text-[#2c3e50] leading-relaxed">
              Pour les établissements scolaires : se référer au DPO de votre académie
            </p>
          </section>

          {/* Durée de conservation */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Durée de conservation
            </h2>
            <p className="text-[#2c3e50] leading-relaxed">
              Les données dans votre navigateur sont conservées jusqu'à ce que vous les supprimiez 
              ou effaciez les données de navigation.
            </p>
          </section>

          {/* Sécurité */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Sécurité
            </h2>
            <p className="text-[#2c3e50] leading-relaxed">
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles pour protéger 
              vos données contre tout accès non autorisé.
            </p>
          </section>

          {/* Réclamation */}
          <section className="py-8">
            <h2 className="text-2xl font-semibold text-[#2c3e50] mb-4">
              Réclamation
            </h2>
            <div className="text-[#2c3e50] leading-relaxed space-y-4">
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une 
                réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :{" "}
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#7dd3e8] hover:text-[#f0a830] transition-colors duration-300"
                >
                  www.cnil.fr
                </a>
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

export default Confidentialite;
