import { PenLine } from "lucide-react";
import FileActionButtons from "@/components/FileActionButtons";
import PronoteHelpTooltip from "@/components/PronoteHelpTooltip";

interface AppreciationPageHeaderProps {
  studentsCount: number;
  currentFileName: string;
  isProcessing: boolean;
  onReplace: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const AppreciationPageHeader = ({
  studentsCount,
  currentFileName,
  isProcessing,
  onReplace,
  onRemove,
}: AppreciationPageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PenLine className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Appréciations individuelles</h2>
          <p className="text-muted-foreground">
            {studentsCount} élève{studentsCount > 1 ? "s" : ""} chargé{studentsCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PronoteHelpTooltip type="individuels" />
        <FileActionButtons
          accept=".pdf"
          isLoading={isProcessing}
          currentFileName={currentFileName || "Bulletins élèves"}
          loadedInfo={`${studentsCount} élève${studentsCount > 1 ? "s" : ""} chargé${studentsCount > 1 ? "s" : ""}`}
          onReplace={onReplace}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

export default AppreciationPageHeader;
