import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CharacterLimitSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

const DEFAULT_OPTIONS = [300, 350, 400, 450, 500];

export const CharacterLimitSelector = ({ 
  value, 
  onChange, 
  options = DEFAULT_OPTIONS,
  className = ""
}: CharacterLimitSelectorProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted-foreground whitespace-nowrap">Limite :</span>
      <Select
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v, 10))}
      >
        <SelectTrigger className="h-8 w-[100px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt.toString()}>
              {opt} car.
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CharacterLimitSelector;
