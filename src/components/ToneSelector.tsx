// Re-export UnifiedToneSelector as ToneSelector for backwards compatibility with ClassCouncil AI
import { UnifiedToneSelector, UnifiedTone } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/appreciation";

interface ToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
}

// Migration des anciens tons vers les nouveaux
const migrateLegacyTone = (tone: string): AppreciationTone => {
  const migration: Record<string, AppreciationTone> = {
    'caring': 'encourageant',
    'praising': 'elogieux',
  };
  return migration[tone] || (tone as AppreciationTone);
};

const ToneSelector = ({ value, onChange, compact = false }: ToneSelectorProps) => {
  // Migrate legacy tone value if needed
  const normalizedValue = migrateLegacyTone(value);
  
  const handleChange = (unifiedTone: UnifiedTone) => {
    onChange(unifiedTone as AppreciationTone);
  };

  return (
    <UnifiedToneSelector
      value={normalizedValue}
      onChange={handleChange}
      compact={compact}
      showDescription={false}
    />
  );
};

export default ToneSelector;
