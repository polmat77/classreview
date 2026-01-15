import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ProgressIndicator from "@/components/ProgressIndicator";
import AnalyseTab from "@/components/tabs/AnalyseTab";
import MatieresTab from "@/components/tabs/MatieresTab";
import AppreciationsTab from "@/components/tabs/AppreciationsTab";
import ExportTab from "@/components/tabs/ExportTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, BookOpen, FileText, Download } from "lucide-react";
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
    { value: "analyse", label: "Analyse", icon: BarChart3 },
    { value: "matieres", label: "Matières", icon: BookOpen },
    { value: "appreciations", label: "Appréciations", icon: FileText },
    { value: "export", label: "Export", icon: Download },
  ];

  const getStepNumber = () => {
    return tabs.findIndex((tab) => tab.value === activeTab) + 1;
  };

  const handleDataUpdate = (newData: Partial<typeof classeData>) => {
    setClasseData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        <ProgressIndicator currentStep={getStepNumber()} totalSteps={4} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-2 bg-muted/50 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth"
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
              <ExportTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
