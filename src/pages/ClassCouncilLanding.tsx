import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

const logo = "/images/logos/ClassCouncilAI_logo.png";

const ClassCouncilLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à AIProject4You
              </Link>

              {/* Badge */}
              <span className="inline-flex items-center px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                🎯 Conseils de classe
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Préparez vos conseils de classe en{" "}
                <span className="text-amber-500">5 minutes</span>
              </h1>

              <p className="text-xl text-slate-600">
                Importez vos bulletins PRONOTE, l'IA analyse et génère automatiquement 
                les appréciations pour chaque élève. Fini les heures de rédaction !
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">2h</p>
                  <p className="text-sm text-slate-500">gagnées par classe</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">30 sec</p>
                  <p className="text-sm text-slate-500">par appréciation</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">100%</p>
                  <p className="text-sm text-slate-500">RGPD</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/classcouncil-ai/app">
                  <Button className="px-8 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-1 transition-all text-lg">
                    Essayer gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="px-8 py-6 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all text-lg"
                >
                  Voir la démo
                </Button>
              </div>

              {/* Reassurance */}
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Aucune inscription requise · Données traitées localement
              </p>
            </div>

            {/* Logo/Image */}
            <div className="flex justify-center">
              <img
                src={logo}
                alt="ClassCouncil AI"
                className="max-w-md w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">😩</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Sans ClassCouncil AI</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Des heures à rédiger les appréciations de chaque élève</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Difficile de varier le vocabulaire sans se répéter</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Stress avant chaque conseil de classe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Moins de temps pour la préparation pédagogique</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Avec ClassCouncil AI</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span><strong>5 minutes</strong> pour générer toutes les appréciations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Textes variés et professionnels automatiquement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Sérénité retrouvée avant les conseils</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Plus de temps pour vos élèves</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Simple comme bonjour
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              3 étapes et c'est terminé. Vraiment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Importez le PDF</h3>
                <p className="text-slate-500">
                  Exportez les résultats depuis PRONOTE et déposez le fichier PDF. C'est tout !
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-slate-300 text-3xl">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">L'IA analyse</h3>
                <p className="text-slate-500">
                  L'intelligence artificielle extrait les données et génère des appréciations personnalisées.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-slate-300 text-3xl">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Copiez-collez</h3>
                <p className="text-slate-500">
                  Récupérez vos appréciations en un clic et collez-les dans PRONOTE. Terminé !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Import PDF PRONOTE</h3>
              <p className="text-slate-500 text-sm">Glissez-déposez votre export PRONOTE, l'IA fait le reste.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Analyse automatique</h3>
              <p className="text-slate-500 text-sm">Moyennes, tendances, élèves en difficulté... tout est analysé.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Appréciations variées</h3>
              <p className="text-slate-500 text-sm">Vocabulaire riche et professionnel, jamais de répétitions.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Statistiques visuelles</h3>
              <p className="text-slate-500 text-sm">Graphiques clairs pour visualiser les performances de la classe.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">100% RGPD</h3>
              <p className="text-slate-500 text-sm">Données traitées localement, jamais envoyées sur un serveur.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Copie en 1 clic</h3>
              <p className="text-slate-500 text-sm">Copiez chaque appréciation instantanément vers PRONOTE.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Magic Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
              ✨ La magie de l'IA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Regardez la différence
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">AVANT</span>
                <span className="text-slate-400 text-sm">45 minutes de rédaction</span>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm text-slate-400 space-y-2">
                <p>📄 Ouvrir PRONOTE</p>
                <p>📝 Analyser chaque élève...</p>
                <p>🤔 Chercher les bons mots...</p>
                <p>⌨️ Taper l'appréciation...</p>
                <p>🔄 Répéter 28 fois...</p>
                <p className="text-red-400">😫 Épuisé après 2 heures</p>
              </div>
            </div>

            {/* After */}
            <div className="bg-amber-500/20 backdrop-blur rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">APRÈS</span>
                <span className="text-amber-400 text-sm">5 minutes avec ClassCouncil AI</span>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm text-emerald-400 space-y-2">
                <p>📄 Exporter le PDF PRONOTE</p>
                <p>⬆️ Glisser-déposer dans l'app</p>
                <p>✨ L'IA génère tout...</p>
                <p>📋 Copier-coller dans PRONOTE</p>
                <p className="text-amber-400">🎉 Terminé ! Temps libre récupéré</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem 
              question="Mes données sont-elles sécurisées ?"
              answer="Absolument ! Toutes les données sont traitées localement dans votre navigateur. Rien n'est envoyé sur un serveur. Vos bulletins et les données de vos élèves ne quittent jamais votre ordinateur. Conformité RGPD totale."
            />
            <FAQItem 
              question="Est-ce vraiment gratuit ?"
              answer="Oui, ClassCouncil AI est 100% gratuit. Pas d'inscription, pas de limite d'utilisation, pas de publicité. C'est un outil créé par un enseignant pour aider ses collègues."
            />
            <FAQItem 
              question="Comment exporter depuis PRONOTE ?"
              answer="Dans PRONOTE, allez dans Résultats → Bulletins, sélectionnez la classe puis cliquez sur Exporter en PDF. Un guide détaillé est disponible dans l'application."
            />
            <FAQItem 
              question="Puis-je modifier les appréciations générées ?"
              answer="Bien sûr ! Les appréciations sont une base de travail. Vous pouvez les modifier, les personnaliser ou les régénérer si elles ne vous conviennent pas."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Prêt à gagner du temps ?
            </h2>

            <p className="text-xl text-slate-500 mb-8">
              Rejoignez les enseignants qui ont déjà simplifié leurs conseils de classe.
            </p>

            <Link to="/classcouncil-ai/app">
              <Button className="px-10 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all">
                Lancer ClassCouncil AI
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>

            <p className="mt-6 text-sm text-slate-400">
              Gratuit · Sans inscription · Données sécurisées
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2025 ClassCouncil AI - <Link to="/" className="hover:text-slate-700">AIProject4You</Link></p>
          <Link to="/politique-confidentialite" className="hover:text-slate-700">
            Politique de confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
};

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-slate-900">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-amber-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-600">
          {answer}
        </div>
      )}
    </div>
  );
};

export default ClassCouncilLanding;
