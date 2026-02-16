import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Clock,
  FileText,
  Brain,
  Shield,
  Users,
  Sparkles,
  Copy,
  RefreshCw,
  Settings,
  Edit3,
  Lock,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";

const logo = "/images/logos/ReportCardAI_logo.png";

const ReportCardLanding = () => {
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

              <span className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                📝 Bulletins scolaires
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Bulletins Scolaires : Des Appréciations Personnalisées{" "}
                <span className="text-amber-500">Sans Y Passer Vos Soirées</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400">
                De l'import PRONOTE à l'appréciation personnalisée en quelques clics
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
                <Link to="/reportcard-ai/app">
                  <Button className="px-8 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-1 transition-all text-lg">
                    Essayer ReportCardAI Gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Essai gratuit
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
                alt="ReportCard AI"
                className="w-72 md:w-96 lg:w-[28rem]"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW 4 ÉTAPES AVEC SCREENSHOTS ═══════════ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Header */}
          <div className="text-center mb-20">
            <span className="inline-flex items-center bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium">
              ✨ Workflow guidé en 4 étapes
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mt-4">
              Découvrez ReportCard<span className="text-amber-500">AI</span> en action
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
              De l'import PRONOTE à l'appréciation personnalisée en quelques clics
            </p>
          </div>

          {/* Vertical connector line (desktop) */}
          <div className="absolute left-1/2 top-48 bottom-32 w-px bg-gradient-to-b from-amber-400 via-cyan-400 to-amber-400 opacity-20 hidden lg:block" />

          {/* Step 1 - Text LEFT, Image RIGHT */}
          <WorkflowShowcaseStep
            stepNumber={1}
            title="Importez vos élèves depuis PRONOTE"
            tagline="Fini la saisie manuelle fastidieuse !"
            description="Glissez simplement votre PDF PRONOTE. Notre IA extrait automatiquement les noms, moyennes, absences et nombre de notes. Vos 30 élèves sont prêts en 3 secondes."
            badges={["Import PDF drag & drop", "Extraction automatique", "Compatible tous formats PRONOTE"]}
            imageSrc="/images/reportcard/ReportCardAI_Import_des_donnees.png"
            imageAlt="Interface d'import PDF avec liste des élèves extraits automatiquement"
            imageLeft={false}
          />

          {/* Step 2 - Image LEFT, Text RIGHT */}
          <WorkflowShowcaseStep
            stepNumber={2}
            title="Signalez les comportements en un clic"
            tagline="Votre expertise d'enseignant, amplifiée par l'IA"
            description="Bavardages, passivité, excellent investissement à l'oral... Sélectionnez les élèves concernés parmi les comportements prédéfinis ou ajoutez vos propres observations personnalisées."
            badges={["Sélection multiple intuitive", "Comportements prédéfinis", "Notes individuelles libres"]}
            imageSrc="/images/reportcard/ReportCardAI_Comportement3.png"
            imageAlt="Observations comportementales avec suggestions et notes personnalisées"
            imageLeft={true}
          />

          {/* Step 3 - Text LEFT, Image RIGHT */}
          <WorkflowShowcaseStep
            stepNumber={3}
            title="Générez des appréciations personnalisées"
            tagline="4 tons pour s'adapter à chaque élève"
            description="Choisissez entre Sévère, Standard, Encourageant ou Élogieux. Ajustez la longueur (200-500 caractères). L'IA rédige une appréciation unique, professionnelle et prête à copier. Pas satisfait ? Régénérez en un clic."
            badges={["4 tons disponibles", "Longueur ajustable", "Régénération illimitée", "Copie en un clic"]}
            imageSrc="/images/reportcard/ReportCardAI_Generation_appreciations2.png"
            imageAlt="Appréciations générées avec 4 tons visibles et boutons Copier/Régénérer"
            imageLeft={false}
          />

          {/* Step 4 - Image LEFT, Text RIGHT */}
          <WorkflowShowcaseStep
            stepNumber={4}
            title="Obtenez votre bilan de classe automatique"
            tagline="Synthèse globale basée sur vos données réelles"
            description="Statistiques visuelles de la classe, moyenne générale, répartition des notes. Générez un bilan personnalisé selon 4 critères : travail, comportement, participation et progression. Export complet en un clic."
            badges={["Statistiques visuelles", "4 critères d'analyse", "Export PDF/TXT complet"]}
            imageSrc="/images/reportcard/ReportCardAI_Generation_appreciations_bilan2.png"
            imageAlt="Bilan de classe avec texte généré et statistiques visuelles"
            imageLeft={true}
          />
        </div>

        {/* CTA after steps */}
        <div className="max-w-3xl mx-auto px-6 text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Prêt à récupérer vos soirées ?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            Rejoignez les enseignants qui gagnent 70% de temps sur leurs bulletins
          </p>

          <Link to="/reportcard-ai/app">
            <Button className="px-10 py-7 h-auto bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all text-lg">
              Commencer l'essai gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Essai gratuit
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Sans inscription
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              Données 100% confidentielles
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Compatible PRONOTE
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM SECTION ═══════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium mb-4">
              😫 Le Défi de Chaque Fin de Trimestre
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              28 Appréciations Uniques, Personnalisées, Professionnelles...{" "}
              <span className="text-red-500">En 3 Jours</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">😫</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La répétition</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">"Élève sérieux qui participe bien" × 28</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Le ton juste</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Ferme sans être blessant, encourageant sans être naïf</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La limite PRONOTE</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">255 caractères max, pas un de plus</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Le temps qui file</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">5-10 minutes par élève = une soirée entière pour une classe</p>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🤯</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La fatigue</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Les dernières appréciations sont moins bonnes que les premières</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-xl italic text-slate-600 dark:text-slate-400 border-l-4 border-amber-500 pl-6">
              "Nous savons que vous voulez le meilleur pour chaque élève. ReportCardAI vous aide à maintenir cette
              qualité sans sacrifier votre vie personnelle."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ═══════════ POURQUOI CHOISIR ═══════════ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Pourquoi choisir ReportCard<span className="text-amber-500">AI</span> ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <WhyCard
              emoji="⏱️"
              title="Gain de temps"
              description="Réduisez de 70% le temps passé à rédiger vos appréciations de bulletins"
            />
            <WhyCard
              emoji="🔒"
              title="100% RGPD"
              description="Traitement local, données anonymisées, aucun stockage serveur"
            />
            <WhyCard
              emoji="🎯"
              title="Précision professionnelle"
              description="4 tons disponibles, longueur configurable, appréciations contextuelles"
            />
          </div>

          {/* Time Saved Banner */}
          <div className="mt-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">⏱️ Temps gagné</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-amber-100">Avant</p>
                <p className="text-3xl font-bold">5-10 min/élève</p>
                <p className="text-amber-100 text-sm">= 2h30-4h pour 28 élèves</p>
              </div>
              <div>
                <p className="text-amber-100">Après</p>
                <p className="text-3xl font-bold">1-2 min/élève</p>
                <p className="text-amber-100 text-sm">= 30-60 min pour 28 élèves</p>
              </div>
              <div>
                <p className="text-amber-100">Résultat</p>
                <p className="text-3xl font-bold">70%</p>
                <p className="text-amber-100 text-sm">de temps économisé + cohérence garantie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Vos Questions Sur ReportCard<span className="text-amber-500">AI</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="L'IA va-t-elle écrire des appréciations génériques ?"
              answer="Non. Chaque appréciation est générée en fonction des données spécifiques de l'élève (moyenne, sérieux, participation, absences, devoirs non rendus, observations comportementales). Le résultat est unique et personnalisé."
            />
            <FAQItem
              question="Comment éviter que deux élèves similaires aient la même appréciation ?"
              answer="L'IA varie le vocabulaire et la structure des phrases automatiquement. De plus, vous pouvez ajouter des notes individuelles dans l'étape 2 pour différencier davantage. Enfin, vous pouvez régénérer chaque texte autant que nécessaire."
            />
            <FAQItem
              question="Mes données élèves sont-elles sauvegardées ?"
              answer="Oui, mais UNIQUEMENT dans votre navigateur (localStorage). Rien n'est envoyé sur Internet. À la fermeture, vous pouvez tout effacer en un clic via le bouton 'Réinitialiser'. Conformité RGPD garantie."
            />
            <FAQItem
              question="Peut-on dépasser la limite de caractères PRONOTE ?"
              answer="Non. Vous configurez la limite exacte (ex : 255 caractères pour PRONOTE). Si le texte dépasse, une troncature intelligente s'applique automatiquement au niveau des phrases pour garantir un texte cohérent."
            />
            <FAQItem
              question="Puis-je modifier une appréciation après génération ?"
              answer="Oui, totalement. Vous pouvez éditer le texte manuellement, le régénérer, ou changer le ton et relancer. Vous gardez le contrôle à 100%."
            />
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à récupérer vos soirées ?
          </h2>
          <p className="text-cyan-100 text-lg mb-8">
            Des appréciations personnalisées en quelques clics, pas en plusieurs heures.
          </p>

          <Link to="/reportcard-ai/app">
            <Button className="px-10 py-7 bg-white text-cyan-700 font-bold rounded-xl shadow-2xl hover:bg-cyan-50 hover:-translate-y-1 transition-all text-lg h-auto">
              🚀 Essayez ReportCardAI maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          <p className="mt-6 text-cyan-100/80 text-sm">
            ✨ Aucune carte bancaire requise · Premier bulletin gratuit
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ReportCard AI" className="w-10 h-10" />
              <div>
                <p className="text-white font-semibold">
                  ReportCard<span className="text-amber-500">AI</span>
                </p>
                <p className="text-sm">Par AIProject4You</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              <Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            </div>
            <p className="text-sm">© 2025 AIProject4You. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════ WORKFLOW SHOWCASE STEP ═══════════ */
