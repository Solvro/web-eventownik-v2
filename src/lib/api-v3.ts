/** Builds v3 write payloads from local editor state. */
type JsonObject = Record<string, unknown>;

export function object(value: unknown): JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

export function attributePayload(
  attribute: JsonObject,
  references: ReadonlyMap<string, string> = new Map(),
) {
  const { name, showInList, order } = attribute;
  const type =
    attribute.type === "textarea"
      ? "textArea"
      : attribute.type === "multiselect"
        ? "multiSelect"
        : attribute.type;
  const config = { ...object(attribute.config) };
  if (typeof attribute.isSensitiveData === "boolean") {
    config.isSensitiveData = attribute.isSensitiveData;
    config.reason = attribute.isSensitiveData ? attribute.reason : null;
  }
  if (type === "select" || type === "multiSelect") {
    config.options = Array.isArray(attribute.options)
      ? attribute.options.map((option) =>
          typeof option === "string" ? option : object(option).value,
        )
      : [];
  }
  if (type === "block") {
    if (Array.isArray(attribute.options)) {
      config.participantFields = attribute.options.map((option) => {
        const field =
          typeof option === "string" ? option : String(object(option).value);
        return references.get(field) ?? field;
      });
    }
    config.maxSelections =
      attribute.isMultiple === false ? 1 : (attribute.maxSelections ?? 1);
  }
  if (type === "multiSelect") {
    if (
      typeof attribute.maxSelections === "number" &&
      attribute.maxSelections > 0
    ) {
      config.maxSelections = attribute.maxSelections;
    } else {
      delete config.maxSelections;
    }
  }
  return { name, type, showInList, order: order ?? 0, config };
}

export function emailPayload(value: {
  trigger: string;
  triggerValue: string | null;
  triggerValue2?: string | null;
  schema: string | null;
  content?: string;
}) {
  const { triggerValue, triggerValue2, schema, ...rest } = value;
  return {
    ...rest,
    content: value.content?.replaceAll(
      /<span\b[^>]*\bdata-id="(\/(?:participant|form|event)_[a-zA-Z0-9_-]+)"[^>]*>[\s\S]*?<\/span>/gu,
      '<span data-id="$1"></span>',
    ),
    trigger: value.trigger.toUpperCase(),
    triggerConfig:
      value.trigger === "form_filled"
        ? { formUuid: triggerValue }
        : value.trigger === "attribute_changed"
          ? { attributeUuid: triggerValue, expectedValue: triggerValue2 }
          : null,
    schema: schema === null ? null : (JSON.parse(schema) as unknown),
  };
}

export function attributeValue(type: string, value: unknown): unknown {
  if (value === "" || value === undefined || value === null) {
    return null;
  }
  if (type === "number") {
    return typeof value === "number" ? value : Number(value);
  }
  if (type === "checkbox") {
    return value === true || value === "true";
  }
  if (type === "block" || type === "multiSelect" || type === "multiselect") {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string" && value.startsWith("[")) {
      return JSON.parse(value) as unknown;
    }
    return [value];
  }
  return value;
}
