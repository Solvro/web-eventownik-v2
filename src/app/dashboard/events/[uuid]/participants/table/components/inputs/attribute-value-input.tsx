"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { attributeIsMultiple, attributeOptions } from "@/lib/attribute-config";
import { multiValues } from "@/lib/multi-values";
import type { AttributeOption } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { V3Attribute as Attribute } from "@/types/v3";

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
}: AttributeValueInputProps) {
  type MultiOption = AttributeOption | Block;
  const t = useTranslations("Table");

  function resolveMultiOption(option: MultiOption): {
    value: string;
    label: string;
  } {
    if (typeof option === "string") {
      return { value: option, label: option };
    }

    if ("uuid" in option) {
      return { value: option.uuid, label: option.name };
    }

    return { value: option.value, label: option.label };
  }

  function renderMultiOptions(options: MultiOption[] | undefined | null) {
    const selected = multiValues(value);
    const resolvedOptions = (options ?? []).map((option) => {
      const resolved = resolveMultiOption(option);
      return { label: resolved.label, value: resolved.value };
    });

    return (
      <MultiSelect
        maxCount={2}
        options={resolvedOptions}
        defaultValue={selected}
        onValueChange={(next) => {
          onChange(JSON.stringify(next));
        }}
      />
    );
  }

  switch (attribute.type) {
    case "text": {
      return (
        <Input
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
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
          aria-label={attribute.name}
          type="color"
          value={value === "" ? "#000000" : value}
          onChange={(event_) => {
            onChange(event_.target.value);
          }}
        />
      );
    }

    case "textArea": {
      return (
        <Textarea
          aria-label={attribute.name}
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
          aria-label={attribute.name}
          checked={value === "true"}
          onCheckedChange={(checked) => {
            onChange(String(checked));
          }}
        />
      );
    }

    case "select": {
      if (attributeIsMultiple(attribute)) {
        return renderMultiOptions(attributeOptions(attribute));
      }

      return (
        <Select
          value={value}
          onValueChange={(value_) => {
            onChange(value_);
          }}
        >
          <SelectTrigger aria-label={attribute.name}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">{t("none")}</SelectItem>
            {attributeOptions(attribute).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "multiSelect": {
      return renderMultiOptions(attributeOptions(attribute));
    }

    case "block": {
      const rootBlock =
        blocks.find((b) => b?.attributeUuid === attribute.uuid) ?? null;

      if (attributeIsMultiple(attribute)) {
        return renderMultiOptions(rootBlock?.children);
      }

      const selectedBlock = rootBlock?.children.find(
        (block) => block.uuid === value,
      );

      return (
        <Select
          value={multiValues(value)[0] ?? " "}
          onValueChange={(value_) => {
            onChange(value_);
          }}
        >
          <SelectTrigger aria-label={attribute.name}>
            <SelectValue>{selectedBlock?.name ?? t("none")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">{t("none")}</SelectItem>
            {rootBlock?.children.map((block) => (
              <SelectItem key={block.uuid} value={block.uuid}>
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
