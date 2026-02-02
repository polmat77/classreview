import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ArrowRight, ArrowLeft, Clock, FileText, Brain, Shield, Users, Sparkles, Copy, RefreshCw, BarChart3 } from "lucide-react";
import { useState } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";

const logo = "/images/logos/ClassCouncilAI_logo.png";

const ClassCouncilLanding = () => {
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
              <span className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium">
                🎯 Conseils de classe
              </span>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Conseil de Classe : Libérez-vous du Stress de la{" "}
                <span className="text-amber-500">Synthèse</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400">
                Des appréciations de classe professionnelles en quelques clics, pas en plusieurs heures.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 py-4">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  RGPD Conforme
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  100% Local
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  80% de temps gagné
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                  🇫🇷 Made in France
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

              {/* Reassurance */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Gratuit et sans engagement
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Aucune installation requise
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Aucune inscription nécessaire
                </span>
              </div>
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

      {/* Problem Section */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-sm font-medium mb-4">
              😰 Le problème que vous connaissez trop bien
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Professeur Principal : Une Responsabilité Valorisante...{" "}
              <span className="text-red-500">Mais Chronophage</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Le manque de temps</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Entre 2 et 3 heures pour rédiger l'appréciation de votre classe</p>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La page blanche</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Trouver les bons mots pour synthétiser 28 profils différents</p>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">😰</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La pression</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Le conseil de classe est dans 48h et vous n'avez rien préparé</p>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">L'équilibre délicat</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Être constructif sans être décourageant, ferme sans être cassant</p>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">La charge mentale</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">En plus de vos heures de cours et de vos corrections</p>
            </div>
          </div>

          {/* Reality Check */}
          <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">📊 La réalité des chiffres</h3>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600 dark:text-slate-400 text-sm mb-6">
              <div>
                <p className="mb-2">• Prime de professeur principal : <strong className="text-slate-900 dark:text-white">~1 200€ brut/an</strong> (environ 100€/mois)</p>
                <p className="mb-2">• Heures supplémentaires : <strong className="text-slate-900 dark:text-white">~30€ brut/heure</strong></p>
              </div>
              <div>
                <p className="mb-2">• Temps moyen pour préparer un conseil de classe : <strong className="text-slate-900 dark:text-white">2-3h</strong></p>
                <p className="mb-2">• Si vous consacrez 2h30 par conseil × 3 conseils = <strong className="text-slate-900 dark:text-white">7h30 par an</strong></p>
              </div>
            </div>
            <div className="bg-amber-100 dark:bg-amber-500/20 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-sm">
              <strong>Valorisation horaire de votre prime PP :</strong> 1200€ ÷ 7h30 de préparation = environ <strong>160€/heure</strong>... si vous ne faites QUE cette tâche (sans compter toutes vos autres responsabilités de PP).
            </div>
          </div>

          {/* Empathetic Quote */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <blockquote className="text-xl italic text-slate-600 dark:text-slate-400 border-l-4 border-cyan-500 pl-6">
              "Nous savons que votre expertise pédagogique n'a pas besoin d'être prouvée. C'est votre temps qui mérite d'être préservé. ClassCouncil AI vous rend ces heures précieuses."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Solution Section - How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium mb-4">
              ✨ Votre Assistant Pour les Synthèses de Classe
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Comment ClassCouncil AI Vous Aide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:border-slate-600 hover:-translate-y-1 transition-all h-full">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Import Instantané</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Déposez votre PDF PRONOTE (bulletin de classe)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Extraction automatique des données</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Vérification et validation des informations</span>
                  </li>
                </ul>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-slate-300 text-3xl z-10">
                →
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:border-slate-600 hover:-translate-y-1 transition-all h-full">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Génération Intelligente</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Analyse des moyennes, absences, comportement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Identification des tendances de classe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span>Génération d'une appréciation personnalisée et nuancée</span>
                  </li>
                </ul>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-slate-300 text-3xl z-10">
                →
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-none hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Export et Copie</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                  <li className="flex items-start gap-2">
                    <Copy className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Copie en un clic dans votre presse-papiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Régénération possible si besoin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Export pour archivage personnel</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Saved Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
              ⏱️ Une Révolution Pour Votre Quotidien
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Temps gagné avec ClassCouncil AI
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Per Council */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-cyan-400">Par conseil de classe</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-red-400 text-2xl">❌</span>
                  <div>
                    <p className="text-slate-300">Avant</p>
                    <p className="text-2xl font-bold text-red-400">2-3 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 text-2xl">✅</span>
                  <div>
                    <p className="text-slate-300">Après</p>
                    <p className="text-2xl font-bold text-emerald-400">10-15 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-amber-400 text-2xl">🎉</span>
                  <div>
                    <p className="text-slate-300">Gain</p>
                    <p className="text-2xl font-bold text-amber-400">2h à 2h45 par conseil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Per Year */}
            <div className="bg-amber-500/20 backdrop-blur rounded-2xl p-8 border border-amber-500/30">
              <h3 className="text-xl font-bold mb-6 text-amber-400">Sur l'année (3 conseils)</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-red-400 text-2xl">❌</span>
                  <div>
                    <p className="text-slate-300">Avant</p>
                    <p className="text-2xl font-bold text-red-400">6-9 heures au total</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 text-2xl">✅</span>
                  <div>
                    <p className="text-slate-300">Après</p>
                    <p className="text-2xl font-bold text-emerald-400">30-45 minutes au total</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-amber-400 text-2xl">🎉</span>
                  <div>
                    <p className="text-slate-300">Gain annuel</p>
                    <p className="text-2xl font-bold text-amber-400">5h à 8h30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What These Hours Represent */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center text-cyan-400">Ce que représentent ces heures</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <p className="text-3xl mb-2">💰</p>
                <p className="text-amber-400 font-bold">10 à 17 HS</p>
                <p className="text-slate-400 text-sm">en valorisation financière (~30€/h)</p>
              </div>
              <div className="p-4">
                <p className="text-3xl mb-2">📚</p>
                <p className="text-amber-400 font-bold">50 à 80 copies</p>
                <p className="text-slate-400 text-sm">Le temps de corriger</p>
              </div>
              <div className="p-4">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-amber-400 font-bold">8 à 14 heures</p>
                <p className="text-slate-400 text-sm">de préparation de cours</p>
              </div>
              <div className="p-4">
                <p className="text-3xl mb-2">🌟</p>
                <p className="text-amber-400 font-bold">Ou simplement</p>
                <p className="text-slate-400 text-sm">du temps pour vous</p>
              </div>
            </div>
          </div>

          {/* Motivating Quote */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <blockquote className="text-xl italic text-slate-300 border-l-4 border-amber-500 pl-6">
              "En tant que professeur principal, vous méritez de consacrer votre énergie à l'accompagnement de vos élèves, pas à votre souris. ClassCouncil AI vous libère pour ce qui compte vraiment."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Import PDF PRONOTE</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Glissez-déposez votre export PRONOTE, l'IA fait le reste.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Analyse automatique</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Moyennes, tendances, élèves en difficulté... tout est analysé.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Appréciations variées</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Vocabulaire riche et professionnel, jamais de répétitions.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Statistiques visuelles</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Graphiques clairs pour visualiser les performances de la classe.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">100% RGPD</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Données traitées localement, jamais envoyées sur un serveur.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Copy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Copie en 1 clic</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Copiez chaque appréciation instantanément vers PRONOTE.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium mb-4">
              ❓ Vos Questions Légitimes
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Vos Questions Sur ClassCouncil AI
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem 
              question="Les appréciations seront-elles toutes identiques d'un trimestre à l'autre ?"
              answer="Non. Chaque trimestre a son profil unique (évolution des moyennes, changements de comportement, progression ou régression). L'IA génère une synthèse adaptée aux données spécifiques de chaque période. De plus, vous pouvez régénérer ou modifier le texte librement."
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
              answer="Absolument. Le texte généré est un point de départ. Vous pouvez le modifier, le compléter, le régénérer ou le réécrire entièrement. Vous restez maître du contenu final."
            />
            <FAQItem 
              question="Est-ce compatible avec tous les formats PRONOTE ?"
              answer="ClassCouncil AI est conçu pour les exports PDF standards de PRONOTE. Si votre format est différent, une saisie manuelle reste possible."
            />
            <FAQItem 
              question="Mon chef d'établissement peut-il voir que j'utilise cet outil ?"
              answer="Non. Le texte final que vous copiez dans PRONOTE est indiscernable d'un texte écrit manuellement. ClassCouncil AI est votre assistant personnel discret."
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
                👨‍🏫 Conçu Par Ceux Qui Comprennent
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Parce Qu'Un Enseignant Sait Ce Qu'Un Professeur Principal Vit
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Créé par un professeur principal qui connaît la charge du conseil de classe</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Plus de 20 ans d'expérience dans la rédaction d'appréciations</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Testé en conditions réelles sur plusieurs trimestres</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Pensé pour PRONOTE : respect des contraintes de caractères et du format</p>
              </div>
            </div>

            <blockquote className="text-center text-xl italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              "J'ai créé ClassCouncil AI parce que j'en avais moi-même besoin. Maintenant, je gagne 2h30 par conseil que je peux consacrer à mes élèves plutôt qu'à ma souris. Sur l'année, c'est presque une journée complète que je récupère."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-700 dark:to-cyan-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à Récupérer Votre Temps ?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Vous êtes professeur principal pour accompagner vos élèves, pas pour passer vos soirées à rédiger. ClassCouncil AI vous rend ce temps précieux.
            </p>

            <Link to="/classcouncil-ai/app">
              <Button className="px-10 py-7 bg-white text-cyan-700 font-bold rounded-xl shadow-2xl hover:bg-cyan-50 hover:-translate-y-1 transition-all text-lg">
                Essayer ClassCouncil AI Gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-cyan-100 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Gratuit et sans engagement
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Aucune installation requise
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Aucune inscription nécessaire
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Testez dès maintenant avec vos données
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
              <img src={logo} alt="ClassCouncil AI" className="w-10 h-10" />
              <div>
                <p className="text-white font-semibold">ClassCouncil<span className="text-amber-500">AI</span></p>
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

export default ClassCouncilLanding;
