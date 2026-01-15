import { Upload, FileCheck, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  title: string;
  description: string;
  accept: string;
  isLoading: boolean;
  isLoaded: boolean;
  loadedInfo?: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  accentColor?: "primary" | "accent";
}

const FileUploadZone = ({
  title,
  description,
  accept,
  isLoading,
  isLoaded,
  loadedInfo,
  onUpload,
  icon,
  accentColor = "primary",
}: FileUploadZoneProps) => {
  const colorClasses = {
    primary: {
      border: isLoaded ? "border-success bg-success/5" : "border-dashed border-primary/50 hover:border-primary",
      iconBg: isLoaded ? "bg-success/20" : "bg-primary/10",
      iconColor: isLoaded ? "text-success" : "text-primary",
      uploadBorder: "hover:border-primary hover:bg-primary/5",
    },
    accent: {
      border: isLoaded ? "border-success bg-success/5" : "border-dashed border-accent/50 hover:border-accent",
      iconBg: isLoaded ? "bg-success/20" : "bg-accent/10",
      iconColor: isLoaded ? "text-success" : "text-accent",
      uploadBorder: "hover:border-accent hover:bg-accent/5",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <Card className={`transition-smooth border-2 ${colors.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.iconBg}`}>
              {isLoaded ? (
                <FileCheck className={`h-5 w-5 ${colors.iconColor}`} />
              ) : (
                <span className={colors.iconColor}>{icon}</span>
              )}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          {isLoaded && (
            <label className="cursor-pointer">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8" asChild>
                <span>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Modifier
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
          )}
        </div>
      </CardHeader>
      {!isLoaded && (
        <CardContent className="pt-0">
          <label
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-smooth ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : `border-muted-foreground/25 ${colors.uploadBorder}`
            }`}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground text-center">
              {isLoading ? "Traitement en cours..." : "Cliquez pour charger le fichier"}
            </span>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={onUpload}
              disabled={isLoading}
            />
          </label>
        </CardContent>
      )}
      {isLoaded && loadedInfo && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-success">
            <FileCheck className="h-4 w-4" />
            <span className="font-medium">{loadedInfo}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FileUploadZone;
