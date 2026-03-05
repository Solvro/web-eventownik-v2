"use client";

/* eslint-disable unicorn/prevent-abbreviations */
import type { CellContext } from "@tanstack/react-table";
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
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { formatAttributeValue } from "../../core/utils";

interface EditableCellProps {
  info: CellContext<FlattenedParticipant, ParticipantAttributeValueType>;
  attribute: Attribute;
  blocks: (Block | null)[];
}

export function EditableCell({ info, attribute, blocks }: EditableCellProps) {
  const isEditing = info.row.original.mode === "edit";

  if (!isEditing) {
    const formatted = formatAttributeValue(
      info.getValue(),
      attribute.type,
      attribute.id,
      blocks,
    );
    return formatted instanceof Date ? formatted.toISOString() : formatted;
  }

  const value = info.getValue();
  const stringValue = value == null ? "" : String(value);
  const key = attribute.id.toString();

  function updateRow(newValue: string) {
    info.table.options.meta?.updateData(info.row.index, {
      ...info.row.original,
      [key]: newValue,
    });
  }

  switch (attribute.type) {
    case "text": {
      return (
        <Input
          type="text"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "date": {
      const dateValue =
        stringValue === "" ? "" : format(new Date(stringValue), "yyyy-MM-dd");
      return (
        <Input
          type="date"
          defaultValue={dateValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "datetime": {
      const datetimeValue =
        stringValue === ""
          ? ""
          : format(new Date(stringValue), "yyyy-MM-dd'T'HH:mm");
      return (
        <Input
          type="datetime-local"
          defaultValue={datetimeValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "time": {
      return (
        <Input
          type="time"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "number": {
      return (
        <Input
          type="number"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
          onWheel={(e) => {
            e.currentTarget.blur();
          }}
        />
      );
    }

    case "email": {
      return (
        <Input
          type="email"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "tel": {
      return (
        <Input
          type="tel"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
          maxLength={16}
        />
      );
    }

    case "color": {
      return (
        <Input
          type="color"
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
        />
      );
    }

    case "textarea": {
      return (
        <Textarea
          defaultValue={stringValue}
          onBlur={(e) => {
            updateRow(e.target.value);
          }}
          rows={2}
        />
      );
    }

    case "checkbox": {
      return (
        <Checkbox
          checked={stringValue === "true"}
          onCheckedChange={(checked) => {
            updateRow(String(checked));
          }}
        />
      );
    }

    case "select": {
      return (
        <Select
          defaultValue={stringValue}
          onValueChange={(val) => {
            updateRow(val);
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
      const selected = stringValue === "" ? [] : stringValue.split(",");
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
                  id={`${key}-${optionValue}`}
                  checked={selected.includes(optionValue)}
                  onCheckedChange={(checked) => {
                    const next =
                      checked === true
                        ? [...selected, optionValue]
                        : selected.filter((v) => v !== optionValue);
                    updateRow(next.join(","));
                  }}
                />
                <Label
                  htmlFor={`${key}-${optionValue}`}
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
          defaultValue={stringValue}
          onValueChange={(val) => {
            updateRow(val);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {rootBlock?.children.find((b) => b.id === Number(stringValue))
                ?.name ?? stringValue}
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

    // file and drawing are read-only — no inline edit
    case "file":
    case "drawing": {
      return (
        <span className="text-muted-foreground text-sm italic">
          {stringValue === "" ? "—" : "Uploaded"}
        </span>
      );
    }
  }
}
