// Re-export UnifiedToneSelector as ReportCardToneSelector for backwards compatibility
import { UnifiedToneSelector, UnifiedTone } from "@/components/shared/UnifiedToneSelector";
import { AppreciationTone } from "@/types/reportcard";

interface ReportCardToneSelectorProps {
  value: AppreciationTone;
  onChange: (value: AppreciationTone) => void;
  compact?: boolean;
  showDescription?: boolean;
}

// Migration des anciens tons vers les nouveaux
const migrateLegacyTone = (tone: string): AppreciationTone => {
  const migration: Record<string, AppreciationTone> = {
    'ferme': 'severe',
    'neutre': 'standard',
    'bienveillant': 'encourageant',
    'constructif': 'standard',
  };
  return migration[tone] || (tone as AppreciationTone);
};

const ReportCardToneSelector = ({ 
  value, 
  onChange, 
  compact = false,
  showDescription = false 
}: ReportCardToneSelectorProps) => {
  // Migrate legacy tone value if needed
  const normalizedValue = migrateLegacyTone(value);
  
  const handleChange = (tone: UnifiedTone) => {
    onChange(tone as AppreciationTone);
  };

  return (
    <UnifiedToneSelector
      value={normalizedValue}
      onChange={handleChange}
      compact={compact}
      showDescription={showDescription}
    />
  );
};

export default ReportCardToneSelector;
