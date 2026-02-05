import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface CopyButtonProps {
  text: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  copiedLabel?: string;
}

export const CopyButton = ({ 
  text, 
  variant = "outline", 
  size = "sm", 
  className = "",
  label = "Copier",
  copiedLabel = "Copié !"
}: CopyButtonProps) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => copyToClipboard(text)}
      className={className}
      disabled={!text}
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
};

export default CopyButton;
