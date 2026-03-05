"use client";

import type { CellContext } from "@tanstack/react-table";
import { useState } from "react";

import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type {
  FlattenedParticipant,
  ParticipantAttributeValueType,
} from "@/types/participant";

import { formatAttributeValue } from "../../core/utils";
import { AttributeValueInput } from "../inputs/attribute-value-input";

const IMMEDIATE_TYPES = new Set(["checkbox", "select", "multiselect", "block"]);

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

  return (
    <EditableCellInput info={info} attribute={attribute} blocks={blocks} />
  );
}

function EditableCellInput({ info, attribute, blocks }: EditableCellProps) {
  const rawValue = info.getValue();
  const stringValue = rawValue == null ? "" : String(rawValue);
  const key = attribute.id.toString();

  const [localValue, setLocalValue] = useState(stringValue);

  function updateRow(newValue: string) {
    info.table.options.meta?.updateData(info.row.index, {
      ...info.row.original,
      [key]: newValue,
    });
  }

  if (attribute.type === "file" || attribute.type === "drawing") {
    return (
      <span className="text-muted-foreground text-sm italic">
        {stringValue === "" ? "—" : "Uploaded"}
      </span>
    );
  }

  function handleChange(newValue: string) {
    setLocalValue(newValue);
    if (IMMEDIATE_TYPES.has(attribute.type)) {
      updateRow(newValue);
    }
  }

  return (
    <div
      onBlur={() => {
        if (!IMMEDIATE_TYPES.has(attribute.type)) {
          updateRow(localValue);
        }
      }}
    >
      <AttributeValueInput
        attribute={attribute}
        blocks={blocks}
        value={localValue}
        onChange={handleChange}
        idPrefix={key}
      />
    </div>
  );
}
