"use client";

/* eslint-disable unicorn/prevent-abbreviations */
import type { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { formatAttributeValue } from "../../core/utils";
import { DownloadAttributeFileButton } from "../buttons/download-file-attribute-button";
import { DrawingPreviewButton } from "../buttons/drawing-preview-button";
import { AttributeValueInput } from "../inputs/attribute-value-input";

const IMMEDIATE_TYPES = new Set(["checkbox", "select", "multiselect", "block"]);

interface EditableCellProps {
  info: CellContext<FlattenedParticipant, ParticipantAttributeValueType>;
  attribute?: Attribute;
  blocks?: (Block | null)[];
}

export function EditableCell({
  info,
  attribute,
  blocks = [],
}: EditableCellProps) {
  const isEditing = info.row.original.mode === "edit";
  const rawValue = info.getValue();

  if (!isEditing) {
    if (attribute != null) {
      const hasValue =
        rawValue !== undefined && rawValue !== null && rawValue !== "";

      if (hasValue && attribute.type === "file") {
        return (
          <DownloadAttributeFileButton
            attribute={attribute}
            eventId={info.table.options.meta?.eventId ?? ""}
            participant={info.row.original}
          />
        );
      }

      if (hasValue && attribute.type === "drawing") {
        return (
          <DrawingPreviewButton
            attribute={attribute}
            eventId={info.table.options.meta?.eventId ?? ""}
            participant={info.row.original}
          />
        );
      }

      const formatted = formatAttributeValue(
        info.getValue(),
        attribute.type,
        attribute.id,
        blocks,
      );
      return formatted instanceof Date ? formatted.toISOString() : formatted;
    }

    return rawValue == null ? "" : String(rawValue);
  }

  return (
    <EditableCellInput info={info} attribute={attribute} blocks={blocks} />
  );
}

function EditableCellInput({
  info,
  attribute,
  blocks = [],
}: EditableCellProps) {
  const t = useTranslations("Table");

  const rawValue = info.getValue();
  const stringValue = rawValue == null ? "" : String(rawValue);
  const key = attribute == null ? info.column.id : attribute.id.toString();

  const [localValue, setLocalValue] = useState(stringValue);

  function updateRow(newValue: string) {
    info.table.options.meta?.updateData(info.row.index, {
      ...info.row.original,
      [key]: newValue,
    });
  }

  if (
    attribute != null &&
    (attribute.type === "file" || attribute.type === "drawing")
  ) {
    return (
      <span className="text-muted-foreground text-sm italic">
        {stringValue === "" ? "—" : t("uploaded")}
      </span>
    );
  }

  const isImmediate =
    attribute == null ? false : IMMEDIATE_TYPES.has(attribute.type);

  function handleChange(newValue: string) {
    setLocalValue(newValue);
    if (isImmediate) {
      updateRow(newValue);
    }
  }

  return (
    <div
      onBlur={() => {
        if (!isImmediate) {
          updateRow(localValue);
        }
      }}
    >
      {attribute == null ? (
        <Input
          value={localValue}
          onChange={(e) => {
            handleChange(e.target.value);
          }}
        />
      ) : (
        <AttributeValueInput
          attribute={attribute}
          blocks={blocks}
          value={localValue}
          onChange={handleChange}
          idPrefix={key}
        />
      )}
    </div>
  );
}
