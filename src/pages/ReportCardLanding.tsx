import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ArrowRight, ArrowLeft, Clock, FileText, Brain, Shield, Users, Sparkles, Copy, RefreshCw, Settings, Edit3 } from "lucide-react";
import { useState } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";

const logo = "/images/logos/ReportCardAI_logo.png";

const ReportCardLanding = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 py-20 transition-colors">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <DarkModeToggle />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à AIProject4You
              </Link>

              {/* Badge */}
              <span className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                📝 Bulletins scolaires
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Bulletins Scolaires : Des Appréciations Personnalisées{" "}
                <span className="text-amber-500">Sans Y Passer Vos Soirées</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400">
                Générez des appréciations individuelles adaptées à chaque élève, avec le ton juste.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 py-4">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  RGPD Conforme
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Traitement 100% Local
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
                  🎯 5 Tons Disponibles
                </div>
                <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-4 py-2 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  De 10 min à 2 min par élève
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to="/reportcard-ai/app">
                  <Button className="px-8 py-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl hover:-translate-y-1 transition-all text-lg">
                    Commencer Avec ReportCardAI Gratuitement
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Reassurance */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Gratuit et complet
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Sans inscription
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Données 100% confidentielles
                </span>
              </div>
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

      {/* Problem Section */}
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

          {/* Empathetic Quote */}
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-xl italic text-slate-600 dark:text-slate-400 border-l-4 border-amber-500 pl-6">
              "Nous savons que vous voulez le meilleur pour chaque élève. ReportCardAI vous aide à maintenir cette qualité sans sacrifier votre vie personnelle."
            </blockquote>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium mb-4">
              ✨ Votre Copilote Pour les Bulletins Individuels
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Comment ReportCardAI Vous Accompagne
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Importez Vos Données</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Import PDF PRONOTE ou saisie manuelle</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Extraction : nom, prénom, moyenne, sérieux, participation, absences</span>
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Ajoutez Vos Observations</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Sélectionnez les élèves concernés par des comportements spécifiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>Bavardages, insolence, manque de concentration...</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Générez les Appréciations</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Choisissez le ton : Ferme, Neutre, Bienveillant, Encourageant, Constructif</span>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Limite de caractères configurable (200-500)</span>
                </li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-500/30 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Exportez et Copiez</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <Copy className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Copie en un clic dans le presse-papiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Régénération possible si besoin</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Time Saved Banner */}
          <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white text-center">
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
                <p className="text-3xl font-bold">80%</p>
                <p className="text-amber-100 text-sm">de temps économisé + cohérence garantie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Tones Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
              🎭 Les 5 Tons Pédagogiques
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Adaptez le Message à Chaque Profil d'Élève
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Tone 1: Ferme */}
            <div className="bg-red-500/20 backdrop-blur rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center text-xl">🔴</span>
                <div>
                  <h3 className="font-bold text-white">Ferme</h3>
                  <p className="text-slate-400 text-xs">Élève en grande difficulté comportementale ou scolaire</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">Style : Direct, factuel, sans concession mais constructif</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 italic text-sm">
                  "Les résultats sont préoccupants. Un changement d'attitude immédiat est nécessaire pour éviter un décrochage."
                </p>
              </div>
            </div>

            {/* Tone 2: Neutre */}
            <div className="bg-slate-500/20 backdrop-blur rounded-2xl p-6 border border-slate-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-slate-500/30 rounded-full flex items-center justify-center text-xl">⚪</span>
                <div>
                  <h3 className="font-bold text-white">Neutre</h3>
                  <p className="text-slate-400 text-xs">Élève sans particularité notable</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">Style : Objectif, équilibré, professionnel</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 italic text-sm">
                  "Trimestre correct avec des résultats dans la moyenne. Une participation plus soutenue permettrait de progresser."
                </p>
              </div>
            </div>

            {/* Tone 3: Bienveillant */}
            <div className="bg-blue-500/20 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center text-xl">💙</span>
                <div>
                  <h3 className="font-bold text-white">Bienveillant</h3>
                  <p className="text-slate-400 text-xs">Élève qui fait des efforts malgré les difficultés</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">Style : Chaleureux, empathique, positif</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 italic text-sm">
                  "Malgré quelques difficultés, les efforts constants sont remarquables. Continuez sur cette voie encourageante."
                </p>
              </div>
            </div>

            {/* Tone 4: Encourageant */}
            <div className="bg-emerald-500/20 backdrop-blur rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center text-xl">💚</span>
                <div>
                  <h3 className="font-bold text-white">Encourageant</h3>
                  <p className="text-slate-400 text-xs">Élève en progrès ou avec du potentiel</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">Style : Positif, motivant, valorisant</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 italic text-sm">
                  "Trimestre en nette amélioration ! Ces progrès montrent de vraies capacités. Poursuivez dans cette dynamique."
                </p>
              </div>
            </div>

            {/* Tone 5: Constructif */}
            <div className="bg-cyan-500/20 backdrop-blur rounded-2xl p-6 border border-cyan-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-cyan-500/30 rounded-full flex items-center justify-center text-xl">🔵</span>
                <div>
                  <h3 className="font-bold text-white">Constructif</h3>
                  <p className="text-slate-400 text-xs">Bon élève qui peut aller plus loin</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">Style : Exigeant, orienté solutions, ambitieux</p>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 italic text-sm">
                  "Résultats satisfaisants. Une implication plus active et une gestion du temps optimisée permettraient d'atteindre l'excellence."
                </p>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-amber-500/20 backdrop-blur rounded-2xl p-6 border border-amber-500/30 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl mb-4 block">💡</span>
                <p className="text-amber-300 font-medium">Astuce</p>
                <p className="text-slate-300 text-sm">Vous pouvez mixer les tons selon les élèves dans une même classe !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium mb-4">
              ⚙️ Workflow Intelligent et Personnalisable
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Un Outil Qui S'Adapte À Votre Façon de Travailler
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Ton global ou individuel</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Définissez un ton par défaut pour toute la classe ou personnalisez le ton élève par élève selon les profils.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📏</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Limite de caractères configurable</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Adaptez la longueur aux contraintes de votre logiciel (PRONOTE, Educ'Horus...). De 200 à 500 caractères.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Session persistante</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Vos paramètres sont mémorisés (ton, longueur). Vos données restent disponibles. Reprenez où vous en étiez.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <RefreshCw className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Régénération illimitée</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Pas satisfait ? Régénérez autant de fois que nécessaire. Testez différents tons pour trouver le plus adapté.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Bilan de classe (Étape 4)</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Génération automatique d'une synthèse globale basée sur 4 critères : Travail, Comportement, Participation, Progression.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">100% RGPD</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Données traitées localement dans votre navigateur. Aucune information envoyée sur un serveur externe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium mb-4">
              ❓ Vos Interrogations
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Vos Questions Sur ReportCardAI
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
              question="Les moyennes chiffrées apparaissent-elles dans les appréciations ?"
              answer="Non, jamais. Nous avons délibérément exclu les moyennes chiffrées pour éviter la redondance avec PRONOTE où elles sont déjà affichées. Les appréciations restent qualitatives et pédagogiques."
            />
            <FAQItem 
              question="Puis-je modifier une appréciation après génération ?"
              answer="Oui, totalement. Vous pouvez éditer le texte manuellement, le régénérer, ou changer le ton et relancer. Vous gardez le contrôle à 100%."
            />
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center px-4 py-2 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
                👨‍🏫 Conçu Par Un Enseignant, Pour Les Enseignants
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                L'Expérience du Terrain Traduite en Outil
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Plus de 20 ans d'expérience dans la rédaction de bulletins scolaires</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Né d'un besoin réel : gagner du temps sans perdre en qualité</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Testé et affiné sur plusieurs trimestres avec des centaines d'élèves</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Pensé pour PRONOTE : respect des contraintes techniques du logiciel</p>
              </div>
            </div>

            <blockquote className="text-center text-xl italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              "J'ai conçu ReportCardAI parce que je passais mes soirées à rédiger des appréciations. Maintenant, je les termine en 45 minutes au lieu de 3 heures, et la qualité est constante du premier au dernier élève."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à Récupérer Vos Soirées ?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Des appréciations personnalisées en quelques clics, pas en plusieurs heures.
            </p>

            <Link to="/reportcard-ai/app">
              <Button className="px-10 py-7 bg-white text-amber-700 font-bold rounded-xl shadow-2xl hover:bg-amber-50 hover:-translate-y-1 transition-all text-lg">
                Commencer Avec ReportCardAI Gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-amber-100 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Gratuit et complet
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Sans inscription
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Testez avec vos vrais élèves
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Données 100% confidentielles
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ReportCard AI" className="w-10 h-10" />
              <div>
                <p className="text-white font-semibold">ReportCard<span className="text-amber-500">AI</span></p>
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

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-slate-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
