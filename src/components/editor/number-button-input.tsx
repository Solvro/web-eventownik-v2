import { Minus, Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface NumberButtonInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "onChange"
> {
  onChange: (value: string) => void;
}

function NumberButtonInput({ onChange, name, value }: NumberButtonInputProps) {
  return (
    <div className="relative">
      <Button
        className="absolute top-1/2 bottom-1/2 left-3 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-(--event-primary-color)/10 hover:bg-(--event-primary-color)/50"
        size="icon"
        onClick={() => {
          onChange(value === "auto" ? "0" : String(Number(value) - 1));
        }}
      >
        <Minus className="size-2" />
      </Button>
      <Input
        type="number"
        value={value}
        name={name}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        className="[appearance:textfield] text-center"
      />
      <Button
        className="absolute top-1/2 right-3 bottom-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-(--event-primary-color)/10 hover:bg-(--event-primary-color)/50"
        size="icon"
        onClick={() => {
          onChange(value === "auto" ? "0" : String(Number(value) + 1));
        }}
      >
        <Plus className="size-2" />
      </Button>
      {value === "auto" ? (
        <span className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs tracking-widest uppercase">
          Auto
        </span>
      ) : null}
    </div>
  );
}

export { NumberButtonInput };
