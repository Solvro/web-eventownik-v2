import type { V3Attribute } from "@/types/v3";

import type { NewEventAttribute } from "./types";

/** Bind v3 configuration to editable attribute controls, preserving unknown settings. */
export function attributeDraft(attribute: V3Attribute): NewEventAttribute {
  const config = attribute.config ?? {};
  const optionValues =
    attribute.type === "block" ? config.participantFields : config.options;
  const options = Array.isArray(optionValues)
    ? optionValues.filter(
        (option): option is string => typeof option === "string",
      )
    : [];
  const maxSelections =
    typeof config.maxSelections === "number" ? config.maxSelections : null;
  return {
    uuid: attribute.uuid,
    config: attribute.config,
    name: attribute.name,
    slug: attribute.uuid,
    type:
      attribute.type === "textArea"
        ? "textarea"
        : attribute.type === "multiSelect"
          ? "multiselect"
          : attribute.type,
    options,
    showInList: attribute.showInList,
    order: attribute.order,
    isSensitiveData: config.isSensitiveData === true,
    reason: typeof config.reason === "string" ? config.reason : null,
    isMultiple: maxSelections !== null && maxSelections > 1,
    maxSelections,
  };
}
