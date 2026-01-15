import { GraduationCap } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Class Review Master</h1>
              <p className="text-xs text-muted-foreground">Analyse de bulletins scolaires</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
