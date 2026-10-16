import { AttributesForm } from "@/components/forms/event/attributes-form";
import { attributeDraft } from "@/components/forms/event/attributes/attribute-draft";
import type { NewEventAttribute } from "@/components/forms/event/attributes/types";
import type { V3Attribute } from "@/types/v3";

import type { AttributeChange } from "../change-types";
import type { TabProps } from "./tab-props";

type AttributeFormData = NewEventAttribute;

const toChangeData = (
  attribute: AttributeFormData,
  original?: V3Attribute,
  fallbackId?: string,
): AttributeChange["data"] => ({
  ...(original === undefined ? {} : attributeDraft(original)),
  ...attribute,
  uuid: attribute.uuid ?? original?.uuid ?? fallbackId,
  config: original?.config,
});

export function Attributes({ attributes, setAttributesChanges }: TabProps) {
  // Track the original IDs to map form changes back to EventAttribute[]
  const originalAttributesMap = new Map(
    attributes.map((attribute) => [attribute.uuid, attribute]),
  );

  // Track changes using form callbacks
  const handleAdd = (attribute: AttributeFormData) => {
    const newAttribute = toChangeData(
      attribute,
      undefined,
      `-${crypto.randomUUID()}`,
    );

    setAttributesChanges((previous: AttributeChange[]) => {
      const newChange: AttributeChange = {
        type: "add",
        data: newAttribute,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
  };

  const handleUpdate = (_index: number, attribute: AttributeFormData) => {
    const original = originalAttributesMap.get(attribute.uuid ?? "");
    const updatedAttribute = toChangeData(attribute, original);

    setAttributesChanges((previous: AttributeChange[]) => {
      const existing = previous.find(
        (change) => change.data.uuid === updatedAttribute.uuid,
      );

      if (existing?.type === "delete") {
        return previous;
      }

      const filtered = previous.filter(
        (change) => change.data.uuid !== updatedAttribute.uuid,
      );

      const newChange: AttributeChange = {
        type: existing?.type === "add" ? "add" : "update",
        data: updatedAttribute,
        timestamp: Date.now(),
      };
      return [...filtered, newChange];
    });
  };

  const handleRemove = (_index: number, attribute: AttributeFormData) => {
    const original = originalAttributesMap.get(attribute.uuid ?? "");
    const attributeToDelete = toChangeData(attribute, original);

    setAttributesChanges((previous: AttributeChange[]) => {
      // Ignore changes for this attribute that were added before (e.g. an update followed by delete)
      const filtered = previous.filter(
        (change) => change.data.uuid !== attributeToDelete.uuid,
      );

      // If the attribute was newly added and then removed
      if (
        attributeToDelete.uuid == null ||
        attributeToDelete.uuid.startsWith("-")
      ) {
        return filtered;
      }

      const newChange: AttributeChange = {
        type: "delete",
        data: attributeToDelete,
        timestamp: Date.now(),
      };
      return [...filtered, newChange];
    });
  };

  return (
    <AttributesForm
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
    />
  );
}
