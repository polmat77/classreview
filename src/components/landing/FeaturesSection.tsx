import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6">

        {/* Titre principal */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            3 étapes simples pour gagner <span className="text-amber-600 font-semibold">80% de temps</span> sur vos appréciations
          </p>
        </div>

        {/* Timeline avec 3 étapes */}
        <div className="relative">

          {/* Ligne de connexion (desktop) */}
          <div
            className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 rounded-full"
            style={{ zIndex: 0 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative" style={{ zIndex: 1 }}>

            {/* ÉTAPE 1 : IMPORT */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative z-10">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div className="mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-14 h-14 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Importez vos données
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Glissez votre <strong>bulletin PRONOTE PDF</strong> ou saisissez manuellement. Compatible tous formats.
              </p>
              <div className="mt-4 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-full">
                PDF simple
              </div>
            </div>

            {/* ÉTAPE 2 : SÉCURITÉ */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative z-10">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div className="mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-14 h-14 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Traitement 100% local
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Vos données restent sur <strong>votre ordinateur</strong>. Conforme RGPD, aucun stockage serveur.
              </p>
              <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                ✓ Conforme RGPD
              </div>
            </div>

            {/* ÉTAPE 3 : GÉNÉRATION */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative z-10">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <div className="mb-4 transform group-hover:scale-110 transition-transform">
                <svg className="w-14 h-14 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Générez en un clic
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                L'IA crée des <strong>appréciations personnalisées</strong>, prêtes à copier dans PRONOTE.
              </p>
              <div className="mt-4 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                Gain : 80% de temps
              </div>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/classcouncil-ai">
            <Button
              size="lg"
              className="px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Essayer gratuitement
              <span className="ml-2">→</span>
            </Button>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Aucune carte bancaire requise • 5 élèves offerts
          </p>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
