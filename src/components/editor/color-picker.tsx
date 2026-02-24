import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function ColorPicker({
  onChange,
  value,
  name,
}: {
  onChange: (value: string) => void;
  value: string;
  name: string;
}) {
  const defaultValue = "inherit";
  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="w-full"
            variant={value === defaultValue ? "secondary" : "outline"}
            onClick={() => {
              onChange(defaultValue);
            }}
            size="sm"
          >
            Ustawiony odgórnie
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Element przybierze kolor ustawiony w elemencie nadrzędnym
        </TooltipContent>
      </Tooltip>
      <label
        htmlFor={name}
        className="border-input flex items-center justify-center gap-2 rounded-md border p-2"
      >
        {value === defaultValue ? null : (
          <div
            className="aspect-square size-4 rounded-full border border-gray-300"
            style={{
              backgroundColor: value,
            }}
          />
        )}
        <p className="text-sm">
          {value === defaultValue ? "Kliknij aby wybrać" : value}
        </p>
      </label>
      <Input
        id={name}
        type="color"
        className="hidden"
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
    </div>
  );
}
