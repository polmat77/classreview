import { useState } from "react";
import { User, Copy, Check, Edit2, Sparkles, Loader2, ChevronDown, ChevronUp, Quote, FileSearch, RefreshCw, Scissors } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Justification } from "@/utils/studentBulletinAnalyzer";
import { ConductAnalysis } from "@/types/attribution";
import { Attribution } from "@/types/attribution";
import { AppreciationTone } from "@/types/appreciation";
import { StudentBulletinAnalysis } from "@/types/bulletinAnalysis";
import ToneSelector from "@/components/ToneSelector";
import AttributionSelector from "@/components/AttributionSelector";
import ConductIssuesIndicator from "@/components/ConductIssuesIndicator";
import BulletinAnalysisSection from "@/components/analysis/BulletinAnalysisSection";
import { truncateIntelligently } from "@/utils/attributionAnalysis";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/hooks/use-toast";

interface StudentAppreciationCardProps {
  index: number;
  name: string;
  firstName: string;
  average: number;
  status: "excellent" | "good" | "needs-improvement";
  appreciation: string;
  justifications: Justification[];
  bulletinAnalysis?: StudentBulletinAnalysis;
  tone: AppreciationTone;
  attribution: Attribution | null;
  suggestedAttribution: Attribution | null;
  conductAnalysis: ConductAnalysis;
  charLimit: number;
  attributionsEnabled: boolean;
  isLoading: boolean;
  isEditing: boolean;
  onToneChange: (tone: AppreciationTone) => void;
  onAttributionChange: (attribution: Attribution | null) => void;
  onAppreciationChange: (text: string) => void;
  onRegenerate: () => void;
  onEditToggle: () => void;
  onTruncate: () => void;
}

