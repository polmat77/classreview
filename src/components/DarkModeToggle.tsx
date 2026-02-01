import { useDarkMode } from '@/hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'button' | 'switch';
  showLabel?: boolean;
}

export function DarkModeToggle({ className, variant = 'button', showLabel = false }: DarkModeToggleProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  if (variant === 'switch') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {showLabel && (
          <span className="text-sm text-slate-600 dark:text-slate-400">Mode sombre</span>
        )}
        <button
          onClick={toggleDarkMode}
          className={cn(
            "relative w-14 h-8 rounded-full transition-colors duration-300",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}
          aria-label="Toggle dark mode"
        >
          <span
            className={cn(
              "absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center",
              isDark ? "left-7 bg-slate-900" : "left-1 bg-white shadow-md"
            )}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        "relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors",
        className
      )}
      aria-label="Toggle dark mode"
    >
      <Sun
        className={cn(
          "w-5 h-5 text-amber-500 transition-all duration-300",
          isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "w-5 h-5 text-slate-300 transition-all duration-300 absolute inset-0 m-auto",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
        )}
      />
    </button>
  );
}

export default DarkModeToggle;
