"use client";

import { format } from "date-fns";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";

interface AttributeValueInputProps {
  attribute: Attribute;
  blocks: (Block | null)[];
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
}

export function AttributeValueInput({
  attribute,
  blocks,
  value,
  onChange,
  idPrefix = attribute.id.toString(),
}: AttributeValueInputProps) {
  switch (attribute.type) {
    case "text": {
      return (
        <Input
          type="text"
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "number": {
      return (
        <Input
          type="number"
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
          onWheel={(event_) => {
            event_.currentTarget.blur();
          }}
        />
      );
    }

    case "email": {
      return (
        <Input
          type="email"
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "tel": {
      return (
        <Input
          type="tel"
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
          maxLength={16}
        />
      );
    }

    case "date": {
      const dateValue =
        value === "" ? "" : format(new Date(value), "yyyy-MM-dd");
      return (
        <Input
          type="date"
          value={dateValue}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "datetime": {
      const datetimeValue =
        value === "" ? "" : format(new Date(value), "yyyy-MM-dd'T'HH:mm");
      return (
        <Input
          type="datetime-local"
          value={datetimeValue}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "time": {
      return (
        <Input
          type="time"
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "color": {
      return (
        <Input
          type="color"
          value={value === "" ? "#000000" : value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "textarea": {
      return (
        <Textarea
          value={value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
          rows={2}
        />
      );
    }

    case "checkbox": {
      return (
        <Checkbox
          checked={value === "true"}
          onCheckedChange={(checked) => {
            onChange(String(checked));
          }}
        />
      );
    }

    case "select": {
      return (
        <Select
          value={value}
          onValueChange={(value_) => {
            onChange(value_);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Brak</SelectItem>
            {attribute.options?.map((option) => (
              <SelectItem
                key={typeof option === "string" ? option : option.value}
                value={typeof option === "string" ? option : option.value}
              >
                {typeof option === "string" ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "multiselect": {
      const selected = value === "" ? [] : value.split(",");
      return (
        <div className="flex flex-col gap-1">
          {attribute.options?.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;
            const optionLabel =
              typeof option === "string" ? option : option.label;
            return (
              <div key={optionValue} className="flex items-center gap-1.5">
                <Checkbox
                  id={`${idPrefix}-${optionValue}`}
                  checked={selected.includes(optionValue)}
                  onCheckedChange={(checked) => {
                    const next =
                      checked === true
                        ? [...selected, optionValue]
                        : selected.filter((v) => v !== optionValue);
                    onChange(next.join(","));
                  }}
                />
                <Label
                  htmlFor={`${idPrefix}-${optionValue}`}
                  className="text-sm font-normal"
                >
                  {optionLabel}
                </Label>
              </div>
            );
          })}
        </div>
      );
    }

    case "block": {
      const rootBlock =
        blocks.find((b) => b?.attributeId === attribute.id) ?? null;
      return (
        <Select
          value={value}
          onValueChange={(value_) => {
            onChange(value_);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {rootBlock?.children.find((b) => b.id === Number(value))?.name ??
                value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Brak</SelectItem>
            {rootBlock?.children.map((block) => (
              <SelectItem key={block.id} value={block.id.toString()}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "file":
    case "drawing": {
      return null;
    }
  }
}