const StudentAppreciationCard = ({
  index,
  name,
  firstName,
  average,
  status,
  appreciation,
  justifications,
  bulletinAnalysis,
  tone,
  attribution,
  suggestedAttribution,
  conductAnalysis,
  charLimit,
  attributionsEnabled,
  isLoading,
  isEditing,
  onToneChange,
  onAttributionChange,
  onAppreciationChange,
  onRegenerate,
  onEditToggle,
  onTruncate
}: StudentAppreciationCardProps) => {
  const { toast } = useToast();
  const [justificationsOpen, setJustificationsOpen] = useState(false);
  const [originalText, setOriginalText] = useState("");
  
  // Separate copy states for header button and inline button
  const { isCopied: isHeaderCopied, copyToClipboard: copyHeader } = useCopyToClipboard();
  const { isCopied: isInlineCopied, copyToClipboard: copyInline } = useCopyToClipboard();

  // Store original text when entering edit mode
  const handleEditToggle = () => {
    if (!isEditing) {
      setOriginalText(appreciation);
    }
    onEditToggle();
  };

  const handleSave = () => {
    onEditToggle();
    toast({ title: "Enregistré ✓", description: `L'appréciation de ${name} a été sauvegardée.` });
  };

  const handleCancel = () => {
    onAppreciationChange(originalText);
    onEditToggle();
  };
  
  const charCount = appreciation.length;
  const isOverLimit = charCount > charLimit;
  
  // Handle copy with toast feedback
  const handleCopyFromHeader = async () => {
    if (!appreciation) return;
    await copyHeader(appreciation);
    toast({ title: "Copié !", description: "L'appréciation a été copiée dans le presse-papiers." });
  };
  
  const handleCopyFromInline = async () => {
    if (!appreciation) return;
    await copyInline(appreciation);
    toast({ title: "Copié !", description: "L'appréciation a été copiée dans le presse-papiers." });
  };
  
  // Character count color helper
  const getCharCountColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage < 80) return 'text-green-600';
    if (percentage <= 100) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
      case "good":
        return <Badge className="bg-accent text-accent-foreground">Satisfaisant</Badge>;
      case "needs-improvement":
        return <Badge className="bg-warning text-warning-foreground">Fragile</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-400">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          {/* Row 1: Name, average, and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription>Moyenne: {average.toFixed(2).replace('.', ',')}/20</CardDescription>
              </div>
            </div>
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1">
                {getStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyFromHeader}
                      disabled={!appreciation || isEditing}
                    >
                      {isHeaderCopied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Copier l'appréciation</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRegenerate}
                      disabled={isLoading || isEditing}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Générer l'appréciation</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditToggle}
                      className={isEditing ? "text-[#7dd3e8]" : ""}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Modifier l'appréciation</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          
          {/* Row 2: Attribution and Tone selectors */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t">
            {attributionsEnabled && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Attribution :</span>
                <AttributionSelector
                  value={attribution}
                  suggestedValue={suggestedAttribution}
                  onChange={onAttributionChange}
                  compact
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Ton :</span>
              <ToneSelector 
                value={tone} 
                onChange={onToneChange}
                compact
              />
            </div>
          </div>
          
          {/* Row 3: Conduct analysis (only when attributions enabled) */}
          {attributionsEnabled && (
            <div className="pt-2">
              <ConductIssuesIndicator 
                analysis={conductAnalysis}
                compact
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="space-y-3 transition-all duration-300">
            <Textarea
              value={appreciation}
              onChange={(e) => onAppreciationChange(e.target.value)}
              className="min-h-[120px] resize-none border-2 border-[#7dd3e8] focus:border-[#7dd3e8] focus:ring-[#7dd3e8]/30"
              placeholder="Cliquez sur l'icône ✨ pour générer l'appréciation..."
            />
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getCharCountColor(charCount, charLimit)}`}>
                {charCount}/{charLimit} caractères
                {isOverLimit && (
                  <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                    ⚠️ {charCount - charLimit} en trop
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                {isOverLimit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onTruncate}
                    className="text-warning hover:text-warning"
                  >
                    <Scissors className="h-4 w-4 mr-1" />
                    Tronquer
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                >
                  ❌ Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-[#f0a830] hover:bg-[#e09520] text-white"
                >
                  ✅ Enregistrer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bulletin Analysis Section - Oral presentation for class council */}
            {bulletinAnalysis && (
              <BulletinAnalysisSection
                analysis={bulletinAnalysis}
              />
            )}
            
            {/* Appreciation text - with header separator */}
            <div className={bulletinAnalysis ? "border-t pt-4 mt-4" : ""}>
              {bulletinAnalysis && (
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    💬 Appréciation générale
                  </h4>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyFromInline}
                          disabled={!appreciation}
                          className="h-7 w-7 p-0"
                        >
                          {isInlineCopied ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Copier l'appréciation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <p className="text-sm leading-relaxed text-foreground min-h-[40px]">
                {appreciation || (
                  <span className="text-muted-foreground italic">
                    Aucune appréciation générée. Cliquez sur ✨ pour générer.
                  </span>
                )}
              </p>
            </div>
            
            {/* Character counter */}
            {appreciation && (
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${getCharCountColor(charCount, charLimit)}`}>
                  {charCount}/{charLimit}
                  {isOverLimit && (
                    <span className="ml-1 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-xs">
                      -{charCount - charLimit}
                    </span>
                  )}
                </span>
                {isOverLimit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onTruncate}
                    className="h-6 text-xs text-warning hover:text-warning"
                  >
                    <Scissors className="h-3 w-3 mr-1" />
                    Tronquer
                  </Button>
                )}
              </div>
            )}
            
            {/* Justifications collapsible section (for AI appreciation) */}
            {justifications.length > 0 && (
              <Collapsible open={justificationsOpen} onOpenChange={setJustificationsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-2 border-t pt-3"
                  >
                    <span className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4" />
                      Justifications IA ({justifications.length})
                    </span>
                    {justificationsOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-3 space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                    {justifications.map((justif, jIndex) => (
                      <div key={jIndex} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Quote className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm mb-2 italic">
                              "{justif.sentence}"
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground uppercase font-semibold">
                                Source : {justif.source}
                              </p>
                              {justif.quotes.map((quote, qIndex) => (
                                <div 
                                  key={qIndex} 
                                  className="text-sm text-muted-foreground italic pl-4 border-l-2 border-primary/30"
                                >
                                  {quote}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {jIndex < justifications.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAppreciationCard;
