import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ProgressIndicator from "@/components/ProgressIndicator";
import AnalyseTab from "@/components/tabs/AnalyseTab";
import MatieresTab from "@/components/tabs/MatieresTab";
import AppreciationsTab from "@/components/tabs/AppreciationsTab";
import ExportTab from "@/components/tabs/ExportTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, BookOpen, PenLine, Download } from "lucide-react";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";

const Index = () => {
  const [activeTab, setActiveTab] = useState("analyse");
  const [classeData, setClasseData] = useState<{
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  }>({});

  const tabs = [
    { value: "analyse", label: "Résultats de la classe", icon: BarChart3 },
    { value: "matieres", label: "Appréciation de la Classe", icon: BookOpen },
    { value: "appreciations", label: "Appréciations individuelles", icon: PenLine },
    { value: "export", label: "Bilan", icon: Download },
  ];

  const getStepNumber = () => {
    return tabs.findIndex((tab) => tab.value === activeTab) + 1;
  };

  const handleDataUpdate = (newData: Partial<{
    bulletinClasse?: BulletinClasseData | null;
    bulletinsEleves?: BulletinEleveData[] | null;
    classeCSV?: ClasseDataCSV | null;
  }>) => {
    setClasseData(prev => {
      const updated = { ...prev };
      // Handle null values to remove data
      if (newData.classeCSV === null) {
        delete updated.classeCSV;
      } else if (newData.classeCSV !== undefined) {
        updated.classeCSV = newData.classeCSV;
      }
      if (newData.bulletinClasse === null) {
        delete updated.bulletinClasse;
      } else if (newData.bulletinClasse !== undefined) {
        updated.bulletinClasse = newData.bulletinClasse;
      }
      if (newData.bulletinsEleves === null) {
        delete updated.bulletinsEleves;
      } else if (newData.bulletinsEleves !== undefined) {
        updated.bulletinsEleves = newData.bulletinsEleves;
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        <ProgressIndicator currentStep={getStepNumber()} totalSteps={4} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-2 bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`flex flex-col items-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md border-primary"
                      : "bg-transparent text-muted-foreground border-transparent hover:bg-primary/5 hover:border-primary/20"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-8">
            <TabsContent value="analyse" className="mt-0">
              <AnalyseTab 
                onNext={() => setActiveTab("matieres")} 
                data={classeData}
                onDataLoaded={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="matieres" className="mt-0">
              <MatieresTab 
                onNext={() => setActiveTab("appreciations")} 
                data={classeData}
                onDataLoaded={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="appreciations" className="mt-0">
              <AppreciationsTab 
                onNext={() => setActiveTab("export")} 
                data={classeData}
                onDataLoaded={handleDataUpdate}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-0">
              <ExportTab data={classeData} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
