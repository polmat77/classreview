import { FileText, ClipboardList, AlertTriangle, Lightbulb } from "lucide-react";

interface StepInfoBannerProps {
  step: 1 | 2 | 3 | 4;
}

const stepConfig = {
  1: {
    lines: [
      { icon: FileText, text: "Document requis : Le tableau des résultats de la classe" },
      { icon: Lightbulb, text: "Aide disponible en haut à droite (bouton orange)" },
    ],
  },
  2: {
    lines: [
      { icon: FileText, text: "Document requis : Le bulletin de la classe entière" },
      { icon: Lightbulb, text: "Aide disponible en haut à droite (bouton orange)" },
    ],
  },
  3: {
    lines: [
      { icon: FileText, text: "Document requis : Un fichier comprenant tous les bulletins individuels de la classe" },
      { icon: AlertTriangle, text: 'Important : Penser à décocher "un document *.pdf par ressource" dans PRONOTE' },
      { icon: Lightbulb, text: "Aide disponible en haut à droite (bouton orange)" },
    ],
  },
  4: {
    lines: [
      { icon: ClipboardList, text: "Récapitulatif et export de vos appréciations" },
      { icon: Lightbulb, text: "Aide disponible en haut à droite (bouton orange)" },
    ],
  },
};

const StepInfoBanner = ({ step }: StepInfoBannerProps) => {
  const config = stepConfig[step];

  return (
    <div
      role="status"
      className="w-full rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-400 px-5 py-4 mb-6"
    >
      <div className="flex flex-col gap-1.5">
        {config.lines.map((line, i) => {
          const Icon = line.icon;
          return (
            <div key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{line.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepInfoBanner;
