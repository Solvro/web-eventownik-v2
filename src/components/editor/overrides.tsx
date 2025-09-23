import { FieldLabel } from "@measured/puck";
import type { NumberField, Overrides, SelectField } from "@measured/puck";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export const overrides: Partial<Overrides> = {
  fieldTypes: {
    text: ({ onChange, name, value, field }) => (
      <>
        <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
        <Input
          type="text"
          value={value as string}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          className="text-foreground"
        />
      </>
    ),
    number: ({ onChange, name, value, field }) => {
      const typedField = field as NumberField;
      return (
        <>
          <FieldLabel
            label={typedField.label ?? name}
            icon={typedField.labelIcon}
          />
          <div className="mt-4 mb-8">
            <Slider
              defaultValue={[value]}
              min={typedField.min}
              max={typedField.max}
              step={typedField.step}
              onValueChange={(changedValue) => {
                onChange(changedValue[0]);
              }}
            />
          </div>
        </>
      );
    },
    select: ({ onChange, name, value, field }) => {
      const typedField = field as SelectField;
      return (
        <>
          <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
          <Select
            onValueChange={(selectValue) => {
              onChange(selectValue);
            }}
            defaultValue={value as string}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz opcję" />
            </SelectTrigger>
            <SelectContent>
              {typedField.options.map((option) => (
                <SelectItem
                  key={option.value as string}
                  // eslint-disable-next-line @typescript-eslint/no-base-to-string
                  value={option.value?.toString() ?? ""}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      );
    },
    textarea: ({ onChange, name, value, field }) => (
      <>
        <FieldLabel label={field.label ?? name} icon={field.labelIcon} />
        <Textarea
          value={value as string}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          className="text-foreground"
        />
      </>
    ),
  },
};
