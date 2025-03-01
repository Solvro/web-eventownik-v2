import { useState } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Attribute } from "@/types/attributes";

export function AttributeInput({
  attribute,
  initialValue,
  field,
}: {
  attribute: Attribute;
  initialValue: string | number | boolean | Date | null;
  field: ControllerRenderProps<FieldValues, string>;
}) {
  const [newValue, setNewValue] = useState<
    string | number | boolean | Date | null
  >(initialValue);
  switch (attribute.type) {
    case "text": {
      return <Input type="text" {...field} />;
    }
    case "number": {
      return <Input type="number" {...field} />;
    }
    case "datetime": {
      throw new Error('Not implemented yet: "datetime" case');
    }
    case "select": {
      return (
        <Select
          defaultValue={initialValue as string}
          onValueChange={(value) => {
            setNewValue(value);
          }}
          {...field}
        >
          <SelectTrigger>
            <SelectValue>{newValue as string}</SelectValue>
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
      return (
        <Input defaultValue={initialValue as string} type="email" {...field} />
      );
    }
    case "time": {
      throw new Error('Not implemented yet: "time" case');
    }
    case "color": {
      throw new Error('Not implemented yet: "color" case');
    }
    case "checkbox": {
      throw new Error('Not implemented yet: "checkbox" case');
    }
    case "tel": {
      throw new Error('Not implemented yet: "tel" case');
    }
    case "date": {
      throw new Error('Not implemented yet: "date" case');
    }
    case "file": {
      throw new Error('Not implemented yet: "file" case');
    }
    case "block": {
      throw new Error('Not implemented yet: "block" case');
    }
  }
}
