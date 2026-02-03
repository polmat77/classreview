// Re-export UnifiedToneSelector as ToneSelector for backwards compatibility with ClassCouncil AI
import { UnifiedToneSelector, UnifiedTone, unifiedToLegacyMap } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/appreciation";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
}

const ToneSelector = ({ value, onChange }: ToneSelectorProps) => {
  // Map legacy AppreciationTone to UnifiedTone for the component
  const handleChange = (unifiedTone: UnifiedTone) => {
    // Convert back to legacy tone for ClassCouncil compatibility
    const legacyTone = unifiedToLegacyMap[unifiedTone] as AppreciationTone;
    onChange(legacyTone);
  };

  return (
    <UnifiedToneSelector
      value={value}
      onChange={handleChange}
      showDescription={false}
    />
  );
};

export default ToneSelector;
