// Re-export UnifiedToneSelector as ReportCardToneSelector for backwards compatibility
import { UnifiedToneSelector, UnifiedTone } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/reportcard";

interface ReportCardToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  showDescription?: boolean;
}

const ReportCardToneSelector = ({ 
  value, 
  onChange, 
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
      showDescription={showDescription}
    />
  );
};

export default ReportCardToneSelector;
