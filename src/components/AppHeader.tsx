import logo from "@/assets/logo.png";

const AppHeader = () => {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="ClassCouncil AI Logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">ClassCouncil AI</h1>
              <p className="text-xs text-muted-foreground">Analyse de bulletins scolaires</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
