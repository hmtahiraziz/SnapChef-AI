import { CountryDropdown } from './CountryDropdown';

type CountryPickerProps = {
  value: string;
  onChange: (country: string) => void;
};

/** @deprecated Prefer CountryDropdown — kept for existing imports. */
export function CountryPicker({ value, onChange }: CountryPickerProps) {
  return <CountryDropdown value={value} onChange={onChange} />;
}
