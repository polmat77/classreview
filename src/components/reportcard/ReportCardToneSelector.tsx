// Re-export UnifiedToneSelector as ReportCardToneSelector for backwards compatibility
import { UnifiedToneSelector, UnifiedTone } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/reportcard";

interface ReportCardToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
  showDescription?: boolean;
}

const ReportCardToneSelector = ({ 
  value, 
  onChange, 
  compact = false,
  showDescription = false 
}: ReportCardToneSelectorProps) => {
  // ReportCardAI already uses the unified tone values (ferme, neutre, etc.)
  // so we can pass them directly
  const handleChange = (tone: UnifiedTone) => {
    onChange(tone as AppreciationTone);
  };

  return (
    <UnifiedToneSelector
      value={value}
      onChange={handleChange}
      compact={compact}
      showDescription={showDescription}
    />
  );
};

export default ReportCardToneSelector;
