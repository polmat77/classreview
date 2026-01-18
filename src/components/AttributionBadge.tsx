import { Attribution, attributionConfig } from "@/types/attribution";
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  ThumbsUp, 
  Star, 
  Trophy 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttributionBadgeProps {
  attribution: Attribution;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const iconMap = {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ThumbsUp,
  Star,
  Trophy,
};

const AttributionBadge = ({ 
  attribution, 
  size = "md", 
  showIcon = true,
  className 
}: AttributionBadgeProps) => {
  const config = attributionConfig[attribution];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium text-white whitespace-nowrap",
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent className={iconSizes[size]} />
      )}
      {config.shortLabel}
    </span>
  );
};

export default AttributionBadge;
