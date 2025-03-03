import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Attribute } from "@/types/attributes";

export function AttributeInput({
  attribute,
  field,
}: {
  attribute: Attribute;
  field: ControllerRenderProps<FieldValues, string>;
}) {
  //TODO add lacking implementation for block type
  switch (attribute.type) {
    case "text": {
      return <Input type="text" {...field} />;
    }
    case "number": {
      return <Input type="number" {...field} />;
    }
    case "datetime": {
      return <Input type="datetime-local" {...field} />;
    }
    case "select": {
      return (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value as string}
          {...field}
        >
          <SelectTrigger>
            <SelectValue {...field}> {field.value as string}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {attribute.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    case "email": {
      return <Input type="email" {...field} />;
    }
    case "time": {
      return <Input type="time" {...field} />;
    }
    // case "color": {
    //   return <Input type="color" className="h-16 w-full" {...field} />;
    // }
    // Temporary use textarea for color input
    case "color": {
      return <Textarea rows={3} {...field} />;
    }
    case "checkbox": {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={field.value === "true" || field.value === true}
            onCheckedChange={(checked) => {
              field.onChange(checked);
            }}
          />
          {/*<Label htmlFor={field.name}>{attribute.label || field.name}</Label>*/}
        </div>
      );
    }
    case "tel": {
      return <Input type="tel" {...field} />;
    }
    case "date": {
      return <Input type="date" {...field} />;
    }
    case "file": {
      return <Input type="file" {...field} />;
    }
    case "block": {
      throw new Error('Not implemented yet: "block" case');
    }
  }
}
