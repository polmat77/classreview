import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import Stepper from "@/components/Stepper";
import AnalyseTab from "@/components/tabs/AnalyseTab";
import MatieresTab from "@/components/tabs/MatieresTab";
import AppreciationsTab from "@/components/tabs/AppreciationsTab";
import ExportTab from "@/components/tabs/ExportTab";
import { BulletinClasseData, BulletinEleveData } from "@/utils/pdfParser";
import { ClasseDataCSV } from "@/utils/csvParser";

const tabs = [
  { value: "analyse", label: "Résultats" },
  { value: "matieres", label: "Classe" },
  { value: "appreciations", label: "Élèves" },
  { value: "export", label: "Bilan" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("analyse");
  const [classeData, setClasseData] = useState<{
    bulletinClasse?: BulletinClasseData;
    bulletinsEleves?: BulletinEleveData[];
    classeCSV?: ClasseDataCSV;
  }>({});

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "analyse":
        return (
          <AnalyseTab 
            onNext={() => setActiveTab("matieres")} 
            data={classeData}
            onDataLoaded={handleDataUpdate}
          />
        );
      case "matieres":
        return (
          <MatieresTab 
            onNext={() => setActiveTab("appreciations")} 
            data={classeData}
            onDataLoaded={handleDataUpdate}
          />
        );
      case "appreciations":
        return (
          <AppreciationsTab 
            onNext={() => setActiveTab("export")} 
            data={classeData}
            onDataLoaded={handleDataUpdate}
          />
        );
      case "export":
        return <ExportTab data={classeData} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Stepper */}
      <div className="mb-6">
        <Stepper 
          currentStep={getStepNumber()} 
          steps={tabs.map((tab, index) => ({ id: index + 1, label: tab.label }))}
        />
      </div>

      {/* Content */}
      <div className="bg-card rounded-2xl shadow-sm border p-6">
        {renderTabContent()}
      </div>
    </MainLayout>
  );
};

export default Index;
