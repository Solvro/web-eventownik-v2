import { useSetAtom } from "jotai";

import { AttributesForm } from "@/components/forms/event/attributes-form";
import type { EventAttribute } from "@/types/attributes";

import type { AttributeChange } from "../change-types";
import { areSettingsDirty } from "../settings-context";
import type { TabProps } from "./tab-props";

type AttributeFormData = Pick<
  EventAttribute,
  | "name"
  | "slug"
  | "type"
  | "options"
  | "showInList"
  | "order"
  | "isSensitiveData"
  | "reason"
> & { id?: number };

const toChangeData = (
  attribute: AttributeFormData,
  original?: EventAttribute,
  fallbackId?: number,
): AttributeChange["data"] => ({
  id: attribute.id ?? original?.id ?? fallbackId,
  name: attribute.name,
  slug: attribute.slug ?? original?.slug ?? null,
  type: attribute.type,
  options: attribute.options ?? original?.options ?? null,
  showInList: attribute.showInList,
  order: attribute.order ?? original?.order ?? null,
  isSensitiveData: attribute.isSensitiveData,
  reason: attribute.isSensitiveData
    ? (attribute.reason ?? original?.reason ?? null)
    : null,
});

export function Attributes({ attributes, setAttributesChanges }: TabProps) {
  const setIsDirty = useSetAtom(areSettingsDirty);

  // Track the original IDs to map form changes back to EventAttribute[]
  const originalAttributesMap = new Map(
    attributes.map((attribute, index) => [index, attribute]),
  );

  // Track changes using form callbacks
  const handleAdd = (attribute: AttributeFormData) => {
    const newAttribute = toChangeData(attribute, undefined, -Date.now());

    setAttributesChanges((previous: AttributeChange[]) => {
      const newChange: AttributeChange = {
        type: "add",
        data: newAttribute,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
    setIsDirty(true);
  };

  const handleUpdate = (index: number, attribute: AttributeFormData) => {
    if (attribute.id == null) {
      return;
    }

    const original = originalAttributesMap.get(index);
    const updatedAttribute = toChangeData(attribute, original);

    setAttributesChanges((previous: AttributeChange[]) => {
      const newChange: AttributeChange = {
        type: "update",
        data: updatedAttribute,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
    setIsDirty(true);
  };

  const handleRemove = (index: number, attribute: AttributeFormData) => {
    if (attribute.id == null) {
      return;
    }

    const original = originalAttributesMap.get(index);
    const attributeToDelete = toChangeData(attribute, original);

    setAttributesChanges((previous: AttributeChange[]) => {
      const newChange: AttributeChange = {
        type: "delete",
        data: attributeToDelete,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
    setIsDirty(true);
  };

  return (
    <AttributesForm
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
    />
  );
}
