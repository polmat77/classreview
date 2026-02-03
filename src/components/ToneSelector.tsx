// Re-export UnifiedToneSelector as ToneSelector for backwards compatibility with ClassCouncil AI
import { UnifiedToneSelector, UnifiedTone, legacyToUnifiedToneMap, unifiedToLegacyMap } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/appreciation";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
}

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
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
      compact={compact}
      showDescription={false}
    />
  );
};

export default ToneSelector;
