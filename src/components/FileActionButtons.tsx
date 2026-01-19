import { useRef, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface FileActionButtonsProps {
  accept: string;
  isLoading: boolean;
  currentFileName?: string;
  loadedInfo?: string;
  onReplace: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const FileActionButtons = ({
  accept,
  isLoading,
  currentFileName = "Fichier actuel",
  loadedInfo,
  onReplace,
  onRemove,
}: FileActionButtonsProps) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const handleReplaceClick = () => {
    replaceInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowReplaceConfirm(true);
    }
  };

  const confirmReplacement = () => {
    if (pendingFile && replaceInputRef.current) {
      // Create a synthetic event with the pending file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pendingFile);
      replaceInputRef.current.files = dataTransfer.files;
      
      // Create and dispatch the change event
      const syntheticEvent = {
        target: replaceInputRef.current,
        currentTarget: replaceInputRef.current,
      } as React.ChangeEvent<HTMLInputElement>;
      
      onReplace(syntheticEvent);
      toast.success(`Fichier remplacé par "${pendingFile.name}"`);
    }
    setPendingFile(null);
    setShowReplaceConfirm(false);
  };

  const cancelReplacement = () => {
    setPendingFile(null);
    setShowReplaceConfirm(false);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  const handleRemoveConfirm = () => {
    onRemove();
    toast.success("Fichier retiré avec succès");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Bouton Remplacer */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200"
          onClick={handleReplaceClick}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          Remplacer
        </Button>

        {/* Bouton Retirer avec confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
              Retirer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Retirer ce fichier ?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Le fichier "<span className="font-medium">{currentFileName}</span>" sera 
                  retiré et toutes les données associées seront effacées.
                </p>
                {loadedInfo && (
                  <p className="text-muted-foreground text-sm">
                    Données actuelles : {loadedInfo}
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Retirer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Input file caché pour le remplacement */}
        <input
          type="file"
          ref={replaceInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>

      {/* Modal de confirmation de remplacement */}
      <AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer le fichier actuel ?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm">
                    <span className="text-muted-foreground">Fichier actuel :</span>{" "}
                    <span className="font-medium">{currentFileName}</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Nouveau fichier :</span>{" "}
                    <span className="font-medium">{pendingFile?.name}</span>
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Les données actuelles seront remplacées par celles du nouveau fichier.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelReplacement}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplacement}>
              Remplacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileActionButtons;
