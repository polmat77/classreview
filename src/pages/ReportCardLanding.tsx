import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

const logo = "/images/logos/ReportCardAI_logo.png";

const ReportCardLanding = () => {
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
              <span className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                📝 Bulletins scolaires
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Rédigez vos bulletins en{" "}
                <span className="text-amber-500">quelques clics</span>
              </h1>

              <p className="text-xl text-slate-600">
                Générez des appréciations individuelles personnalisées pour chaque élève. 
                Choisissez le ton, la longueur, et laissez l'IA faire le travail.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 py-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">5 min</p>
                  <p className="text-sm text-slate-500">par classe de 30</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">5 tons</p>
                  <p className="text-sm text-slate-500">disponibles</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-500">100%</p>
                  <p className="text-sm text-slate-500">RGPD</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/reportcard-ai/app">
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
                alt="ReportCard AI"
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
              <h3 className="text-xl font-bold text-slate-900 mb-4">Sans ReportCard AI</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Des heures à rédiger 30 appréciations différentes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Toujours les mêmes phrases qui reviennent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Difficulté à adapter le ton à chaque élève</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Contrainte des 300 caractères max</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Avec ReportCard AI</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span><strong>5 minutes</strong> pour toute la classe</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Vocabulaire varié et professionnel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>5 tons différents au choix par élève</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Limite de caractères respectée automatiquement</span>
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
              Simple et rapide
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              4 étapes simples pour des bulletins parfaits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Importez les élèves</h3>
              <p className="text-slate-500 text-sm">PDF PRONOTE ou saisie manuelle des moyennes.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ajoutez vos observations</h3>
              <p className="text-slate-500 text-sm">Notez les comportements spécifiques.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Choisissez le ton</h3>
              <p className="text-slate-500 text-sm">Global ou individuel par élève.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Copiez et collez</h3>
              <p className="text-slate-500 text-sm">Récupérez chaque appréciation en un clic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Des fonctionnalités pensées pour vous
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">5 tons au choix</h3>
              <p className="text-slate-500 text-sm">Ferme, Neutre, Bienveillant, Encourageant ou Constructif selon l'élève.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Limite de caractères</h3>
              <p className="text-slate-500 text-sm">Configurez la longueur max (200-500 car.) pour respecter PRONOTE.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Observations comportementales</h3>
              <p className="text-slate-500 text-sm">Ajoutez des notes sur les bavardages, l'insolence... L'IA en tient compte.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Régénération</h3>
              <p className="text-slate-500 text-sm">Pas satisfait ? Régénérez l'appréciation d'un élève en un clic.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Bilan de classe</h3>
              <p className="text-slate-500 text-sm">Générez automatiquement une synthèse globale pour le bulletin.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Sauvegarde automatique</h3>
              <p className="text-slate-500 text-sm">Votre travail est sauvegardé localement. Reprenez où vous en étiez.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tone Examples Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
              🎭 Personnalisation totale
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Le ton parfait pour chaque élève
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              L'IA adapte son style selon le profil de l'élève
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Encouraging */}
            <div className="bg-emerald-500/20 backdrop-blur rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded-full">
                  Encourageant
                </span>
              </div>
              <p className="text-slate-300 italic text-sm">
                "Élève volontaire qui fournit des efforts constants. Les résultats progressent 
                et témoignent d'un investissement sérieux. Continuez ainsi !"
              </p>
            </div>

            {/* Neutral */}
            <div className="bg-slate-500/20 backdrop-blur rounded-2xl p-6 border border-slate-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-slate-500/30 text-slate-400 text-xs font-medium rounded-full">
                  Neutre
                </span>
              </div>
              <p className="text-slate-300 italic text-sm">
                "Travail régulier et participation correcte. Les acquis sont satisfaisants. 
                Il convient de maintenir cette rigueur pour le prochain trimestre."
              </p>
            </div>

            {/* Firm */}
            <div className="bg-amber-500/20 backdrop-blur rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-500/30 text-amber-400 text-xs font-medium rounded-full">
                  Ferme
                </span>
              </div>
              <p className="text-slate-300 italic text-sm">
                "Résultats insuffisants qui reflètent un manque de travail personnel. 
                Un investissement plus sérieux est attendu dès maintenant."
              </p>
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
              answer="Oui, ReportCard AI est 100% gratuit. Pas d'inscription, pas de limite d'utilisation, pas de publicité. C'est un outil créé par un enseignant pour aider ses collègues."
            />
            <FAQItem 
              question="Comment fonctionne la limite de caractères ?"
              answer="Vous définissez la longueur maximale (200 à 500 caractères). L'IA génère des appréciations qui respectent automatiquement cette limite, parfait pour les contraintes de PRONOTE."
            />
            <FAQItem 
              question="Puis-je modifier les appréciations générées ?"
              answer="Bien sûr ! Les appréciations sont une base de travail. Vous pouvez les modifier, les personnaliser ou les régénérer avec un ton différent si elles ne vous conviennent pas."
            />
            <FAQItem 
              question="Comment ajouter des observations comportementales ?"
              answer="À l'étape 2, vous pouvez noter pour chaque élève : bavardages, insolence, absences fréquentes, etc. Ces informations sont intégrées automatiquement dans les appréciations."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Prêt à simplifier vos bulletins ?
            </h2>

            <p className="text-xl text-slate-500 mb-8">
              Rejoignez les enseignants qui ont déjà adopté ReportCard AI.
            </p>

            <Link to="/reportcard-ai/app">
              <Button className="px-10 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all">
                Lancer ReportCard AI
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
          <p>© 2025 ReportCard AI - <Link to="/" className="hover:text-slate-700">AIProject4You</Link></p>
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

export default ReportCardLanding;
