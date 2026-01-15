import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModifyFileButtonProps {
  accept: string;
  isLoading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ModifyFileButton = ({ accept, isLoading, onUpload }: ModifyFileButtonProps) => {
  return (
    <label className="cursor-pointer">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200"
        asChild
        disabled={isLoading}
      >
        <span>
          <RefreshCw className="h-4 w-4" />
          Modifier le fichier
        </span>
      </Button>
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={onUpload}
        disabled={isLoading}
      />
    </label>
  );
};

export default ModifyFileButton;