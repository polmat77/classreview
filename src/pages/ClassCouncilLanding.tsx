import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield,
  Lock,
  GraduationCap,
  Target,
  Copy,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";

const logo = "/images/logos/ClassCouncilAI_logo.png";

const ClassCouncilLanding = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 py-20 transition-colors">
        <div className="absolute top-4 right-4 z-10">
          <DarkModeToggle />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à AIProject4You
              </Link>

              <span className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium">
                🎯 Conseils de classe
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Conseil de Classe : Libérez-vous du Stress de la{" "}
                <span className="text-amber-500">Synthèse</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400">
                De l'import des bulletins à l'appréciation personnalisée en quelques clics
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 py-4">
                <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white px-4 py-2 rounded-full text-sm">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Conforme RGPD
                </div>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white px-4 py-2 rounded-full text-sm">
                  🇫🇷 Adapté au système français
                </div>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white px-4 py-2 rounded-full text-sm">
                  <GraduationCap className="w-4 h-4 text-amber-500" />
                  Créé par des enseignants
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/classcouncil-ai/app">
                  <Button className="px-8 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-1 transition-all text-lg">
                    Essayer ClassCouncil AI Gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Gratuit et sans engagement
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Aucune installation requise
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <img
                src={logo}
                alt="ClassCouncil AI"
                className="w-72 md:w-96 lg:w-[28rem]"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW 4 ÉTAPES ═══════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
              ✨ Un workflow simple et efficace
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              4 étapes simples pour générer vos appréciations de conseil de classe
            </p>
          </div>

          {/* Step 1 - Image LEFT */}
          <WorkflowStep
            stepNumber={1}
            title="📊 Une vision claire en un coup d'œil"
            description="Importez vos bulletins PRONOTE et visualisez instantanément les données essentielles de votre classe : moyenne générale, écart-type, taux de réussite, répartition par tranches. Identifiez les points forts et les matières nécessitant un renforcement. L'outil détecte automatiquement les élèves en difficulté et génère des recommandations personnalisées."
            features={[
              "Extraction automatique des moyennes par matière",
              "Détection des élèves à surveiller (< 10/20)",
              "Top 3 des meilleurs élèves",
              "Recommandations pédagogiques intelligentes",
            ]}
            imageSrc="/images/classcouncil/ClassCouncilAI_Resultats_Classe_1.png"
            imageAlt="Résultats de la classe - Bilan synthétique et KPIs"
            imageCaption="📸 Exemple réel d'analyse (données anonymisées)"
            imageLeft={true}
          />

          {/* Step 2 - Image RIGHT */}
          <WorkflowStep
            stepNumber={2}
            title="📈 Des données parlantes pour des décisions éclairées"
            description="Plongez dans l'analyse fine de votre classe avec des graphiques interactifs : répartition des moyennes par tranche, comparaison des matières, identification des points forts et des axes d'amélioration. Visualisez en un clin d'œil l'hétérogénéité de la classe et les élèves nécessitant un accompagnement renforcé."
            features={[
              "Graphiques circulaires et barres horizontales",
              "Analyse comparative par matière",
              "Liste automatique des élèves à surveiller",
              "Identification des matières critiques",
            ]}
            imageSrc="/images/classcouncil/ClassCouncilAI_Resultats_Classe_2.png"
            imageAlt="Analyse détaillée - Graphiques et répartition"
            imageCaption="📊 Visualisation automatique des données"
            imageLeft={false}
          />

          {/* Step 3 - Image LEFT */}
          <WorkflowStep
            stepNumber={3}
            title="✍️ Générez des appréciations professionnelles en quelques secondes"
            description="L'IA analyse chaque bulletin individuellement et génère des appréciations personnalisées basées sur les données réelles : résultats, comportement, participation. Choisissez le ton adapté (Sévère, Standard, Encourageant, Élogieux), ajustez la limite de caractères et obtenez des textes cohérents, nuancés et prêts à l'emploi."
            features={[
              "Génération IA contextuelle et pertinente",
              "4 tons disponibles (adaptables par élève)",
              "Limite de caractères configurable",
              "Copie rapide ou export texte",
              "\"Tout générer\" en un clic",
            ]}
            imageSrc="/images/classcouncil/ClassCouncilAI_appreciations_individuelles.png"
            imageAlt="Appréciations individuelles générées par IA"
            imageCaption="🤖 Génération IA contextuelle"
            imageLeft={true}
          />

          {/* Step 4 - Image RIGHT */}
          <WorkflowStep
            stepNumber={4}
            title="🏆 Des suggestions d'attributions automatiques et pertinentes"
            description="L'IA suggère automatiquement les attributions positives (Félicitations, Tableau d'honneur) et les avertissements (Travail, Conduite) en fonction des résultats et comportements détectés dans les bulletins. Appliquez-les en un clic ou personnalisez-les selon vos critères."
            features={[
              "Détection automatique des élèves méritants",
              "Identification des cas nécessitant un avertissement",
              "Résumé visuel des suggestions",
              "Application en un clic ou ajustement manuel",
            ]}
            imageSrc="/images/classcouncil/ClassCouncilAI_APP_Individuelles_Attributions.png"
            imageAlt="Attributions intelligentes - Félicitations et avertissements"
            imageCaption="🎯 Suggestions basées sur les données"
            imageLeft={false}
          />
        </div>
      </section>

      {/* ═══════════ BILAN DE CLASSE PROFESSIONNEL ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            📝 Bonus
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Un bilan de classe digne d'un chef d'établissement
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-3xl mx-auto">
            ClassCouncil AI génère un bilan synthétique complet et professionnel qui reprend tous
            les indicateurs clés de la classe : moyenne, écart-type, répartition, points forts et
            axes d'amélioration. Copiez-le en un clic et collez-le directement dans PRONOTE.
          </p>

          <div className="bg-slate-700/50 border border-slate-600 rounded-2xl p-6 sm:p-8 text-left mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📄</span>
              <span className="font-semibold text-white">Exemple de bilan généré :</span>
            </div>
            <blockquote className="text-slate-300 italic leading-relaxed border-l-4 border-amber-500 pl-4">
              "La classe de 5e3 affiche une moyenne générale de 11,61/20 avec 23 élèves évalués.
              La répartition est la suivante : 1 élève en grande difficulté (moins de 8), 6 élèves
              en dessous de 10, 5 élèves entre 10 et 12, 8 élèves entre 12 et 14 et 3 élèves entre
              14 et 16. La classe présente un écart-type de 2,14. EPS (16,22) et Arts plastiques
              (14,31) sont les points forts, tandis que Mathématiques (9,28) et Éducation musicale
              (9,02) nécessitent un renforcement."
            </blockquote>
          </div>

          <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 px-8 py-4 h-auto rounded-xl text-base font-semibold shadow-lg">
            <Copy className="w-4 h-4 mr-2" />
            Copier le bilan
          </Button>
        </div>
      </section>

      {/* ═══════════ POURQUOI CHOISIR ═══════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Pourquoi choisir ClassCouncil AI ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <WhyCard
              emoji="⏱️"
              title="Gain de temps"
              description="Réduisez de 80% le temps passé à rédiger vos appréciations et bilans de classe"
            />
            <WhyCard
              emoji="🔒"
              title="100% RGPD"
              description="Traitement local, données anonymisées, aucun stockage serveur"
            />
            <WhyCard
              emoji="🎯"
              title="Précision professionnelle"
              description="Appréciations contextuelles basées sur des données réelles"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Vos Questions Sur ClassCouncil AI
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="Les appréciations seront-elles toutes identiques d'un trimestre à l'autre ?"
              answer="Non. Chaque trimestre a son profil unique (évolution des moyennes, changements de comportement, progression ou régression). L'IA génère une synthèse adaptée aux données spécifiques de chaque période."
            />
            <FAQItem
              question="Que deviennent les données de mes élèves ?"
              answer="Elles ne quittent jamais votre navigateur. Le traitement est 100% local. Aucune information n'est envoyée à nos serveurs. À la fermeture de l'onglet, tout est effacé automatiquement."
            />
            <FAQItem
              question="L'appréciation sera-t-elle adaptée au niveau de ma classe ?"
              answer="Oui. L'IA analyse les moyennes générales et adapte le ton : encourageant pour une classe en difficulté, exigeant pour une classe performante, constructif pour une classe hétérogène."
            />
            <FAQItem
              question="Puis-je utiliser mes propres formulations ?"
              answer="Absolument. Le texte généré est un point de départ. Vous pouvez le modifier, le compléter, le régénérer ou le réécrire entièrement."
            />
            <FAQItem
              question="Est-ce compatible avec tous les formats PRONOTE ?"
              answer="ClassCouncil AI est conçu pour les exports PDF standards de PRONOTE. Si votre format est différent, une saisie manuelle reste possible."
            />
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à transformer vos conseils de classe ?
          </h2>
          <p className="text-cyan-100 text-lg mb-8">
            Rejoignez les centaines d'enseignants qui ont déjà adopté ClassCouncil AI
          </p>

          <Link to="/classcouncil-ai/app">
            <Button className="px-10 py-7 bg-white text-cyan-700 font-bold rounded-xl shadow-2xl hover:bg-cyan-50 hover:-translate-y-1 transition-all text-lg h-auto">
              🚀 Essayez ClassCouncil AI maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="mt-6 text-cyan-100/80 text-sm">
            ✨ Aucune carte bancaire requise · Premier conseil gratuit
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ClassCouncil AI" className="w-10 h-10" />
              <div>
                <p className="text-white font-semibold">
                  ClassCouncil<span className="text-amber-500">AI</span>
                </p>
                <p className="text-sm">Par AIProject4You</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <Link to="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link to="/confidentialite" className="hover:text-white transition-colors">
                Confidentialité
              </Link>
            </div>
            <p className="text-sm">© 2025 AIProject4You. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════ WORKFLOW STEP COMPONENT ═══════════ */
interface WorkflowStepProps {
  stepNumber: number;
  title: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  imageLeft: boolean;
}

const WorkflowStep = ({
  stepNumber,
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  imageCaption,
  imageLeft,
}: WorkflowStepProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const imageBlock = (
    <div className="flex-1">
      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 italic">
        {imageCaption}
      </p>
    </div>
  );

  const textBlock = (
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
          {stepNumber}
        </span>
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          Étape {stepNumber}
        </span>
      </div>

      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-3 pt-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`flex flex-col lg:flex-row gap-10 lg:gap-16 items-center mb-20 last:mb-0 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {imageLeft ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imageBlock}
        </>
      )}
    </div>
  );
};

/* ═══════════ WHY CARD ═══════════ */
const WhyCard = ({ emoji, title, description }: { emoji: string; title: string; description: string }) => (
  <div className="text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-lg transition-all">
    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <span className="text-3xl">{emoji}</span>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
  </div>
);

/* ═══════════ FAQ ITEM ═══════════ */
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-slate-900 dark:text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default ClassCouncilLanding;
