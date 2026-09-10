import { AttributesForm } from "@/components/forms/event/attributes-form";
import type { Attribute } from "@/types/attributes";

import type { AttributeChange } from "../change-types";
import type { TabProps } from "./tab-props";

const toChangeData = (attribute: Attribute): AttributeChange["data"] => ({
  uuid: attribute.uuid,
  name: attribute.name,
  type: attribute.type,
  showInList: attribute.showInList,
  order: attribute.order,
  config: attribute.config,
});

export function Attributes({ setAttributesChanges }: TabProps) {
  // Track changes using form callbacks
  const handleAdd = (attribute: Attribute) => {
    const newAttribute = toChangeData(attribute);

    setAttributesChanges((previous: AttributeChange[]) => {
      const newChange: AttributeChange = {
        type: "add",
        data: newAttribute,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
  };

  const handleUpdate = (_index: number, attribute: Attribute) => {
    const updatedAttribute = toChangeData(attribute);

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

  const handleRemove = (_index: number, attribute: Attribute) => {
    const attributeToDelete = toChangeData(attribute);

    setAttributesChanges((previous: AttributeChange[]) => {
      // Ignore changes for this attribute that were added before (e.g. an update followed by delete)
      const filtered = previous.filter(
        (change) => change.data.uuid !== attributeToDelete.uuid,
      );

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
