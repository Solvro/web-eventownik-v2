import { Button } from "../ui/button";
import { Input } from "../ui/input";

type InputType = "number" | "text";

type InputProps<T extends InputType> = T extends "number"
  ? Partial<Pick<HTMLInputElement, "min" | "max" | "step">>
  : Partial<
      Pick<
        HTMLInputElement,
        "pattern" | "minLength" | "maxLength" | "placeholder"
      >
    >;

interface HybridInputProps<T extends InputType> {
  type: T;
  value: string;
  autoValue: string;
  /**
   * "Set to auto" button label
   */
  label: string;
  onChange: (value: string) => void;
  /**
   * Additional attributes for the input element
   */
  inputProps?: InputProps<T>;
}

function HybridInput<T extends InputType>({
  type,
  value,
  autoValue,
  label,
  onChange,
  inputProps,
}: HybridInputProps<T>) {
  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          onChange(autoValue);
        }}
        variant={value === autoValue ? "secondary" : "outline"}
        size="sm"
        className="w-full"
      >
        {label}
      </Button>
      <Input
        type={type}
        value={value}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        {...inputProps}
      />
    </div>
  );
}

export { HybridInput };