interface WorkflowShowcaseStepProps {
  stepNumber: number;
  title: string;
  tagline: string;
  description: string;
  badges: string[];
  imageSrc: string;
  imageAlt: string;
  imageLeft: boolean;
}

const WorkflowShowcaseStep = ({
  stepNumber,
  title,
  tagline,
  description,
  badges,
  imageSrc,
  imageAlt,
  imageLeft,
}: WorkflowShowcaseStepProps) => {
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
    <div className="flex-1 lg:max-w-[50%]">
      {/* Browser mockup frame */}
      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* Browser bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white dark:bg-slate-600 rounded-md px-4 py-1 text-xs text-slate-400 dark:text-slate-300 max-w-xs truncate">
              reportcard-ai.aiproject4you.com
            </div>
          </div>
        </div>
        {/* Screenshot */}
        <div className="overflow-hidden">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );

  const textBlock = (
    <div className="flex-1 space-y-4">
      {/* Step number */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-110 transition-transform">
        {stepNumber}
      </div>

      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-4">
        {title}
      </h3>

      {/* Tagline */}
      <p className="text-amber-600 dark:text-amber-400 font-semibold text-lg mt-2">
        {tagline}
      </p>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mt-4 max-w-lg">
        {description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-6">
        {badges.map((badge, i) => (
          <span
            key={i}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            {badge}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 md:p-12 mb-12 last:mb-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDuration: "700ms" }}
    >
      <div className={`flex flex-col lg:flex-row items-center gap-12 ${imageLeft ? "" : "lg:flex-row-reverse"}`}>
        {imageBlock}
        {textBlock}
      </div>
    </div>
  );
};

/* ═══════════ WHY CARD ═══════════ */
const WhyCard = ({ emoji, title, description }: { emoji: string; title: string; description: string }) => (
  <div className="text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all">
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

export default ReportCardLanding;
