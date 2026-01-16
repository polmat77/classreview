import { ReactNode, useState } from "react";
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureItem {
  text: string;
}

interface TabUploadPlaceholderProps {
  title: string;
  icon: ReactNode;
  description: string;
  accept: string;
  features: FeatureItem[];
  featuresTitle?: string;
  isLoading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helpTooltip?: ReactNode;
}

const TabUploadPlaceholder = ({
  title,
  icon,
  description,
  accept,
  features,
  featuresTitle = "Une fois le fichier chargé, vous accéderez à :",
  isLoading,
  onUpload,
  error,
  helpTooltip,
}: TabUploadPlaceholderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      input.files = dataTransfer.files;
      
      const event = {
        target: input,
        currentTarget: input,
      } as React.ChangeEvent<HTMLInputElement>;
      
      onUpload(event);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
        </div>
        {helpTooltip}
      </div>

      {/* Main Card */}
      <Card className="max-w-3xl mx-auto shadow-md border border-border rounded-xl">
        <CardContent className="p-8">
          {/* Description */}
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          {/* Upload dropzone */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200",
              isLoading && "opacity-50 cursor-not-allowed",
              error && "border-destructive bg-destructive/5",
              isDragging && "border-primary border-solid bg-primary/10 scale-[1.02]",
              !isDragging && !error && !isLoading && "border-muted-foreground/30 bg-muted/30 hover:border-primary hover:bg-primary/5"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <span className="text-muted-foreground font-medium">Chargement en cours...</span>
              </>
            ) : (
              <>
                <Upload className={cn(
                  "h-12 w-12",
                  isDragging ? "text-primary" : "text-muted-foreground/60"
                )} />
                <div className="text-center">
                  <p className="text-muted-foreground font-medium">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-primary underline underline-offset-2 mt-1">
                    ou cliquez pour parcourir
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}
                </span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={onUpload}
              disabled={isLoading}
            />
          </label>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-3">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Features section */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {featuresTitle}
            </p>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabUploadPlaceholder;